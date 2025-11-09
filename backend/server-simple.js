const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const { sendEmail, emailTemplates } = require('./config/email');
const stockManager = require('./utils/stockManager');
const cronJobs = require('./services/cronJobs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// DATABASE INITIALIZATION
// ==========================================

// Garantir que a tabela payments existe
async function ensurePaymentsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(255) UNIQUE NOT NULL,
        order_id INT NOT NULL,
        user_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM(
          'paypal', 
          'mpesa', 
          'card', 
          'bank_transfer', 
          'cash_on_delivery'
        ) NOT NULL,
        status ENUM('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
        gateway_response TEXT NULL,
        receipt_url VARCHAR(500) NULL,
        receipt_uploaded_at TIMESTAMP NULL,
        receipt_verified_by INT NULL,
        receipt_verified_at TIMESTAMP NULL,
        payment_code VARCHAR(100) NULL,
        phone_number VARCHAR(20) NULL,
        metadata JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (receipt_verified_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_order_id (order_id),
        INDEX idx_status (status),
        INDEX idx_payment_method (payment_method),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Adicionar colunas na tabela orders se não existirem
    try {
      await pool.execute(`ALTER TABLE orders ADD COLUMN payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending'`);
    } catch (e) {
      // Coluna já existe, ignorar
      if (!e.message.includes('Duplicate column name') && !e.message.includes('already exists')) {
        console.log('⚠️ [DATABASE] Info sobre payment_status:', e.message);
      }
    }
    
    try {
      await pool.execute(`ALTER TABLE orders ADD COLUMN payment_id INT NULL`);
    } catch (e) {
      // Coluna já existe, ignorar
      if (!e.message.includes('Duplicate column name') && !e.message.includes('already exists')) {
        console.log('⚠️ [DATABASE] Info sobre payment_id:', e.message);
      }
    }
    
    // Não tentar adicionar FOREIGN KEY aqui, pois pode já existir e causar problemas
    // A FK será criada manualmente se necessário
    
    console.log('✅ [DATABASE] Tabela payments verificada/criada');
  } catch (error) {
    console.error('❌ [DATABASE] Erro ao criar tabela payments:', error.message);
  }
}

// Garantir que a tabela abandoned_carts existe
async function ensureAbandonedCartsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS abandoned_carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        session_id VARCHAR(255),
        email VARCHAR(255),
        cart_items JSON NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email_sent_count INT DEFAULT 0,
        recovered BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_last_activity (last_activity),
        INDEX idx_recovered (recovered),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ [DATABASE] Tabela abandoned_carts verificada/criada');
  } catch (error) {
    console.error('❌ [DATABASE] Erro ao criar tabela abandoned_carts:', error.message);
  }
}

// Executar ao iniciar o servidor
ensurePaymentsTable();
ensureUsersTableColumns();
ensureCouponsTable();
ensureReviewsTable();
ensureAbandonedCartsTable();

// Inicializar A/B Testing
const abTesting = require('./services/abTestingService');
abTesting.ensureABTestTable();

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Função para enviar notificação SMS/WhatsApp (simulado)
async function sendSMSNotification(phone, message) {
  try {
    console.log(`📱 [SMS] Enviando para ${phone}: ${message}`);
    
    // TODO: Integrar com API real de SMS/WhatsApp
    // Por enquanto, apenas log
    // Exemplos de serviços:
    // - Twilio (SMS/WhatsApp)
    // - WhatsApp Business API
    // - SMS Moçambique (serviços locais)
    
    return { success: true, message: 'Notificação simulada (log apenas)' };
  } catch (error) {
    console.error('❌ [SMS] Erro ao enviar:', error);
    return { success: false, error: error.message };
  }
}

// Função para notificar admin sobre novo pedido
async function notifyAdminNewOrder(orderId, orderTotal, customerName) {
  try {
    // Buscar email do admin
    const [admins] = await pool.execute(
      "SELECT email FROM users WHERE role = 'admin' LIMIT 1"
    );
    
    if (admins.length > 0) {
      const adminEmail = admins[0].email;
      
      // Enviar email para admin
      try {
        await sendEmail(adminEmail, emailTemplates.orderConfirmation, {
          id: orderId,
          total: orderTotal,
          status: 'Novo pedido recebido',
          customMessage: `Novo pedido #${orderId} recebido de ${customerName || 'Cliente'}. Total: ${orderTotal} MZN.`
        });
        console.log(`✅ [ADMIN] Notificação enviada para ${adminEmail}`);
      } catch (emailError) {
        console.log('⚠️ [ADMIN] Email não enviado:', emailError.message);
      }
    }
  } catch (error) {
    console.error('❌ [ADMIN] Erro ao notificar admin:', error);
    // Não bloquear se falhar
  }
}

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos de uploads
const fs = require('fs');
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log middleware para debug
app.use((req, res, next) => {
  if (req.path.startsWith('/api/orders')) {
    console.log(`📡 [REQ] ${req.method} ${req.path}`, {
      query: req.query,
      params: req.params,
      bodyKeys: req.body ? Object.keys(req.body) : []
    });
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.path.includes('/auth/login')) {
    console.log(`   Body:`, { email: req.body?.email });
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Papel & Pixel Backend API is running! 🚀',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments'
    }
  });
});

// ==========================================
// MIDDLEWARES (Definir ANTES das rotas)
// ==========================================

// Middleware de autenticação simplificado
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('🔐 [AUTH] Token decodificado:', decoded);
      
      req.user = {
        id: decoded.userId || decoded.id,
        userId: decoded.userId || decoded.id, // Garantir ambos
        email: decoded.email,
        role: decoded.role
      };
      
      console.log('🔐 [AUTH] req.user criado:', req.user);
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro de autenticação' });
  }
};

const isAdmin = async (req, res, next) => {
  console.log('🔐 [AUTH] Verificando acesso admin...');
  console.log('🔐 [AUTH] req.user:', req.user);
  console.log('🔐 [AUTH] req.user?.role:', req.user?.role);
  
  if (!req.user) {
    console.error('❌ [AUTH] req.user não existe');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  
  // Se o role do token não for admin, verificar no banco (para garantir)
  if (req.user?.role !== 'admin') {
    try {
      console.log('⚠️ [AUTH] Role do token não é admin, verificando no banco...');
      const [users] = await pool.execute(
        'SELECT id, role FROM users WHERE id = ?',
        [req.user.id || req.user.userId]
      );
      
      if (users.length > 0 && users[0].role === 'admin') {
        console.log('✅ [AUTH] Role confirmado no banco como admin');
        req.user.role = 'admin'; // Atualizar req.user com role correto
        return next();
      }
      
      console.error('❌ [AUTH] Acesso negado. Role do banco:', users[0]?.role, 'Esperado: admin');
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores.',
        userRole: req.user?.role || users[0]?.role,
        userId: req.user?.id || req.user?.userId
      });
    } catch (dbError) {
      console.error('❌ [AUTH] Erro ao verificar role no banco:', dbError);
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores.',
        userRole: req.user?.role,
        userId: req.user?.id
      });
    }
  }
  
  console.log('✅ [AUTH] Acesso admin autorizado');
  next();
};

// ==========================================
// AUTH ROUTES
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    // Verificar se email já existe
    const [existing] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    // Buscar usuário criado
    const [newUser] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [result.insertId]
    );

    // Criar token
    const token = jwt.sign(
      { userId: newUser[0].id, email: newUser[0].email, role: newUser[0].role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      user: newUser[0],
      token,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 [LOGIN] Requisição recebida:', { email: req.body?.email, time: new Date().toISOString() });
  
  try {
    const { email, password } = req.body;

    console.log('🔐 [LOGIN] Validando campos...');
    
    if (!email || !password) {
      console.log('❌ [LOGIN] Campos faltando');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');

    console.log('🔐 [LOGIN] Buscando usuário no banco...');
    
    // Buscar usuário com timeout
    let users;
    try {
      const queryPromise = pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      // Timeout de 5 segundos para a query
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );
      
      [users] = await Promise.race([queryPromise, timeoutPromise]);
      console.log('🔐 [LOGIN] Usuários encontrados:', users.length);
    } catch (dbError) {
      console.error('❌ [LOGIN] Erro ao consultar banco:');
      console.error('   Code:', dbError.code);
      console.error('   Message:', dbError.message);
      console.error('   Full error:', dbError);
      
      let errorMessage = 'Erro ao conectar com o banco de dados';
      if (dbError.code === 'ECONNREFUSED') {
        errorMessage = 'Servidor MySQL não está respondendo. Verifique se o MySQL está rodando.';
      } else if (dbError.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout ao conectar com o MySQL.';
      } else if (dbError.message === 'Query timeout') {
        errorMessage = 'A consulta demorou muito para responder.';
      }
      
      return res.status(500).json({ error: errorMessage });
    }

    if (users.length === 0) {
      console.log('❌ [LOGIN] Usuário não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];
    
    // Verificar se conta está bloqueada
    if (user.status === 'blocked') {
      console.log('🚫 [LOGIN] Tentativa de login de conta bloqueada:', user.email);
      return res.status(403).json({ 
        error: 'Conta bloqueada',
        message: user.block_reason || 'Sua conta está temporariamente bloqueada. Entre em contato com o administrador para saber os motivos.',
        blocked: true
      });
    }
    
    // Verificar se conta está inativa
    if (user.status === 'inactive') {
      console.log('⚠️ [LOGIN] Tentativa de login de conta inativa:', user.email);
      return res.status(403).json({ 
        error: 'Conta inativa',
        message: 'Sua conta está inativa. Entre em contato com o administrador para reativá-la.',
        inactive: true
      });
    }
    
    console.log('🔐 [LOGIN] Verificando senha...');

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    
    console.log('🔐 [LOGIN] Senha válida:', validPassword);
    
    if (!validPassword) {
      console.log('❌ [LOGIN] Senha inválida');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('🔐 [LOGIN] Criando token...');

    // Criar token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('✅ [LOGIN] Login bem-sucedido para:', user.email);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ [LOGIN] Erro completo:', error);
    console.error('❌ [LOGIN] Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me - Obter usuário atual (verificar token)
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    console.log('🔐 [AUTH/ME] req.user:', req.user);
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('❌ [AUTH] Erro ao verificar token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// ==========================================
// PASSWORD RESET ROUTES
// ==========================================

const crypto = require('crypto');

// POST /api/auth/password-reset/request - Solicitar recuperação de senha
app.post('/api/auth/password-reset/request', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      // Por segurança, não revelar se email existe ou não
      return res.json({ 
        success: true, 
        message: 'Se o email existir, você receberá instruções' 
      });
    }
    
    const user = users[0];
    
    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora
    
    // Criar tabela se não existir
    try {
      console.log('📝 [PASSWORD RESET] Criando tabela se não existir...');
      await pool.execute(
        `CREATE TABLE IF NOT EXISTS password_resets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          token VARCHAR(255) UNIQUE,
          expires_at TIMESTAMP,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
      );
      console.log('✅ [PASSWORD RESET] Tabela verificada/criada');
      
      // Remover tokens expirados ou usados deste usuário
      const [deleted] = await pool.execute(
        'DELETE FROM password_resets WHERE user_id = ? AND (expires_at < NOW() OR used = TRUE)',
        [user.id]
      );
      console.log(`🧹 [PASSWORD RESET] Tokens antigos removidos: ${deleted.affectedRows || 0}`);
      
      // Inserir novo token
      console.log('💾 [PASSWORD RESET] Inserindo token no banco...', {
        user_id: user.id,
        token_length: token.length,
        expires_at: expiresAt
      });
      
      const [insertResult] = await pool.execute(
        'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );
      
      console.log('✅ [PASSWORD RESET] Token salvo com sucesso! ID:', insertResult.insertId);
      
      // Verificar se foi salvo
      const [verify] = await pool.execute(
        'SELECT * FROM password_resets WHERE id = ?',
        [insertResult.insertId]
      );
      console.log('🔍 [PASSWORD RESET] Token verificado no banco:', verify.length > 0 ? 'SIM' : 'NÃO');
      
    } catch (error) {
      console.error('❌ [PASSWORD RESET] Erro ao salvar token:', error);
      console.error('❌ [PASSWORD RESET] Stack:', error.stack);
      console.error('❌ [PASSWORD RESET] Código do erro:', error.code);
      // NÃO continuar se der erro - é crítico!
      return res.status(500).json({ 
        error: 'Erro ao processar solicitação de recuperação de senha',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Enviar email (se configurado)
    // Garantir que FRONTEND_URL não seja undefined
    let frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl || frontendUrl === 'undefined' || frontendUrl.trim() === '') {
      frontendUrl = 'http://127.0.0.1:8080';
      console.warn('⚠️ [PASSWORD RESET] FRONTEND_URL não definido, usando fallback:', frontendUrl);
    }
    
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    
    console.log('📧 [PASSWORD RESET] Preparando envio de email...', {
      to: user.email,
      frontendUrl: frontendUrl,
      resetLink: resetLink.substring(0, 80) + '...'
    });
    
    // Tentar enviar email
    let emailSent = false;
    let emailError = null;
    try {
      const emailService = require('./config/email');
      
      // Verificar configuração do email
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      
      console.log('📧 [PASSWORD RESET] Verificando configuração de email...');
      console.log('📧 [PASSWORD RESET] EMAIL_USER:', emailUser ? `${emailUser.substring(0, 5)}...` : 'NÃO CONFIGURADO');
      console.log('📧 [PASSWORD RESET] EMAIL_PASS:', emailPass ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
      
      if (!emailUser || !emailPass) {
        console.error('❌ [PASSWORD RESET] Email NÃO configurado! Configure EMAIL_USER e EMAIL_PASS no arquivo .env');
        emailError = 'Email não configurado. Configure EMAIL_USER e EMAIL_PASS no .env';
      } else if (emailService && emailService.sendEmail && emailService.emailTemplates) {
        console.log('📧 [PASSWORD RESET] Serviço de email encontrado, enviando para:', user.email);
        
        const emailResult = await emailService.sendEmail(
          user.email,
          emailService.emailTemplates.passwordReset,
          { 
            name: user.name || 'Cliente',
            resetLink: resetLink,
            token: token,
            email: email
          }
        );
        
        console.log('📧 [PASSWORD RESET] Resultado do envio:', JSON.stringify(emailResult, null, 2));
        
        if (emailResult && emailResult.success) {
          emailSent = true;
          console.log('✅ [PASSWORD RESET] Email enviado com sucesso para:', user.email);
          console.log('✅ [PASSWORD RESET] MessageId:', emailResult.messageId);
        } else {
          emailError = emailResult?.error || 'Erro desconhecido';
          console.error('❌ [PASSWORD RESET] Email NÃO foi enviado:', emailError);
          console.error('❌ [PASSWORD RESET] Detalhes:', emailResult);
        }
      } else {
        emailError = 'Serviço de email não disponível';
        console.error('❌ [PASSWORD RESET] Serviço de email não disponível');
      }
    } catch (emailErrorException) {
      emailError = emailErrorException.message;
      console.error('❌ [PASSWORD RESET] ERRO ao enviar email:', emailErrorException.message);
      console.error('❌ [PASSWORD RESET] Stack completo:', emailErrorException.stack);
      console.error('❌ [PASSWORD RESET] Tipo do erro:', emailErrorException.name);
    }
    
    // Sempre retornar sucesso, mas incluir token apenas em desenvolvimento
    const response = {
      success: true,
      message: emailSent 
        ? 'Email com instruções enviado! Verifique sua caixa de entrada.'
        : 'Instruções geradas. ' + (process.env.NODE_ENV === 'development' ? 'Veja o console para o link.' : 'Verifique se o email está configurado.')
    };
    
    // Se email não foi enviado, incluir informações para debug
    if (!emailSent && emailError) {
      console.error('📧 [PASSWORD RESET] ==========================================');
      console.error('📧 [PASSWORD RESET] PROBLEMA NO ENVIO DE EMAIL:');
      console.error('📧 [PASSWORD RESET] Erro:', emailError);
      console.error('📧 [PASSWORD RESET] ==========================================');
      response.emailError = emailError;
    }
    
    // Em desenvolvimento ou se email falhou, sempre retornar link para testes
    if (process.env.NODE_ENV === 'development' || !emailSent) {
      response.token = token;
      response.resetLink = resetLink;
      console.log('🔑 [PASSWORD RESET] ==========================================');
      console.log('🔑 [PASSWORD RESET] LINK DE RESET (para teste):');
      console.log('🔑 [PASSWORD RESET]', resetLink);
      console.log('🔑 [PASSWORD RESET] ==========================================');
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ [PASSWORD RESET] Erro:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// POST /api/auth/password-reset/validate-token - Validar token
app.post('/api/auth/password-reset/validate-token', async (req, res) => {
  try {
    const { token, email } = req.body;
    
    if (!token || !email) {
      return res.json({ valid: false });
    }
    
    // Validar token no banco de dados
    try {
      const [users] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.json({ valid: false });
      }
      
      const [tokens] = await pool.execute(
        `SELECT * FROM password_resets 
         WHERE token = ? AND user_id = ? AND used = FALSE AND expires_at > NOW()`,
        [token, users[0].id]
      );
      
      res.json({ valid: tokens.length > 0 });
    } catch (error) {
      // Se tabela não existir, validar apenas formato
      res.json({ valid: token && token.length === 64 });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao validar token' });
  }
});

// POST /api/auth/password-reset/reset - Redefinir senha
app.post('/api/auth/password-reset/reset', async (req, res) => {
  try {
    const { token, email, password } = req.body;
    
    if (!token || !email || !password) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    // Validar senha forte
    if (password.length < 8) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 8 caracteres' });
    }
    
    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const user = users[0];
    
    // Validar token no banco de dados
    try {
      const [tokens] = await pool.execute(
        `SELECT * FROM password_resets 
         WHERE token = ? AND user_id = ? AND used = FALSE AND expires_at > NOW()`,
        [token, user.id]
      );
      
      if (tokens.length === 0) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }
      
      // Marcar token como usado
      await pool.execute(
        'UPDATE password_resets SET used = TRUE WHERE token = ?',
        [token]
      );
    } catch (error) {
      // Se tabela não existir, validar apenas formato
      console.warn('⚠️ [PASSWORD RESET] Tabela não encontrada, validando formato');
      if (!token || token.length !== 64) {
        return res.status(400).json({ error: 'Token inválido' });
      }
    }
    
    // Hash da nova senha
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Atualizar senha
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('✅ [PASSWORD RESET] Senha redefinida para:', email);
    
    res.json({ 
      success: true, 
      message: 'Senha redefinida com sucesso!' 
    });
    
  } catch (error) {
    console.error('❌ [PASSWORD RESET] Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// ==========================================
// PRODUCTS ROUTES
// ==========================================

// GET /api/products/categories - Listar categorias (ANTES de /:id)
app.get('/api/products/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(rows.map(r => r.category));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products ORDER BY created_at DESC');
    
    // Parse images do JSON e adicionar avaliações
    const products = await Promise.all(rows.map(async (product) => {
      // Parse images
      if (product.images) {
        try {
          product.images = JSON.parse(product.images);
        } catch (e) {
          console.warn('⚠️ [GET PRODUCTS] Erro ao parsear images:', e);
          product.images = [];
        }
      } else {
        product.images = [];
      }
      
      // Buscar avaliações do produto
      try {
        const [reviewStats] = await pool.execute(
          `SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as total_reviews
          FROM reviews 
          WHERE product_id = ?`,
          [product.id]
        );
        
        if (reviewStats[0]) {
          product.avg_rating = reviewStats[0].avg_rating ? parseFloat(reviewStats[0].avg_rating) : 0;
          product.total_reviews = reviewStats[0].total_reviews || 0;
        } else {
          product.avg_rating = 0;
          product.total_reviews = 0;
        }
      } catch (reviewError) {
        console.warn('⚠️ [GET PRODUCTS] Erro ao buscar avaliações:', reviewError);
        product.avg_rating = 0;
        product.total_reviews = 0;
      }
      
      return product;
    }));
    
    // Log para debug das imagens
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('📦 [GET PRODUCTS] Primeiro produto:', {
        id: firstProduct.id,
        name: firstProduct.name,
        hasImage: !!firstProduct.image,
        imagesCount: firstProduct.images?.length || 0,
        avg_rating: firstProduct.avg_rating,
        total_reviews: firstProduct.total_reviews
      });
    }
    
    res.json(products);
  } catch (error) {
    console.error('❌ [GET PRODUCTS] Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const product = rows[0];
    // Parse images do JSON
    if (product.images) {
      try {
        product.images = JSON.parse(product.images);
      } catch (e) {
        console.warn('⚠️ [GET PRODUCT BY ID] Erro ao parsear images:', e);
        product.images = [];
      }
    } else {
      product.images = [];
    }
    
    // Buscar avaliações do produto
    try {
      const [reviewStats] = await pool.execute(
        `SELECT 
          AVG(rating) as avg_rating,
          COUNT(*) as total_reviews
        FROM reviews 
        WHERE product_id = ?`,
        [product.id]
      );
      
      if (reviewStats[0]) {
        product.avg_rating = reviewStats[0].avg_rating ? parseFloat(reviewStats[0].avg_rating) : 0;
        product.total_reviews = reviewStats[0].total_reviews || 0;
      } else {
        product.avg_rating = 0;
        product.total_reviews = 0;
      }
    } catch (reviewError) {
      console.warn('⚠️ [GET PRODUCT BY ID] Erro ao buscar avaliações:', reviewError);
      product.avg_rating = 0;
      product.total_reviews = 0;
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Criar produto (Admin)
app.post('/api/products', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, category, price, originalPrice, description, image, stock = 0, isPromotion = false, isFeatured = false } = req.body;
    // Campos de livros (opcionais)
    const {
      isBook = false,
      bookTitle = null,
      bookAuthor = null,
      publisher = null,
      publicationYear = null,
      bookType = null, // 'physical' | 'digital'
      accessType = null, // 'free' | 'paid'
      pdfUrl = null
    } = req.body || {};
    
    // Campo de múltiplas imagens (opcional)
    const images = req.body.images || [];
    const imagesJson = images.length > 0 ? JSON.stringify(images) : null;

    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({ error: 'Campos obrigatórios: name, category, price' });
    }

    // Permitir preço zero apenas para livros digitais gratuitos
    const isFreeDigitalBook = isBook === true && bookType === 'digital' && accessType === 'free';
    if (price <= 0 && !isFreeDigitalBook) {
      return res.status(400).json({ error: 'Preço deve ser maior que zero' });
    }

    const isPromo = isPromotion === true || isPromotion === 'true' || isPromotion === 1;
    const isFeat = isFeatured === true || isFeatured === 'true' || isFeatured === 1;
    const stockNum = parseInt(stock) || 0;
    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;

    console.log('📝 [CREATE PRODUCT] Dados recebidos:', {
      name, category, price: priceNum, hasImage: !!image, 
      imageLength: image ? image.length : 0,
      imagePreview: image ? image.substring(0, 50) + '...' : 'SEM IMAGEM'
    });

    const [result] = await pool.execute(
      `INSERT INTO products (
        name, category, price, originalPrice, description, image, stock, isPromotion, isFeatured,
        isBook, book_title, book_author, publisher, publication_year, book_type, access_type, pdf_url, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, category, priceNum, originalPriceNum, description || '', image || '', stockNum, isPromo, isFeat,
        (isBook ? 1 : 0), bookTitle, bookAuthor, publisher, publicationYear, bookType, accessType, pdfUrl, imagesJson
      ]
    );

    const productId = result.insertId;
    const [products] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    const createdProduct = products[0];

    console.log('✅ [CREATE PRODUCT] Produto criado:', {
      id: createdProduct.id,
      name: createdProduct.name,
      image: createdProduct.image ? createdProduct.image.substring(0, 50) + '...' : 'SEM IMAGEM',
      imageLength: createdProduct.image ? createdProduct.image.length : 0
    });

    res.status(201).json({ 
      id: createdProduct.id,
      message: 'Produto criado com sucesso',
      product: createdProduct
    });
  } catch (error) {
    console.error('❌ [CREATE PRODUCT] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar produto' });
  }
});

// PUT /api/products/:id - Atualizar produto (Admin)
app.put('/api/products/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, originalPrice, description, image, stock, isPromotion, isFeatured } = req.body;
    const {
      isBook,
      bookTitle,
      bookAuthor,
      publisher,
      publicationYear,
      bookType,
      accessType,
      pdfUrl
    } = req.body || {};
    
    // Campo de múltiplas imagens
    const images = req.body.images || [];
    const imagesJson = images.length > 0 ? JSON.stringify(images) : null;

    console.log('📝 [UPDATE PRODUCT] ID:', id);
    console.log('📝 [UPDATE PRODUCT] User:', req.user);
    console.log('📝 [UPDATE PRODUCT] Dados recebidos:', {
      name, hasImage: !!image, 
      imageLength: image ? image.length : 0,
      imagePreview: image ? (image.length > 50 ? image.substring(0, 50) + '...' : image) : 'SEM IMAGEM',
      bookType, bookTitle, accessType
    });

    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log('📝 [UPDATE PRODUCT] Imagem atual no banco:', {
      hasImage: !!existing[0].image,
      imageLength: existing[0].image ? existing[0].image.length : 0,
      imagePreview: existing[0].image ? (existing[0].image.length > 50 ? existing[0].image.substring(0, 50) + '...' : existing[0].image) : 'VAZIA'
    });

    const isPromo = isPromotion === true || isPromotion === 'true' || isPromotion === 1 || isPromotion === '1';
    const isFeat = isFeatured === true || isFeatured === 'true' || isFeatured === 1 || isFeatured === '1';
    const stockNum = stock !== undefined ? parseInt(stock) : existing[0].stock;
    const priceNum = price !== undefined ? parseFloat(price) : existing[0].price;
    const originalPriceNum = originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existing[0].originalPrice;

    // Se image foi enviado (mesmo que seja string vazia), usar o valor enviado
    // Se não foi enviado (undefined), manter o valor atual
    const imageToSave = image !== undefined ? (image || '') : existing[0].image;

    console.log('📝 [UPDATE PRODUCT] Imagem que será salva:', {
      hasImage: !!imageToSave,
      imageLength: imageToSave ? imageToSave.length : 0,
      imagePreview: imageToSave ? (imageToSave.length > 50 ? imageToSave.substring(0, 50) + '...' : imageToSave) : 'VAZIA'
    });

    await pool.execute(
      `UPDATE products 
       SET name = ?, category = ?, price = ?, originalPrice = ?, description = ?, image = ?, stock = ?, isPromotion = ?, isFeatured = ?,
           isBook = COALESCE(?, isBook),
           book_title = COALESCE(?, book_title),
           book_author = COALESCE(?, book_author),
           publisher = COALESCE(?, publisher),
           publication_year = COALESCE(?, publication_year),
           book_type = COALESCE(?, book_type),
           access_type = COALESCE(?, access_type),
           pdf_url = COALESCE(?, pdf_url),
           images = COALESCE(?, images)
       WHERE id = ?`,
      [
        name || existing[0].name,
        category || existing[0].category,
        priceNum,
        originalPriceNum,
        description !== undefined ? description : existing[0].description,
        imageToSave,
        stockNum,
        isPromo,
        isFeat,
        isBook === undefined ? null : (isBook ? 1 : 0),
        bookTitle ?? null,
        bookAuthor ?? null,
        publisher ?? null,
        publicationYear ?? null,
        bookType ?? null,
        accessType ?? null,
        pdfUrl ?? null,
        imagesJson,
        id
      ]
    );

    const [updated] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    const updatedProduct = updated[0];
    
    console.log('✅ [UPDATE PRODUCT] Produto atualizado no banco:', {
      id,
      name: updatedProduct.name,
      hasImage: !!updatedProduct.image,
      imageLength: updatedProduct.image ? updatedProduct.image.length : 0,
      imagePreview: updatedProduct.image ? (updatedProduct.image.length > 100 ? updatedProduct.image.substring(0, 100) + '...' : updatedProduct.image) : 'VAZIA',
      isBook: updatedProduct.isBook,
      bookType: updatedProduct.book_type,
      accessType: updatedProduct.access_type
    });

    // Garantir que image seja sempre retornada (mesmo que vazia)
    const responseProduct = {
      ...updatedProduct,
      image: updatedProduct.image || ''
    };

    res.json(responseProduct);
  } catch (error) {
    console.error('❌ [UPDATE PRODUCT] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar produto' });
  }
});

// DELETE /api/products/:id - Deletar produto (Admin)
app.delete('/api/products/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ [DELETE PRODUCT] ID:', id);
    console.log('🗑️ [DELETE PRODUCT] User:', req.user);

    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      console.log('❌ [DELETE PRODUCT] Produto não encontrado:', id);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log('🗑️ [DELETE PRODUCT] Produto encontrado:', existing[0].name);

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    console.log('✅ [DELETE PRODUCT] Produto deletado do banco:', id);

    res.json({ 
      success: true,
      message: 'Produto deletado com sucesso',
      deletedId: id
    });
  } catch (error) {
    console.error('❌ [DELETE PRODUCT] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao deletar produto' });
  }
});

// ==========================================
// UPLOAD ROUTES
// ==========================================

const multer = require('multer');

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Diretório de uploads criado:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Apenas JPG, PNG, WEBP'));
    cb(null, true);
  }
});

// Upload de PDFs de livros
const storageBooks = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'books');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Diretório de livros criado:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '.pdf');
  }
});

const pdfUpload = multer({
  storage: storageBooks,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Apenas PDF'));
    cb(null, true);
  }
});

// Upload de banners para campanhas de marketing
const storageBanners = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'banners');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Diretório de banners criado:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const bannerUpload = multer({
  storage: storageBanners,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB para banners (maior que produtos)
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Apenas imagens (JPG, PNG, WEBP, GIF)'));
    cb(null, true);
  }
});

// POST /api/upload - Upload de imagem única
app.post('/api/upload', authenticate, isAdmin, fileUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;
    const baseUrl = req.protocol + '://' + req.get('host');
    const fullUrl = `${baseUrl}${imageUrl}`;

    console.log('✅ [UPLOAD] Imagem enviada:', req.file.filename);
    console.log('✅ [UPLOAD] URL:', imageUrl);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      imageUrl: imageUrl,
      url: imageUrl,
      fullUrl: fullUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ [UPLOAD] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao fazer upload da imagem' });
  }
});

// POST /api/upload/banner - Upload de banner para campanhas
app.post('/api/upload/banner', authenticate, isAdmin, bannerUpload.single('banner'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const imageUrl = `/uploads/banners/${req.file.filename}`;
    const baseUrl = req.protocol + '://' + req.get('host');
    const fullUrl = `${baseUrl}${imageUrl}`;

    console.log('✅ [UPLOAD BANNER] Banner enviado:', req.file.filename);
    console.log('✅ [UPLOAD BANNER] URL:', imageUrl);

    res.json({
      success: true,
      message: 'Banner enviado com sucesso',
      imageUrl: imageUrl,
      url: imageUrl,
      fullUrl: fullUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('❌ [UPLOAD BANNER] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao fazer upload do banner' });
  }
});

// GET /api/products/:id/download - Download seguro de livro digital
// ==========================================
// STOCK MANAGEMENT ROUTES
// ==========================================

// GET /api/stock/history/:productId - Histórico de movimentações de estoque
app.get('/api/stock/history/:productId', authenticate, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const [history] = await pool.execute(
      `SELECT sh.*, 
        o.id as order_id_ref,
        u.name as user_name,
        p.name as product_name
       FROM stock_history sh
       LEFT JOIN orders o ON sh.order_id = o.id
       LEFT JOIN users u ON sh.user_id = u.id
       LEFT JOIN products p ON sh.product_id = p.id
       WHERE sh.product_id = ?
       ORDER BY sh.created_at DESC
       LIMIT 100`,
      [productId]
    );
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('❌ [STOCK] Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de estoque' });
  }
});

// GET /api/stock/low - Produtos com estoque baixo
app.get('/api/stock/low', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('📦 [STOCK] Buscando produtos com estoque baixo...');
    const threshold = parseInt(req.query.threshold) || 5;
    
    const [products] = await pool.execute(
      `SELECT id, name, stock, category, price
       FROM products
       WHERE stock <= ?
       ORDER BY stock ASC`,
      [threshold]
    );
    
    res.json({
      success: true,
      threshold,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('❌ [STOCK] Erro ao buscar produtos com estoque baixo:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos com estoque baixo' });
  }
});

// PUT /api/stock/:productId - Atualizar estoque manualmente (Admin)
app.put('/api/stock/:productId', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('📦 [STOCK] Atualizando estoque...');
    console.log('📦 [STOCK] req.user:', req.user);
    const { productId } = req.params;
    const { quantity, reason } = req.body;
    const userId = req.user?.id || req.user?.userId;
    console.log('📦 [STOCK] productId:', productId, 'quantity:', quantity, 'userId:', userId);
    
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ error: 'Quantidade é obrigatória' });
    }
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Quantidade deve ser um número positivo' });
    }
    
    const newStock = await stockManager.updateStockManually(
      parseInt(productId),
      parseInt(quantity),
      userId,
      reason || 'Atualização manual pelo administrador'
    );
    
    res.json({
      success: true,
      message: 'Estoque atualizado com sucesso',
      productId: parseInt(productId),
      newStock
    });
  } catch (error) {
    console.error('❌ [STOCK] Erro ao atualizar estoque:', error);
    res.status(500).json({ 
      error: error.message || 'Erro ao atualizar estoque' 
    });
  }
});

// GET /api/products/:id/download - Download de livro digital
app.get('/api/products/:id/download', authenticate, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    console.log(`📚 [BOOK DOWNLOAD] Verificando acesso - Usuário: ${userId}, Produto: ${productId}`);
    
    if (!userId) return res.status(401).json({ error: 'Não autenticado' });

    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    const product = rows[0];

    console.log(`📚 [BOOK DOWNLOAD] Produto: ${product.name}, Tipo: ${product.book_type}, Acesso: ${product.access_type}, PDF: ${product.pdf_url ? 'Sim' : 'Não'}`);

    if (!(product.isBook && product.book_type === 'digital' && product.pdf_url)) {
      console.log(`❌ [BOOK DOWNLOAD] Produto não é livro digital válido`);
      return res.status(400).json({ error: 'Produto não é um livro digital' });
    }
    
    // Se for livro PAGO, SEMPRE verificar compra primeiro
    if (product.access_type === 'paid') {
      console.log(`💰 [BOOK DOWNLOAD] Livro PAGO - Verificando compra...`);
      
      const [hasOrder] = await pool.execute(
        `SELECT o.id, o.status FROM orders o
         JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = ? AND oi.product_id = ? AND o.status IN ('confirmed','processing','shipped','delivered')
         LIMIT 1`,
        [userId, productId]
      );
      
      if (hasOrder.length === 0) {
        console.log(`❌ [BOOK DOWNLOAD] Usuário ${userId} NÃO comprou o produto ${productId}`);
        return res.status(403).json({ 
          error: 'Você ainda não comprou este livro. Complete a compra para fazer o download.',
          hasPurchased: false
        });
      }
      
      console.log(`✅ [BOOK DOWNLOAD] Compra confirmada - Pedido: ${hasOrder[0].id}, Status: ${hasOrder[0].status}`);
    } else {
      console.log(`🆓 [BOOK DOWNLOAD] Livro GRÁTIS - Acesso liberado`);
    }

    // Preparar caminho do PDF
    let pdfPath = product.pdf_url;
    if (pdfPath.startsWith('/uploads/')) {
      pdfPath = path.join(__dirname, pdfPath);
    } else if (pdfPath.startsWith('http://') || pdfPath.startsWith('https://')) {
      // Se for URL externa, retornar JSON com URL
      console.log(`✅ [BOOK DOWNLOAD] Retornando URL externa: ${pdfPath}`);
      return res.json({ success: true, pdfUrl: pdfPath, hasPurchased: true });
    }

    // Verificar se arquivo local existe
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ [BOOK DOWNLOAD] Arquivo não encontrado: ${pdfPath}`);
      return res.status(404).json({ error: 'Arquivo PDF não encontrado no servidor' });
    }

    // Servir o arquivo PDF
    const filename = path.basename(pdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    console.log(`✅ [BOOK DOWNLOAD] Servindo PDF: ${filename} para usuário ${userId}`);
    return res.sendFile(pdfPath);
    
  } catch (error) {
    console.error('❌ [BOOK DOWNLOAD] Erro:', error);
    res.status(500).json({ error: 'Erro ao liberar download', details: error.message });
  }
});

// POST /api/upload/book - Upload de livro (PDF)
app.post('/api/upload/book', authenticate, isAdmin, pdfUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum PDF foi enviado' });
    }
    const pdfUrl = `/uploads/books/${req.file.filename}`;
    const baseUrl = req.protocol + '://' + req.get('host');
    const fullUrl = `${baseUrl}${pdfUrl}`;
    res.json({ success: true, pdfUrl, fullUrl, filename: req.file.filename });
  } catch (error) {
    console.error('❌ Erro no upload de PDF:', error);
    res.status(500).json({ error: 'Erro no upload de PDF' });
  }
});

// ==========================================
// ORDERS ROUTES
// ==========================================

// GET /api/orders - Listar todos os pedidos (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    console.log('📦 [ORDERS] Buscando todos os pedidos...');
    
    // Verificar se campos tracking existem (para compatibilidade)
    let trackingFields = '';
    try {
      const [columns] = await pool.execute(`SHOW COLUMNS FROM orders LIKE 'tracking_code'`);
      if (columns.length > 0) {
        trackingFields = ', o.tracking_code, o.tracking_url, o.shipped_at';
      }
    } catch (e) {
      // Se der erro, campos não existem ainda
    }
    
    const [orders] = await pool.execute(`
      SELECT o.*, 
        u.name as customer_name, 
        u.email as customer_email,
        o.shipping_name,
        o.shipping_email,
        o.shipping_phone,
        o.shipping_address,
        o.shipping_city,
        o.shipping_province,
        o.payment_method,
        o.status,
        o.total,
        o.created_at,
        o.updated_at
        ${trackingFields}
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    
    console.log(`📦 [ORDERS] Query retornou ${orders.length} pedidos`);
    
    // Para cada pedido, buscar itens com cálculo de subtotal
    for (let order of orders) {
      const [items] = await pool.execute(`
        SELECT oi.*, 
          p.name as product_name,
          p.image as product_image,
          p.isBook as product_is_book,
          p.book_type as product_book_type,
          p.access_type as product_access_type,
          (oi.price * oi.quantity) as subtotal
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      // Garantir que subtotal está presente
      order.items = items.map(item => ({
        ...item,
        subtotal: parseFloat(item.subtotal || (item.price * item.quantity) || 0),
        price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity || 0)
      }));
      
      console.log(`📦 [ORDERS] Pedido ${order.id} tem ${order.items.length} itens`);
    }
    
    console.log(`✅ [ORDERS] Encontrados ${orders.length} pedidos com todos os dados`);
    
    // Log detalhado do primeiro pedido para debug
    if (orders.length > 0) {
      console.log(`📋 [ORDERS] Exemplo de pedido #${orders[0].id}:`, {
        id: orders[0].id,
        total: orders[0].total,
        status: orders[0].status,
        customer_name: orders[0].customer_name,
        customer_email: orders[0].customer_email,
        items_count: orders[0].items?.length || 0,
        payment_method: orders[0].payment_method
      });
      
      if (orders[0].items && orders[0].items.length > 0) {
        console.log(`📦 [ORDERS] Primeiro item:`, {
          product_name: orders[0].items[0].product_name,
          quantity: orders[0].items[0].quantity,
          price: orders[0].items[0].price,
          subtotal: orders[0].items[0].subtotal
        });
      }
    } else {
      console.log('⚠️ [ORDERS] Nenhum pedido encontrado no banco de dados');
    }
    
    // Garantir que está retornando array
    const response = Array.isArray(orders) ? orders : [];
    console.log(`📤 [ORDERS] Enviando ${response.length} pedidos para o cliente`);
    res.json(response);
  } catch (error) {
    console.error('❌ [ORDERS] Erro ao buscar pedidos:', error);
    console.error('❌ [ORDERS] Stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar pedidos', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/orders/user/:userId - Buscar pedidos de um usuário
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`📦 [ORDERS] Buscando pedidos do usuário ${userId}...`);
    
    const [orders] = await pool.execute(`
      SELECT o.*, 
        u.name as customer_name, 
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);
    
    // Para cada pedido, buscar itens
    for (let order of orders) {
      const [items] = await pool.execute(`
        SELECT oi.*, 
          p.name as product_name,
          p.image as product_image,
          p.isBook as product_is_book,
          p.book_type as product_book_type,
          p.access_type as product_access_type,
          (oi.price * oi.quantity) as subtotal
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      order.items = items.map(item => ({
        ...item,
        subtotal: parseFloat(item.subtotal || (item.price * item.quantity) || 0),
        price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity || 0)
      }));
    }
    
    console.log(`✅ [ORDERS] Encontrados ${orders.length} pedidos para o usuário ${userId}`);
    res.json(orders);
  } catch (error) {
    console.error('❌ [ORDERS] Erro ao buscar pedidos do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos do usuário', details: error.message });
  }
});

// GET /api/orders/:id - Buscar pedido por ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const [orders] = await pool.execute(`
      SELECT o.*, 
        u.name as customer_name, 
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    const order = orders[0];
    
    // Buscar itens do pedido
    const [items] = await pool.execute(`
      SELECT oi.*, 
        p.name as product_name,
        p.image as product_image,
        p.isBook as product_is_book,
        p.book_type as product_book_type,
        p.access_type as product_access_type,
        (oi.price * oi.quantity) as subtotal
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    order.items = items.map(item => ({
      ...item,
      subtotal: parseFloat(item.subtotal || (item.price * item.quantity) || 0),
      price: parseFloat(item.price || 0),
      quantity: parseInt(item.quantity || 0)
    }));
    
    res.json(order);
  } catch (error) {
    console.error('❌ [ORDERS] Erro ao buscar pedido:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido', details: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { items, total, shippingInfo, paymentMethod, user_id } = req.body;

    // Criar pedido (NÃO reduz estoque ainda - apenas quando pagamento confirmado)
    const [result] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [user_id || null, total, paymentMethod, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );

    const orderId = result.insertId;

    // Buscar informações dos produtos para o email
    const itemsWithDetails = [];
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price]
      );
      
      // Buscar nome do produto
      const [product] = await pool.execute('SELECT name FROM products WHERE id = ?', [item.id]);
      itemsWithDetails.push({
        name: product[0]?.name || 'Produto',
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      });
    }

    // Buscar dados do cliente para o email
    let customerName = shippingInfo.name || 'Cliente';
    let customerEmail = shippingInfo.email || '';
    
    if (user_id) {
      const [user] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [user_id]);
      if (user.length > 0) {
        customerName = user[0].name || customerName;
        customerEmail = user[0].email || customerEmail;
      }
    }

    // Enviar email para admin sobre novo pedido
    try {
      const [admins] = await pool.execute('SELECT email, name FROM users WHERE role = ?', ['admin']);
      for (const admin of admins) {
        await sendEmail(
          admin.email,
          emailTemplates.newOrder,
          {
            orderId: orderId,
            customerName: customerName,
            customerEmail: customerEmail,
            total: total,
            items: itemsWithDetails,
            orderDate: new Date().toLocaleString('pt-BR')
          }
        );
      }
    } catch (emailError) {
      console.error('❌ [ORDERS] Erro ao enviar email de novo pedido (não bloqueia criação):', emailError);
    }

    res.json({ id: orderId, message: 'Pedido criado com sucesso' });
  } catch (error) {
    console.error('❌ [ORDERS] Erro ao criar pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id - Atualizar status do pedido
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, payment_status, tracking_code, tracking_url } = req.body;
    
    console.log(`📝 [ORDERS] Atualizando pedido ${orderId}:`, {
      status, payment_status, tracking_code, tracking_url
    });
    
    // Buscar pedido atual para notificações
    const [currentOrder] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    const oldStatus = currentOrder.length > 0 ? currentOrder[0].status : null;
    const oldPaymentStatus = currentOrder.length > 0 ? currentOrder[0].payment_status : null;
    
    let query = 'UPDATE orders SET';
    const params = [];
    const updates = [];
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
      
      // Se mudou para "shipped", definir shipped_at
      if (status === 'shipped' && oldStatus !== 'shipped') {
        updates.push('shipped_at = NOW()');
      }
    }
    
    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }
    
    if (tracking_code !== undefined) {
      updates.push('tracking_code = ?');
      params.push(tracking_code || null);
    }
    
    if (tracking_url !== undefined) {
      updates.push('tracking_url = ?');
      params.push(tracking_url || null);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    query += ' ' + updates.join(', ');
    query += ' WHERE id = ?';
    params.push(orderId);
    
    await pool.execute(query, params);
    
    // Buscar pedido atualizado com todos os campos
    const [updatedOrder] = await pool.execute(`
      SELECT o.*, 
        u.email as customer_email, 
        u.name as customer_name,
        o.tracking_code,
        o.tracking_url,
        o.shipped_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);
    
    const order = updatedOrder[0];
    
    // ===== CONTROLE DE ESTOQUE =====
    // Reduzir estoque quando pagamento confirmado ou pedido aprovado
    if (status === 'confirmed' || payment_status === 'paid') {
      // Verificar se já foi processado antes (evitar duplicação)
      const [orderItems] = await pool.execute(
        `SELECT oi.product_id, oi.quantity, p.stock 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      // Verificar se estoque já foi reduzido (buscar no histórico)
      const [historyCheck] = await pool.execute(
        `SELECT COUNT(*) as count FROM stock_history 
         WHERE order_id = ? AND type = 'sale'`,
        [orderId]
      );
      
      if (historyCheck[0].count === 0) {
        // Apenas reduzir se ainda não foi reduzido
        try {
          await stockManager.reduceStockFromOrder(orderId);
        } catch (stockError) {
          console.error(`⚠️ [ORDERS] Erro ao reduzir estoque do pedido ${orderId}:`, stockError);
          // Não bloquear a atualização do pedido por erro de estoque
        }
      }
    }
    
    // Restaurar estoque quando pedido cancelado
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      try {
        // Verificar se estoque foi reduzido antes (se foi confirmado antes)
        const [historyCheck] = await pool.execute(
          `SELECT COUNT(*) as count FROM stock_history 
           WHERE order_id = ? AND type = 'sale'`,
          [orderId]
        );
        
        if (historyCheck[0].count > 0) {
          // Só restaurar se estoque foi reduzido antes
          await stockManager.restoreStockFromOrder(orderId);
        }
      } catch (stockError) {
        console.error(`⚠️ [ORDERS] Erro ao restaurar estoque do pedido ${orderId}:`, stockError);
      }
    }
    
    // ===== NOTIFICAÇÕES POR EMAIL =====
    // Enviar notificações se status mudou
    if (status && status !== oldStatus) {
      try {
        // Notificação: Pedido Aprovado (Cliente)
        if (status === 'confirmed' || payment_status === 'paid') {
          // Buscar itens do pedido para o email
          const [orderItems] = await pool.execute(
            `SELECT oi.*, p.name as product_name
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [orderId]
          );
          
          const itemsForEmail = orderItems.map(item => ({
            name: item.product_name || 'Produto',
            quantity: item.quantity,
            subtotal: item.price * item.quantity
          }));
          
          const customerEmail = order.shipping_email || order.customer_email;
          const customerName = order.shipping_name || order.customer_name || 'Cliente';
          
          if (customerEmail) {
            await sendEmail(
              customerEmail,
              emailTemplates.orderApproved,
              {
                orderId: orderId,
                customerName: customerName,
                total: order.total,
                items: itemsForEmail,
                estimatedDelivery: null // Pode ser calculado depois
              }
            );
            
            // Criar notificação in-app
            if (order.user_id) {
              try {
                await pool.execute(
                  `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                  [
                    order.user_id,
                    'order_approved',
                    `Pedido #${orderId} Aprovado!`,
                    `Seu pedido foi aprovado e está em processamento. Total: ${order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}`,
                    `/profile#pedidos`
                  ]
                );
                console.log(`✅ [ORDERS] Notificação criada para usuário ${order.user_id}`);
              } catch (notifError) {
                console.error('❌ [ORDERS] Erro ao criar notificação (não bloqueia):', notifError.message);
              }
            }
          }
        }
        // Notificação: Pedido Enviado
        if (status === 'shipped' && order.tracking_code) {
          // Email com código de rastreamento
          await fetch(`${req.protocol}://${req.get('host')}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: order.shipping_email || order.customer_email,
              subject: `🚚 Seu pedido #${orderId} foi enviado!`,
              html: `
                <h2>Pedido Enviado!</h2>
                <p>Olá ${order.shipping_name || order.customer_name},</p>
                <p>Seu pedido <strong>#${orderId}</strong> foi enviado!</p>
                <p><strong>Código de Rastreamento:</strong> ${order.tracking_code}</p>
                ${order.tracking_url ? `<p><a href="${order.tracking_url}">Rastrear pedido aqui</a></p>` : ''}
                <p>Você pode rastrear seu pedido em: <a href="${req.protocol}://${req.get('host')}/tracking/${orderId}">Link de rastreamento</a></p>
              `
            })
          }).catch(err => console.error('Erro ao enviar email:', err));
          
          // Criar notificação in-app
          if (order.user_id) {
            try {
              await pool.execute(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                [
                  order.user_id,
                  'order_shipped',
                  `Pedido #${orderId} Enviado!`,
                  `Seu pedido foi enviado. Código de rastreamento: ${order.tracking_code}`,
                  `/tracking/${orderId}`
                ]
              );
              console.log(`✅ [ORDERS] Notificação de envio criada para usuário ${order.user_id}`);
            } catch (notifError) {
              console.error('❌ [ORDERS] Erro ao criar notificação (não bloqueia):', notifError.message);
            }
          }
        }
        
        // Notificação: Pedido Entregue
        if (status === 'delivered') {
          try {
            const customerEmail = order.shipping_email || order.customer_email;
            const customerName = order.shipping_name || order.customer_name;
            
            await sendEmail(customerEmail, emailTemplates.orderDelivered || {
              subject: `✅ Pedido #${orderId} Entregue!`,
              html: `
                <h2>Pedido Entregue!</h2>
                <p>Olá ${customerName},</p>
                <p>Seu pedido <strong>#${orderId}</strong> foi entregue com sucesso!</p>
                <p>Obrigado pela sua compra! 🎉</p>
              `
            }, {
              orderId,
              customerName,
              email: customerEmail
            });
            
            console.log(`✅ [ORDERS] Email de entrega enviado para ${customerEmail}`);
          } catch (emailError) {
            console.error('❌ [ORDERS] Erro ao enviar email de entrega:', emailError.message);
          }
          
          // Criar notificação in-app
          if (order.user_id) {
            try {
              await pool.execute(
                `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
                [
                  order.user_id,
                  'order_delivered',
                  `Pedido #${orderId} Entregue!`,
                  `Seu pedido foi entregue com sucesso. Obrigado pela sua compra!`,
                  `/profile#pedidos`
                ]
              );
              console.log(`✅ [ORDERS] Notificação de entrega criada para usuário ${order.user_id}`);
            } catch (notifError) {
              console.error('❌ [ORDERS] Erro ao criar notificação (não bloqueia):', notifError.message);
            }
          }
        }
        
        // Notificação: Pedido Cancelado
        if (status === 'cancelled') {
          try {
            const customerEmail = order.shipping_email || order.customer_email;
            const customerName = order.shipping_name || order.customer_name;
            
            await sendEmail(customerEmail, emailTemplates.orderCancelled || {
              subject: `❌ Pedido #${orderId} Cancelado`,
              html: `
                <h2>Pedido Cancelado</h2>
                <p>Olá ${customerName},</p>
                <p>Infelizmente seu pedido <strong>#${orderId}</strong> foi cancelado.</p>
                <p>Entre em contato conosco para mais informações.</p>
              `
            }, {
              orderId,
              customerName,
              email: customerEmail
            });
            
            console.log(`✅ [ORDERS] Email de cancelamento enviado para ${customerEmail}`);
          } catch (emailError) {
            console.error('❌ [ORDERS] Erro ao enviar email de cancelamento:', emailError.message);
          }
        }
      } catch (notifError) {
        console.error('Erro ao enviar notificações (não bloqueia atualização):', notifError);
      }
    }
    
    console.log(`✅ [ORDERS] Pedido ${orderId} atualizado`);
    res.json({ 
      message: 'Pedido atualizado com sucesso',
      order: order
    });
  } catch (error) {
    console.error('❌ [ORDERS] Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido', details: error.message });
  }
});

// DELETE /api/orders/:id - Cancelar/deletar pedido
app.delete('/api/orders/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    
    console.log(`🗑️ [ORDERS] Deletando pedido ${orderId}...`);
    
    // Verificar se o pedido existe
    const [existing] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    // Deletar itens do pedido primeiro (foreign key constraint)
    await pool.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
    
    // Deletar o pedido
    await pool.execute('DELETE FROM orders WHERE id = ?', [orderId]);
    
    console.log(`✅ [ORDERS] Pedido ${orderId} deletado permanentemente`);
    
    res.json({ 
      success: true,
      message: 'Pedido deletado com sucesso' 
    });
  } catch (error) {
    console.error('❌ [ORDERS] Erro ao deletar pedido:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao deletar pedido', 
      details: error.message 
    });
  }
});

// ==========================================
// USERS ROUTES
// ==========================================

// Ensure coupons table exists
async function ensureCouponsTable() {
  try {
    // Ler o arquivo SQL
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'sql', 'create_coupons_table.sql');
    
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      
      for (const statement of statements) {
        try {
          await pool.execute(statement.trim());
        } catch (e) {
          // Ignorar erros de tabela já existente
          if (!e.message.includes('already exists') && !e.message.includes('Duplicate')) {
            console.log('⚠️ [COUPONS] Info:', e.message);
          }
        }
      }
      console.log('✅ [COUPONS] Tabelas de cupons verificadas/criadas');
    } else {
      // Criar diretamente se o arquivo não existir
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS coupons (
          id INT AUTO_INCREMENT PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          type ENUM('percentage', 'fixed', 'free_shipping') NOT NULL DEFAULT 'percentage',
          value DECIMAL(10,2) NOT NULL,
          category VARCHAR(50) NULL,
          product_id INT NULL,
          expires_at DATETIME NULL,
          usage_limit INT NULL,
          usage_count INT DEFAULT 0,
          active BOOLEAN DEFAULT TRUE,
          min_purchase DECIMAL(10,2) NULL,
          description TEXT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_by INT NULL,
          INDEX idx_code (code),
          INDEX idx_active (active),
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS coupon_usages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          coupon_id INT NOT NULL,
          user_id INT NULL,
          order_id INT NULL,
          email VARCHAR(255) NULL,
          discount_amount DECIMAL(10,2) NOT NULL,
          order_total DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
          INDEX idx_coupon_id (coupon_id),
          INDEX idx_user_id (user_id),
          INDEX idx_order_id (order_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ [COUPONS] Tabelas criadas diretamente');
    }
  } catch (error) {
    console.error('❌ [COUPONS] Erro ao criar tabelas:', error.message);
  }
}

// Ensure users table has phone and status columns
async function ensureUsersTableColumns() {
  try {
    // Add phone column if doesn't exist
    try {
      await pool.execute(`ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL`);
      console.log('✅ [USERS] Coluna phone adicionada');
    } catch (e) {
      if (!e.message.includes('Duplicate column name') && !e.message.includes('already exists')) {
        console.log('⚠️ [USERS] Info sobre phone:', e.message);
      }
    }
    
    // Add status column if doesn't exist
    try {
      await pool.execute(`ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive', 'blocked') DEFAULT 'active'`);
      console.log('✅ [USERS] Coluna status adicionada');
    } catch (e) {
      if (!e.message.includes('Duplicate column name') && !e.message.includes('already exists')) {
        console.log('⚠️ [USERS] Info sobre status:', e.message);
      }
    }
    
    // Add blocked_reason column if doesn't exist
    try {
      await pool.execute(`ALTER TABLE users ADD COLUMN blocked_reason TEXT NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column name') && !e.message.includes('already exists')) {
        console.log('⚠️ [USERS] Info sobre blocked_reason:', e.message);
      }
    }
    
    // Add blocked_at column if doesn't exist
    try {
      await pool.execute(`ALTER TABLE users ADD COLUMN blocked_at TIMESTAMP NULL`);
    } catch (e) {
      if (!e.message.includes('Duplicate column name') && !e.message.includes('already exists')) {
        console.log('⚠️ [USERS] Info sobre blocked_at:', e.message);
      }
    }
    
    // Add block_reason column if doesn't exist
    try {
      await pool.execute(`ALTER TABLE users ADD COLUMN block_reason TEXT NULL`);
      console.log('✅ [USERS] Coluna block_reason adicionada');
    } catch (e) {
      if (!e.message.includes('Duplicate column name') && !e.message.includes('already exists')) {
        console.log('⚠️ [USERS] Info sobre block_reason:', e.message);
      }
    }
  } catch (error) {
    console.error('❌ [USERS] Erro ao garantir colunas:', error);
  }
}

// Ensure reviews table exists
async function ensureReviewsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id),
        INDEX idx_product_id (product_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ [REVIEWS] Tabela reviews verificada/criada');
  } catch (error) {
    console.error('❌ [REVIEWS] Erro ao criar tabela:', error.message);
  }
}

// GET /api/users - Listar todos os usuários/clientes
app.get('/api/users', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('📋 [USERS] Buscando todos os clientes...');
    
    // Tentar buscar com phone e status, se falhar, buscar sem
    let users;
    try {
      const [result] = await pool.execute(`
        SELECT id, name, email, role, phone, status, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      users = result;
    } catch (sqlError) {
      // Se colunas não existem, buscar sem elas
      console.log('⚠️ [USERS] Colunas phone/status não encontradas, buscando sem elas...');
      const [result] = await pool.execute(`
        SELECT id, name, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      users = result.map(u => ({
        ...u,
        phone: null,
        status: 'active'
      }));
    }
    
    console.log(`✅ [USERS] Encontrados ${users.length} clientes`);
    
    // Para cada usuário, buscar pedidos
    for (let user of users) {
      const [orders] = await pool.execute(`
        SELECT id, total, status, created_at 
        FROM orders 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `, [user.id]);
      
      user.orders = orders;
      user.totalOrders = orders.length;
      user.totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    }

    res.json(users);
  } catch (error) {
    console.error('❌ [USERS] Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
  }
});

// GET /api/users/:id - Buscar cliente por ID
app.get('/api/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    let users;
    try {
      const [result] = await pool.execute(`
        SELECT id, name, email, role, phone, status, created_at 
        FROM users WHERE id = ?
      `, [req.params.id]);
      users = result;
    } catch (sqlError) {
      // Se colunas não existem, buscar sem elas
      const [result] = await pool.execute(`
        SELECT id, name, email, role, created_at 
        FROM users WHERE id = ?
      `, [req.params.id]);
      users = result.map(u => ({
        ...u,
        phone: null,
        status: 'active'
      }));
    }
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    const user = users[0];
    
    // Buscar pedidos do cliente
    const [orders] = await pool.execute(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `, [user.id]);
    
    user.orders = orders;
    user.totalOrders = orders.length;
    user.totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    
    res.json(user);
  } catch (error) {
    console.error('❌ [USERS] Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente', details: error.message });
  }
});

// PUT /api/users/:id - Atualizar cliente
app.put('/api/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;
    const userId = req.params.id;
    
    console.log(`✏️ [USERS] Atualizando cliente #${userId}...`);
    
    // Verificar se cliente existe
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    // Verificar se email já existe em outro usuário
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      
      if (emailCheck.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado para outro cliente' });
      }
    }
    
    // Atualizar
    await pool.execute(`
      UPDATE users 
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = ?,
          status = COALESCE(?, status)
      WHERE id = ?
    `, [name || null, email || null, phone || null, status || null, userId]);
    
    console.log(`✅ [USERS] Cliente #${userId} atualizado`);
    
    // Buscar cliente atualizado
    const [updated] = await pool.execute(
      'SELECT id, name, email, role, phone, status, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({ success: true, user: updated[0] });
  } catch (error) {
    console.error('❌ [USERS] Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente', details: error.message });
  }
});

// PATCH /api/users/:id/block - Bloquear cliente
app.patch('/api/users/:id/block', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;
    
    await pool.execute(
      'UPDATE users SET status = ?, block_reason = ? WHERE id = ?',
      ['blocked', reason || 'Conta bloqueada pelo administrador', userId]
    );
    
    console.log(`🚫 [USERS] Cliente #${userId} bloqueado`);
    res.json({ success: true, message: 'Cliente bloqueado com sucesso' });
  } catch (error) {
    console.error('❌ [USERS] Erro ao bloquear cliente:', error);
    res.status(500).json({ error: 'Erro ao bloquear cliente', details: error.message });
  }
});

// PATCH /api/users/:id/unblock - Desbloquear cliente
app.patch('/api/users/:id/unblock', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    await pool.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      ['active', userId]
    );
    
    console.log(`✅ [USERS] Cliente #${userId} desbloqueado`);
    res.json({ success: true, message: 'Cliente desbloqueado com sucesso' });
  } catch (error) {
    console.error('❌ [USERS] Erro ao desbloquear cliente:', error);
    res.status(500).json({ error: 'Erro ao desbloquear cliente', details: error.message });
  }
});

// DELETE /api/users/:id - Excluir cliente
app.delete('/api/users/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verificar se é admin tentando excluir outro admin
    const [userCheck] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    
    if (userCheck.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    if (userCheck[0].role === 'admin') {
      return res.status(403).json({ error: 'Não é possível excluir um administrador' });
    }
    
    // Excluir pedidos relacionados (ou manter histórico - você escolhe)
    // Por enquanto, vamos manter os pedidos mas remover referência do usuário
    // Se quiser excluir tudo: DELETE FROM orders WHERE user_id = ? antes
    
    // Excluir usuário
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    console.log(`🗑️ [USERS] Cliente #${userId} excluído`);
    res.json({ success: true, message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('❌ [USERS] Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente', details: error.message });
  }
});

// ==========================================
// PAYMENT ROUTES (SIMULATED)
// ==========================================

// Função para criptografar API Key do M-Pesa usando RSA
function encryptMpesaApiKey(apiKey, publicKeyBase64) {
  try {
    const crypto = require('crypto');
    
    // Decodificar Public Key de Base64 para DER
    const decodedPublicKey = Buffer.from(publicKeyBase64, 'base64');
    
    // Tentar importar como DER primeiro (formato SPKI)
    let publicKeyObj;
    try {
      publicKeyObj = crypto.createPublicKey({
        key: decodedPublicKey,
        format: 'der',
        type: 'spki'
      });
    } catch (derError) {
      // Se falhar, tentar como PEM
      try {
        // Converter DER para PEM se necessário
        const pemKey = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
        publicKeyObj = crypto.createPublicKey(pemKey);
      } catch (pemError) {
        // Última tentativa: usar diretamente como string PEM
        publicKeyObj = crypto.createPublicKey({
          key: publicKeyBase64,
          format: 'pem'
        });
      }
    }
    
    // Criptografar API Key com RSA PKCS1 padding
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyObj,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      Buffer.from(apiKey, 'utf8')
    );
    
    // Retornar Base64 do resultado criptografado
    return encrypted.toString('base64');
  } catch (error) {
    console.error('❌ [M-PESA] Erro ao criptografar API Key:', error.message);
    console.error('❌ [M-PESA] Stack:', error.stack);
    return null;
  }
}

// Função para obter Bearer Token do M-Pesa
function getMpesaBearerToken() {
  const apiKey = process.env.MPESA_API_KEY;
  const publicKey = process.env.MPESA_PUBLIC_KEY;
  
  if (!apiKey || !publicKey) {
    console.warn('⚠️ [M-PESA] Credenciais não configuradas, usando modo simulado');
    return null;
  }
  
  const encrypted = encryptMpesaApiKey(apiKey, publicKey);
  return encrypted ? `Bearer ${encrypted}` : null;
}

// POST /api/payments/paypal/create
// Função para obter access token do PayPal
async function getPayPalAccessToken() {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET?.substring(0, 64); // Apenas primeiros 64 caracteres
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    
    if (!clientId || !clientSecret) {
      console.warn('⚠️ [PAYPAL] Credenciais não configuradas, usando modo simulado');
      return null;
    }
    
    console.log('🔑 [PAYPAL] Tentando obter token...');
    console.log('🔑 [PAYPAL] Client ID:', clientId.substring(0, 20) + '...');
    console.log('🔑 [PAYPAL] API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [PAYPAL] Erro ao obter token:', error);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ [PAYPAL] Token obtido com sucesso');
    return data.access_token;
  } catch (error) {
    console.error('❌ [PAYPAL] Erro ao obter access token:', error.message);
    console.error('❌ [PAYPAL] Stack:', error.stack);
    return null;
  }
}

app.post('/api/payments/paypal/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo } = req.body;
    
    console.log('💳 [PAYPAL] Iniciando pagamento PayPal...');
    
    // Tentar usar PayPal real
    const accessToken = await getPayPalAccessToken();
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
    
    let orderId = null;
    let transactionId = null;
    
    if (accessToken) {
      // MODO REAL - Criar order no PayPal
      try {
        const paypalItems = items.map(item => ({
          name: item.name || 'Produto',
          unit_amount: {
            currency_code: 'USD',
            value: (item.price / 74).toFixed(2) // Converter MZN para USD (aproximado)
          },
          quantity: item.quantity.toString()
        }));
        
        const paypalOrder = {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: (amount / 74).toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: (amount / 74).toFixed(2)
                }
              }
            },
            items: paypalItems
          }],
          application_context: {
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/checkout-success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/checkout`
          }
        };
        
        const response = await fetch(`${apiUrl}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'PayPal-Request-Id': `order-${Date.now()}`
          },
          body: JSON.stringify(paypalOrder)
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('❌ [PAYPAL] Erro ao criar order:', error);
          throw new Error('Erro ao criar order no PayPal');
        }
        
        const paypalData = await response.json();
        transactionId = paypalData.id;
        
        // Criar pedido no nosso banco
        const [orderResult] = await pool.execute(
          `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
           VALUES (?, ?, 'paypal', ?, ?, ?, ?, ?, ?, 'pending')`,
          [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
        );
        orderId = orderResult.insertId;
        
        // Adicionar itens
        for (const item of items) {
          await pool.execute(
            `INSERT INTO order_items (order_id, product_id, quantity, price)
             VALUES (?, ?, ?, ?)`,
            [orderId, parseInt(item.id), item.quantity, item.price]
          );
        }
        
        // Salvar pagamento
        await pool.execute(
          `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
           VALUES (?, ?, ?, ?, 'paypal', 'pending', ?, NOW())`,
          [transactionId, orderId, userId, amount, JSON.stringify({ paypal_order: paypalData })]
        );
        
        res.json({
          success: true,
          transactionId,
          orderId: orderId,
          paymentUrl: paypalData.links.find(link => link.rel === 'approve')?.href || '#',
          redirectUrl: paypalData.links.find(link => link.rel === 'approve')?.href || '#',
          message: 'Redirecionando para PayPal...'
        });
        
        return;
      } catch (paypalError) {
        console.error('❌ [PAYPAL] Erro na integração real:', paypalError.message);
        // Continuar com modo simulado
      }
    }
    
    // MODO SIMULADO (fallback)
    console.log('💳 [PAYPAL] Usando modo simulado');
    
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, 'paypal', ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );
    orderId = orderResult.insertId;
    
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, parseInt(item.id), item.quantity, item.price]
      );
    }
    
    transactionId = `PAYPAL-${Date.now()}`;
    
    await pool.execute(
      `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'paypal', 'pending', ?, NOW())`,
      [transactionId, orderId, userId, amount, JSON.stringify({ simulated: true, method: 'paypal' })]
    );
    
    res.json({
      success: true,
      transactionId,
      orderId: orderId,
      paymentUrl: `https://paypal.com/checkout?token=${transactionId}`,
      redirectUrl: `/checkout-success?transaction=${transactionId}&orderId=${orderId}`,
      message: 'Pagamento PayPal iniciado. Aguarde confirmação no painel administrativo...'
    });
    
  } catch (error) {
    console.error('❌ [PAYPAL] Erro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar pagamento PayPal',
      details: error.message 
    });
  }
});

// POST /api/payments/mpesa/initiate
app.post('/api/payments/mpesa/initiate', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo, phone } = req.body;
    
    console.log('📱 [M-PESA] Iniciando pagamento M-Pesa...');
    
    // Criar pedido primeiro
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, 'mpesa', ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );
    
    const orderId = orderResult.insertId;
    
    // Adicionar itens
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, parseInt(item.id), item.quantity, item.price]
      );
    }
    
    // Tentar usar API real do M-Pesa
    const bearerToken = getMpesaBearerToken();
    const mpesaApiUrl = process.env.MPESA_API_URL;
    
    let transactionId = null;
    
    if (bearerToken && mpesaApiUrl) {
      // MODO REAL - Chamar API M-Pesa
      try {
        console.log('🔐 [M-PESA] Tentando API real...');
        console.log('🔑 [M-PESA] Bearer token gerado: ✅');
        console.log('🌐 [M-PESA] API URL:', mpesaApiUrl);
        
        // IMPORTANTE: Configure MPESA_API_URL no .env com o endpoint completo da sua API M-Pesa
        // Exemplo: https://api.mpesa.vm.co.mz/v1/processpayment
        // Consulte a documentação oficial da sua API M-Pesa para o endpoint correto
        
        const mpesaRequest = {
          phoneNumber: phone.replace(/\D/g, ''), // Remover não-números (ex: 258874383621)
          amount: amount.toString(),
          reference: `ORDER-${orderId}`,
          description: `Pedido #${orderId} - Papel & Pixel`,
          // Adicione outros campos conforme a documentação da sua API M-Pesa
          // Campos comuns podem incluir: accountReference, transactionType, etc.
        };
        
        console.log('📤 [M-PESA] Payload:', JSON.stringify(mpesaRequest, null, 2));
        
        const response = await fetch(`${mpesaApiUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': bearerToken
          },
          body: JSON.stringify(mpesaRequest)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ [M-PESA] Erro HTTP na API:', response.status, response.statusText);
          console.error('❌ [M-PESA] Resposta:', errorText);
          throw new Error('Erro ao chamar API M-Pesa');
        }
        
        const mpesaResponse = await response.json();
        transactionId = mpesaResponse.transactionId || mpesaResponse.reference || `MPESA-${Date.now()}`;
        
        console.log('✅ [M-PESA] Resposta recebida:', JSON.stringify(mpesaResponse, null, 2));
        
        // Salvar pagamento com dados da API real
        await pool.execute(
          `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
           VALUES (?, ?, ?, ?, 'mpesa', 'pending', ?, NOW())`,
          [transactionId, orderId, userId, amount, JSON.stringify({ 
            phone, 
            mpesaResponse,
            apiReal: true 
          })]
        );
        
        res.json({
          success: true,
          transactionId,
          orderId: orderId,
          message: 'Pagamento M-Pesa iniciado. Você receberá uma solicitação no seu celular.',
          instructions: [
            '1. Você receberá uma solicitação no seu celular',
            '2. Digite seu PIN M-Pesa quando solicitado',
            '3. Confirme o pagamento',
            '4. Aguarde processamento'
          ],
          amount: amount,
          phone: phone
        });
        
        return;
      } catch (mpesaError) {
        console.error('❌ [M-PESA] Erro na integração real:', mpesaError.message);
        console.error('❌ [M-PESA] Tipo do erro:', mpesaError.name);
        console.error('❌ [M-PESA] Stack:', mpesaError.stack);
        // Continuar com modo simulado
      }
    }
    
    // MODO SIMULADO (fallback)
    console.log('📱 [M-PESA] Usando modo simulado');
    
    transactionId = `MPESA-${Date.now()}`;
    
    // Criar registro de pagamento pendente
    await pool.execute(
      `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'mpesa', 'pending', ?, NOW())`,
      [transactionId, orderId, userId, amount, JSON.stringify({ phone, simulated: true })]
    );
    
    res.json({
      success: true,
      transactionId,
      orderId: orderId,
      message: 'Pagamento M-Pesa iniciado. Aguarde confirmação no painel administrativo...',
      instructions: [
        '1. Você receberá uma solicitação no seu celular',
        '2. Digite seu PIN M-Pesa quando solicitado',
        '3. Confirme o pagamento',
        '4. Aguarde confirmação no painel administrativo'
      ],
      amount: amount,
      phone: phone
    });
    
  } catch (error) {
    console.error('❌ [M-PESA] Erro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar pagamento M-Pesa',
      details: error.message 
    });
  }
});

// POST /api/payments/emola/initiate
app.post('/api/payments/emola/initiate', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo, phone } = req.body;
    
    console.log('💼 [EMOLA] Iniciando pagamento EMOLA...');
    
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, 'emola', ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, parseInt(item.id), item.quantity, item.price]
      );
    }
    
    const transactionId = `EMOLA-${Date.now()}`;
    const reference = `REF-${Date.now()}`;
    
    // Criar registro de pagamento pendente primeiro
    await pool.execute(
      `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'emola', 'pending', ?, NOW())`,
      [transactionId, orderId, userId, amount, JSON.stringify({ phone, reference, simulated: true })]
    );
    
    setTimeout(async () => {
      try {
        await pool.execute(
          `UPDATE payments SET status = 'completed', completed_at = NOW() WHERE transaction_id = ?`,
          [transactionId]
        );
        
        await pool.execute(
          'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
          ['confirmed', 'paid', orderId]
        );
        
        // REDUZIR ESTOQUE (via stockManager)
        try {
          await stockManager.reduceStockFromOrder(orderId);
        } catch (stockError) {
          console.error(`⚠️ [PAYPAL] Erro ao reduzir estoque (não bloqueia):`, stockError);
        }
        
        console.log(`✅ [EMOLA] Pagamento confirmado: ${transactionId}`);
        
        // Buscar dados do pedido
        const [orderData] = await pool.execute(
          'SELECT * FROM orders WHERE id = ?',
          [orderId]
        );
        
        // Notificar admin sobre novo pedido
        if (orderData.length > 0) {
          await notifyAdminNewOrder(orderId, amount, shippingInfo.name);
        }
        
        // Enviar email e SMS após confirmação
        try {
          if (shippingInfo.email) {
            await sendEmail(shippingInfo.email, emailTemplates.orderConfirmation, {
              id: orderId,
              total: amount,
              status: 'confirmed'
            });
            console.log('✅ [EMOLA] Email enviado');
          }
          
          if (phone) {
            await sendSMSNotification(phone, `Seu pedido #${orderId} foi confirmado! Total: ${amount} MZN. Obrigado pela compra!`);
            console.log('✅ [EMOLA] SMS enviado');
          }
        } catch (notifError) {
          console.log('⚠️ [EMOLA] Notificações não enviadas (não bloqueia):', notifError.message);
        }
      } catch (error) {
        console.error('❌ [EMOLA] Erro ao confirmar:', error);
      }
    }, 3000);
    
    res.json({
      success: true,
      transactionId,
      orderId: orderId, // IMPORTANTE: passar orderId
      reference,
      message: 'Pagamento EMOLA iniciado. Aguarde confirmação...',
      amount: amount
    });
    
  } catch (error) {
    console.error('❌ [EMOLA] Erro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar pagamento EMOLA',
      details: error.message 
    });
  }
});

// POST /api/payments/mkesh/initiate
app.post('/api/payments/mkesh/initiate', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo, phone } = req.body;
    
    console.log('📲 [MKESH] Iniciando pagamento Mkesh...');
    
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, 'mkesh', ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, parseInt(item.id), item.quantity, item.price]
      );
    }
    
    const transactionId = `MKESH-${Date.now()}`;
    const paymentCode = `MK${Date.now().toString().slice(-6)}`;
    
    // Criar registro de pagamento pendente primeiro
    await pool.execute(
      `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'mkesh', 'pending', ?, NOW())`,
      [transactionId, orderId, userId, amount, JSON.stringify({ phone, paymentCode, simulated: true })]
    );
    
    // Remover confirmação automática - deixar para admin simular manualmente via painel
    
    res.json({
      success: true,
      transactionId,
      orderId: orderId, // IMPORTANTE: passar orderId
      paymentCode,
      message: 'Pagamento Mkesh iniciado. Aguarde confirmação...',
      instructions: [
        '1. Abra o app Mkesh no seu celular',
        '2. Digite o código de pagamento: ' + paymentCode,
        '3. Confirme o pagamento',
        '4. Aguarde confirmação automática (3 segundos)'
      ],
      amount: amount
    });
    
  } catch (error) {
    console.error('❌ [MKESH] Erro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar pagamento Mkesh',
      details: error.message 
    });
  }
});

// POST /api/payments/card/create
app.post('/api/payments/card/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo } = req.body;
    
    console.log('💳 [CARD] Iniciando pagamento com cartão...');
    
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, 'card', ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, parseInt(item.id), item.quantity, item.price]
      );
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transactionId = `CARD-${Date.now()}`;
    
    // Criar registro de pagamento pendente primeiro
    await pool.execute(
      `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'card', 'pending', ?, NOW())`,
      [transactionId, orderId, userId, amount, JSON.stringify({ simulated: true, method: 'card' })]
    );
    
    // Não confirmar automaticamente - deixar para admin simular manualmente via painel
    
    res.json({
      success: true,
      transactionId,
      orderId: orderId, // IMPORTANTE: passar orderId
      message: 'Pagamento com cartão iniciado. Aguarde confirmação no painel administrativo...',
      redirectUrl: `/checkout-success?transaction=${transactionId}&orderId=${orderId}&pending=true`
    });
    
  } catch (error) {
    console.error('❌ [CARD] Erro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar pagamento com cartão',
      details: error.message 
    });
  }
});

// POST /api/payments/cash/create
app.post('/api/payments/cash/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo } = req.body;
    
    console.log('💵 [CASH] Criando pedido em dinheiro...');
    
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, 'cash', ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, parseInt(item.id), item.quantity, item.price]
      );
    }
    
    const transactionId = `CASH-${Date.now()}`;
    
    await pool.execute(
      `INSERT INTO payments (transaction_id, order_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, 'cash', 'pending', ?, NOW())`,
      [transactionId, orderId, amount, JSON.stringify({ note: 'Pagamento na entrega', simulated: true })]
    );
    
    // Pedido permanece como 'confirmed' mas payment_status 'pending' até receber o pagamento na entrega
    await pool.execute(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      ['confirmed', 'pending', orderId]
    );
    
    // DECREMENTAR ESTOQUE (pedido foi confirmado, mesmo que pagamento seja na entrega)
    await stockManager.reduceStockFromOrder(orderId);
    
    console.log(`✅ [CASH] Pedido criado: ${transactionId}`);
    
    // Buscar dados do pedido
    const [orderData] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    // Notificar admin sobre novo pedido
    if (orderData.length > 0) {
      await notifyAdminNewOrder(orderId, amount, shippingInfo.name);
    }
    
    // Enviar email e SMS (mesmo para cash, informa sobre o pedido)
    try {
      if (shippingInfo.email) {
        await sendEmail(shippingInfo.email, emailTemplates.orderConfirmation, {
          id: orderId,
          total: amount,
          status: 'confirmed',
          note: 'Você pagará quando receber o produto'
        });
        console.log('✅ [CASH] Email enviado');
      }
      
      if (shippingInfo.phone) {
        await sendSMSNotification(shippingInfo.phone, `Seu pedido #${orderId} foi criado! Total: ${amount} MZN. Você pagará na entrega.`);
        console.log('✅ [CASH] SMS enviado');
      }
    } catch (notifError) {
      console.log('⚠️ [CASH] Notificações não enviadas (não bloqueia):', notifError.message);
    }
    
    res.json({
      success: true,
      transactionId,
      orderId: orderId, // IMPORTANTE: passar orderId
      message: 'Pedido criado! Você pagará quando receber o produto.',
      redirectUrl: `/checkout-success?transaction=${transactionId}&orderId=${orderId}`
    });
    
  } catch (error) {
    console.error('❌ [CASH] Erro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar pedido',
      details: error.message 
    });
  }
});

// POST /api/payments/riha/create - Criar payment link via RIHA
app.post('/api/payments/riha/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo } = req.body;
    
    console.log('💰 [RIHA] Criando payment link via RIHA...');
    
    const API_KEY = process.env.RIHA_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'RIHA API key não configurada',
        details: 'Configure a variável de ambiente RIHA_API_KEY'
      });
    }
    
    // Criar pedido local primeiro
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status, payment_status)
       VALUES (?, ?, 'riha', ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );
    
    const orderId = orderResult.insertId;
    
    // Adicionar itens do pedido
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, parseInt(item.id), item.quantity, item.price]
      );
    }
    
    // Criar payment link na RIHA
    const rihaResponse = await fetch('https://api.riha.co.mz/payment-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'MT',
        description: `Pedido #${orderId} - ${items.length} item(s)`,
        redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/checkout-success?orderId=${orderId}`,
        webhook_url: `${process.env.API_URL || 'http://localhost:3001/api'}/payments/riha/webhook`,
        metadata: {
          order_id: orderId,
          user_id: userId,
          items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity }))
        },
        escrow_enabled: true, // Habilitar proteção escrow para produtos físicos
        escrow_sla_days: 7,
        escrow_sla_description: 'Produto será entregue em até 7 dias úteis'
      })
    });
    
    if (!rihaResponse.ok) {
      const errorData = await rihaResponse.json().catch(() => ({}));
      console.error('❌ [RIHA] Erro ao criar payment link:', errorData);
      
      // Marcar pedido como falhado
      await pool.execute(
        'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
        ['failed', 'failed', orderId]
      );
      
      return res.status(500).json({
        success: false,
        error: 'Falha ao criar payment link na RIHA',
        details: errorData.message || 'Erro desconhecido'
      });
    }
    
    const rihaData = await rihaResponse.json();
    
    console.log('✅ [RIHA] Payment link criado:', rihaData.id);
    
    // Salvar pagamento
    const transactionId = `RIHA-${rihaData.id}`;
    await pool.execute(
      `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'riha', 'pending', ?, NOW())`,
      [transactionId, orderId, userId, amount, JSON.stringify({ 
        riha_payment_link_id: rihaData.id,
        riha_token: rihaData.token,
        checkout_url: rihaData.checkout_url
      })]
    );
    
    // Notificar admin sobre novo pedido pendente
    try {
      await notifyAdminNewOrder(orderId, amount, shippingInfo.name);
    } catch (emailError) {
      console.error('❌ [RIHA] Erro ao notificar admin (não bloqueia):', emailError);
    }
    
    res.json({
      success: true,
      transactionId,
      orderId: orderId,
      paymentUrl: rihaData.checkout_url,
      message: 'Redirecionando para pagamento RIHA...',
      redirectUrl: rihaData.checkout_url
    });
    
  } catch (error) {
    console.error('❌ [RIHA] Erro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar pagamento RIHA',
      details: error.message 
    });
  }
});

// POST /api/payments/bank-transfer/create - Criar pedido com transferência bancária
app.post('/api/payments/bank-transfer/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo, bankName, accountNumber } = req.body;
    
    console.log('🏦 [BANK TRANSFER] Criando pedido com transferência bancária...');
    
    // Criar pedido
    const [orderResult] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, 'bank_transfer', ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, amount, shippingInfo.name, shippingInfo.email, shippingInfo.phone, shippingInfo.address, shippingInfo.city, shippingInfo.province]
    );
    
    const orderId = orderResult.insertId;
    
    // Adicionar itens
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, parseInt(item.id), item.quantity, item.price]
      );
    }
    
    const transactionId = `BANK-${Date.now()}`;
    
    // Criar registro de pagamento pendente (aguardando comprovante)
    await pool.execute(
      `INSERT INTO payments (transaction_id, order_id, user_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'bank_transfer', 'pending', ?, NOW())`,
      [transactionId, orderId, userId, amount, JSON.stringify({ 
        bankName: bankName || 'Não informado',
        accountNumber: accountNumber || 'Não informado',
        note: 'Aguardando envio de comprovante'
      })]
    );
    
    // Pedido fica pendente até comprovante ser verificado
    await pool.execute(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      ['pending', 'pending', orderId]
    );
    
    console.log(`✅ [BANK TRANSFER] Pedido criado: ${transactionId} - Aguardando comprovante`);
    
    // Notificar admin sobre novo pedido pendente de comprovante
    try {
      const [admins] = await pool.execute('SELECT email, name FROM users WHERE role = ?', ['admin']);
      
      // Buscar itens para o email
      const itemsWithDetails = [];
      for (const item of items) {
        const [product] = await pool.execute('SELECT name FROM products WHERE id = ?', [parseInt(item.id)]);
        itemsWithDetails.push({
          name: product[0]?.name || 'Produto',
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        });
      }
      
      for (const admin of admins) {
        await sendEmail(
          admin.email,
          emailTemplates.newOrder,
          {
            orderId: orderId,
            customerName: shippingInfo.name || 'Cliente',
            customerEmail: shippingInfo.email || '',
            total: amount,
            items: itemsWithDetails,
            orderDate: new Date().toLocaleString('pt-BR')
          }
        );
      }
    } catch (emailError) {
      console.error('❌ [BANK TRANSFER] Erro ao notificar admin (não bloqueia):', emailError);
    }
    
    res.json({
      success: true,
      transactionId,
      orderId: orderId,
      message: 'Pedido criado! Envie o comprovante de transferência bancária.',
      instructions: [
        '1. Realize a transferência bancária para a conta informada',
        '2. Faça upload do comprovante abaixo',
        '3. Aguarde aprovação (até 24 horas úteis)',
        '4. Você receberá um email quando o pagamento for confirmado'
      ],
      redirectUrl: `/checkout-success?transaction=${transactionId}&orderId=${orderId}&uploadReceipt=true`
    });
    
  } catch (error) {
    console.error('❌ [BANK TRANSFER] Erro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar pedido',
      details: error.message 
    });
  }
});

// POST /api/payments/bank-transfer/upload-receipt - Upload de comprovante

// Configurar multer para upload de comprovantes (usando storage separado)
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens (JPG, PNG) e PDF são permitidos!'));
  }
});

app.post('/api/payments/bank-transfer/upload-receipt', uploadReceipt.single('receipt'), async (req, res) => {
  try {
    const { transactionId, orderId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    if (!transactionId && !orderId) {
      // Se arquivo foi enviado mas não tem ID, deletar
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Transaction ID ou Order ID é obrigatório' });
    }
    
    const receiptUrl = `/uploads/receipts/${req.file.filename}`;
    
    // Atualizar pagamento com URL do comprovante
    if (transactionId) {
      await pool.execute(
        `UPDATE payments 
         SET receipt_url = ?, receipt_uploaded_at = NOW(), status = 'processing'
         WHERE transaction_id = ?`,
        [receiptUrl, transactionId]
      );
      
      // Buscar order_id do pagamento se não foi fornecido
      const [payments] = await pool.execute(
        'SELECT order_id FROM payments WHERE transaction_id = ?',
        [transactionId]
      );
      
      if (payments.length > 0 && payments[0].order_id) {
        const actualOrderId = payments[0].order_id;
        
        // Atualizar status do pedido para "processing" (aguardando verificação)
        await pool.execute(
          'UPDATE orders SET status = ? WHERE id = ?',
          ['processing', actualOrderId]
        );
      }
    } else if (orderId) {
      await pool.execute(
        `UPDATE payments 
         SET receipt_url = ?, receipt_uploaded_at = NOW(), status = 'processing'
         WHERE order_id = ?`,
        [receiptUrl, orderId]
      );
      
      await pool.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['processing', orderId]
      );
    }
    
    console.log(`✅ [BANK TRANSFER] Comprovante enviado: ${receiptUrl}`);
    
    // Notificar admin sobre novo comprovante pendente
    try {
      const [admins] = await pool.execute('SELECT email, name FROM users WHERE role = ?', ['admin']);
      for (const admin of admins) {
        await sendEmail(
          admin.email,
          emailTemplates.bankReceiptUploaded || emailTemplates.newOrder,
          {
            orderId: orderId || 'N/A',
            receiptUrl: `${process.env.API_URL || 'http://localhost:3001'}${receiptUrl}`,
            message: 'Novo comprovante de transferência bancária aguardando verificação'
          }
        );
      }
    } catch (emailError) {
      console.error('⚠️ [BANK TRANSFER] Erro ao notificar admin (não bloqueia):', emailError);
    }
    
    res.json({
      success: true,
      message: 'Comprovante enviado com sucesso! Aguarde aprovação.',
      receiptUrl,
      status: 'processing'
    });
    
  } catch (error) {
    console.error('❌ [BANK TRANSFER] Erro ao fazer upload:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path); // Deletar arquivo se houver erro
    }
    res.status(500).json({ 
      error: 'Erro ao fazer upload do comprovante',
      details: error.message 
    });
  }
});

// PATCH /api/payments/:id/verify-receipt - Verificar comprovante (Admin)
app.patch('/api/payments/:id/verify-receipt', authenticate, isAdmin, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { verified, reason } = req.body;
    const adminId = req.user.id || req.user.userId;
    
    if (verified === true) {
      // Aprovar pagamento
      await pool.execute(
        `UPDATE payments 
         SET status = 'paid', 
             receipt_verified_by = ?,
             receipt_verified_at = NOW(),
             completed_at = NOW()
         WHERE id = ?`,
        [adminId, paymentId]
      );
      
      // Buscar order_id do pagamento
      const [payments] = await pool.execute('SELECT order_id FROM payments WHERE id = ?', [paymentId]);
      
      if (payments.length > 0) {
        const orderId = payments[0].order_id;
        
        // Atualizar pedido para confirmado e pago
        await pool.execute(
          'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
          ['confirmed', 'paid', orderId]
        );
        
        // Reduzir estoque
        try {
          await stockManager.reduceStockFromOrder(orderId);
        } catch (stockError) {
          console.error(`⚠️ [PAYMENT] Erro ao reduzir estoque (não bloqueia):`, stockError);
        }
        
        // Enviar email de confirmação ao cliente
        try {
          const [orders] = await pool.execute(
            `SELECT o.*, u.email as customer_email, u.name as customer_name
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             WHERE o.id = ?`,
            [orderId]
          );
          
          if (orders.length > 0 && orders[0].shipping_email) {
            const [orderItems] = await pool.execute(
              `SELECT oi.*, p.name as product_name
               FROM order_items oi
               LEFT JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = ?`,
              [orderId]
            );
            
            const itemsForEmail = orderItems.map(item => ({
              name: item.product_name || 'Produto',
              quantity: item.quantity,
              subtotal: item.price * item.quantity
            }));
            
            await sendEmail(
              orders[0].shipping_email,
              emailTemplates.orderApproved,
              {
                orderId: orderId,
                customerName: orders[0].shipping_name || orders[0].customer_name || 'Cliente',
                total: orders[0].total,
                items: itemsForEmail,
                estimatedDelivery: null
              }
            );
          }
        } catch (emailError) {
          console.error('⚠️ [PAYMENT] Erro ao enviar email (não bloqueia):', emailError);
        }
      }
      
      res.json({
        success: true,
        message: 'Comprovante aprovado! Pagamento confirmado e estoque atualizado.'
      });
      
    } else {
      // Rejeitar pagamento
      await pool.execute(
        `UPDATE payments 
         SET status = 'failed',
             receipt_verified_by = ?,
             receipt_verified_at = NOW(),
             metadata = JSON_SET(COALESCE(metadata, '{}'), '$.rejection_reason', ?)
         WHERE id = ?`,
        [adminId, reason || 'Comprovante não aprovado', paymentId]
      );
      
      // Buscar order_id
      const [payments] = await pool.execute('SELECT order_id FROM payments WHERE id = ?', [paymentId]);
      
      if (payments.length > 0) {
        await pool.execute(
          'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
          ['pending', 'failed', payments[0].order_id]
        );
      }
      
      res.json({
        success: true,
        message: 'Comprovante rejeitado. O cliente será notificado.'
      });
    }
    
  } catch (error) {
    console.error('❌ [PAYMENT] Erro ao verificar comprovante:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar comprovante',
      details: error.message 
    });
  }
});

// GET /api/payments - Listar todos os pagamentos (Admin)
app.get('/api/payments', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, payment_method, limit = 50, offset = 0 } = req.query;
    
    // Query simplificada que funciona mesmo sem colunas opcionais
    let query = `
      SELECT p.*, 
        o.id as order_id_ref,
        o.total as order_total,
        o.status as order_status,
        u.name as user_name,
        u.email as user_email,
        (SELECT GROUP_CONCAT(pr.name SEPARATOR ', ') 
         FROM order_items oi 
         JOIN products pr ON oi.product_id = pr.id 
         WHERE oi.order_id = o.id) as products_names,
        (SELECT GROUP_CONCAT(CONCAT(pr.isBook, '|', pr.book_type) SEPARATOR '||') 
         FROM order_items oi 
         JOIN products pr ON oi.product_id = pr.id 
         WHERE oi.order_id = o.id) as products_types
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (payment_method) {
      query += ' AND p.payment_method = ?';
      params.push(payment_method);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [payments] = await pool.execute(query, params);
    
    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('❌ [PAYMENTS] Erro ao listar:', error);
    res.status(500).json({ 
      error: 'Erro ao listar pagamentos',
      details: error.message 
    });
  }
});

// GET /api/payments/pending-receipts - Pagamentos pendentes de comprovante (Admin)
app.get('/api/payments/pending-receipts', authenticate, isAdmin, async (req, res) => {
  try {
    // Query simplificada - buscar apenas dados básicos
    const [result] = await pool.execute(
      `SELECT p.*, 
        u.name as user_name,
        u.email as user_email
       FROM payments p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.payment_method = 'bank_transfer'
       AND p.status IN ('pending', 'processing')
       ORDER BY p.created_at DESC`
    );
    
    res.json({
      success: true,
      count: result.length,
      payments: result
    });
  } catch (error) {
    console.error('❌ [PAYMENTS] Erro ao buscar comprovantes pendentes:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar comprovantes pendentes',
      details: error.message 
    });
  }
});

// GET /api/payments/status/:transactionId
app.get('/api/payments/status/:transactionId', async (req, res) => {
  try {
    const [payments] = await pool.execute(
      'SELECT * FROM payments WHERE transaction_id = ?',
      [req.params.transactionId]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }
    
    res.json(payments[0]);
  } catch (error) {
    console.error('❌ [PAYMENT STATUS] Erro:', error);
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
});

// GET /api/payments/pending-simulate - Listar pagamentos pendentes para simulação (Admin)
app.get('/api/payments/pending-simulate', authenticate, isAdmin, async (req, res) => {
  try {
    const [payments] = await pool.execute(
      `SELECT p.*, 
        u.name as user_name,
        u.email as user_email
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.status IN ('pending', 'processing')
      AND p.payment_method IN ('mpesa', 'emola', 'mkesh', 'card', 'paypal')
      ORDER BY p.created_at DESC`
    );
    
    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('❌ [PAYMENTS] Erro ao listar pendentes:', error);
    res.status(500).json({ 
      error: 'Erro ao listar pagamentos pendentes',
      details: error.message 
    });
  }
});

// POST /api/payments/:id/simulate - Simular confirmação/rejeição de pagamento (Admin)
app.post('/api/payments/:id/simulate', authenticate, isAdmin, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const { action } = req.body; // 'approve' ou 'reject'
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Ação inválida. Use "approve" ou "reject"' });
    }
    
    // Buscar pagamento
    const [payments] = await pool.execute(
      'SELECT * FROM payments WHERE id = ?',
      [paymentId]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    const payment = payments[0];
    const orderId = payment.order_id;
    
    if (action === 'approve') {
      // Aprovar pagamento
      await pool.execute(
        'UPDATE payments SET status = ?, completed_at = NOW() WHERE id = ?',
        ['completed', paymentId]
      );
      
      await pool.execute(
        'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
        ['confirmed', 'paid', orderId]
      );
      
      // Reduzir estoque
      try {
        await stockManager.reduceStockFromOrder(orderId);
      } catch (stockError) {
        console.error('⚠️ [PAYMENT] Erro ao reduzir estoque:', stockError);
      }
      
      // Buscar dados do pedido para notificações
      const [orderData] = await pool.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );
      
      if (orderData.length > 0) {
        const order = orderData[0];
        // Notificar admin
        await notifyAdminNewOrder(orderId, payment.amount, order.shipping_name);
        
        // Enviar email ao cliente
        if (order.shipping_email) {
          try {
            await sendEmail(order.shipping_email, emailTemplates.orderApproved, {
              id: orderId,
              total: payment.amount,
              status: 'confirmed'
            });
            
            // Criar notificação in-app
            await pool.execute(
              `INSERT INTO notifications (user_id, type, title, message, link, created_at)
               VALUES (?, 'order_approved', 'Pedido Aprovado', 'Seu pedido #${orderId} foi aprovado e está sendo processado!', '/profile#pedidos', NOW())`,
              [payment.user_id]
            );
          } catch (emailError) {
            console.error('⚠️ [PAYMENT] Erro ao enviar email:', emailError);
          }
        }
      }
      
      res.json({
        success: true,
        message: 'Pagamento aprovado e pedido confirmado',
        payment: { ...payment, status: 'completed' }
      });
      
    } else {
      // Rejeitar pagamento
      await pool.execute(
        'UPDATE payments SET status = ? WHERE id = ?',
        ['failed', paymentId]
      );
      
      await pool.execute(
        'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
        ['pending', 'failed', orderId]
      );
      
      res.json({
        success: true,
        message: 'Pagamento rejeitado',
        payment: { ...payment, status: 'failed' }
      });
    }
    
  } catch (error) {
    console.error('❌ [PAYMENTS] Erro ao simular pagamento:', error);
    res.status(500).json({ 
      error: 'Erro ao simular pagamento',
      details: error.message 
    });
  }
});

// ==========================================
// EMAIL ROUTES
// ==========================================

// POST /api/email/order-confirmation
app.post('/api/email/order-confirmation', async (req, res) => {
  try {
    const { email, order } = req.body;
    console.log('📧 [EMAIL] Enviando confirmação de pedido para:', email);
    
    const result = await sendEmail(email, emailTemplates.orderConfirmation, order);
    
    if (result.success) {
      console.log('✅ [EMAIL] Email enviado com sucesso');
    } else {
      console.log('⚠️ [EMAIL] Erro ao enviar email (não bloqueia o pedido):', result.error);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ [EMAIL] Erro:', error);
    res.status(500).json({ error: 'Erro ao enviar email', details: error.message });
  }
});

// POST /api/email/welcome
app.post('/api/email/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    const result = await sendEmail(email, emailTemplates.welcome, name);
    res.json(result);
  } catch (error) {
    console.error('❌ [EMAIL] Erro:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

// ==========================================
// RECEIPT ROUTES
// ==========================================

const PDFDocument = require('pdfkit');

// GET /api/receipt/:orderId - Gerar PDF do recibo profissional
app.get('/api/receipt/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log('🧾 [RECEIPT] Gerando recibo profissional para pedido:', orderId);
    
    // Buscar pedido com mais informações
    const [orders] = await pool.execute(`
      SELECT o.*, u.name as customer_name, u.email as customer_email,
             o.shipping_name, o.shipping_email, o.shipping_phone, 
             o.shipping_address, o.shipping_city, o.shipping_province,
             o.payment_method
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    const order = orders[0];
    
    // Buscar itens com nome do produto
    const [items] = await pool.execute(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    // Criar PDF com margens adequadas
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    
    // Configurar response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="recibo-${orderId}.pdf"`);
    
    // Pipe para resposta
    doc.pipe(res);
    
    // ==========================================
    // HEADER PROFISSIONAL (com logo)
    // ==========================================
    doc.fillColor('#1a1a1a');
    
    // Retângulo de cabeçalho
    doc.rect(50, 50, 495, 80)
       .fillColor('#2563eb')
       .fill()
       .fillColor('#ffffff');
    
    // Logo (opcional)
    try {
      const path = require('path');
      const fs = require('fs');
      const logoPath = process.env.RECEIPT_LOGO || path.join(__dirname, 'uploads', 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 60, 60, { width: 64, height: 64 });
      }
    } catch (_) { /* ignore */ }
    
    // Título da loja
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .text('Papel & Pixel', 140, 70, { 
        width: 395,
         align: 'center',
         color: '#ffffff'
       });
    
    // Subtítulo
    doc.fontSize(14)
       .font('Helvetica')
       .text('Materiais de Qualidade para Educação e Criatividade', 140, 105, {
        width: 395,
         align: 'center',
         color: '#ffffff'
       });
    
    // Tipo de documento
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('RECIBO DE COMPRA', 60, 140, {
         width: 475,
         align: 'center',
         color: '#1a1a1a'
       });
    
    doc.moveDown(1.5);
    
    // ==========================================
    // INFORMAÇÕES DO PEDIDO
    // ==========================================
    doc.fillColor('#1a1a1a');
    
    // Box de informações do pedido
    const infoBoxY = doc.y;
    doc.rect(50, infoBoxY, 495, 90)
       .fillColor('#f3f4f6')
       .fill()
       .fillColor('#1a1a1a');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('INFORMAÇÕES DO PEDIDO', 60, infoBoxY + 10);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Número do Pedido:`, 60, infoBoxY + 30, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#2563eb')
       .text(` #${order.id}`, { continued: false })
       .fillColor('#1a1a1a');
    
    const orderDate = new Date(order.created_at).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.font('Helvetica')
       .text(`Data da Compra: ${orderDate}`, 60, infoBoxY + 45);
    doc.text(`Status: ${getStatusLabel(order.status)}`, 60, infoBoxY + 60);
    doc.text(`Método de Pagamento: ${getPaymentMethodLabel(order.payment_method)}`, 60, infoBoxY + 75);
    
    doc.moveDown(2);
    
    // ==========================================
    // DADOS DO CLIENTE E ENDEREÇO (lado a lado)
    // ==========================================
    const clientBoxY = doc.y;
    const boxHeight = 110;
    
    // Dados do Cliente (esquerda)
    doc.rect(50, clientBoxY, 240, boxHeight)
       .fillColor('#f9fafb')
       .fill()
       .fillColor('#1a1a1a');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('DADOS DO CLIENTE', 60, clientBoxY + 10);
    
    doc.fontSize(10)
       .font('Helvetica');
    
    const clientName = order.shipping_name || order.customer_name || 'N/A';
    const clientEmail = order.shipping_email || order.customer_email || 'N/A';
    const clientPhone = order.shipping_phone || 'N/A';
    
    doc.text(`Nome: ${clientName}`, 60, clientBoxY + 30, { width: 220, ellipsis: true });
    doc.text(`Email: ${clientEmail}`, 60, clientBoxY + 45, { width: 220, ellipsis: true });
    doc.text(`Telefone: ${clientPhone}`, 60, clientBoxY + 60, { width: 220 });
    
    // Endereço de entrega (direita)
    doc.rect(305, clientBoxY, 240, boxHeight)
       .fillColor('#f9fafb')
       .fill()
       .fillColor('#1a1a1a');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('ENDEREÇO DE ENTREGA', 315, clientBoxY + 10);
    
    doc.fontSize(10)
       .font('Helvetica');
    
    // Formatar endereço corretamente
    const addressText = [];
    if (order.shipping_address && order.shipping_address !== 'N/A') {
      addressText.push(order.shipping_address);
    }
    
    const cityProvince = [];
    if (order.shipping_city) cityProvince.push(order.shipping_city);
    if (order.shipping_province) cityProvince.push(order.shipping_province);
    if (cityProvince.length > 0) {
      addressText.push(cityProvince.join(', '));
    }
    
    if (addressText.length === 0) {
      addressText.push('Não informado');
    }
    
    // Renderizar endereço
    addressText.forEach((line, i) => {
      doc.text(line, 315, clientBoxY + 30 + (i * 20), { width: 220, ellipsis: true });
    });
    
    doc.moveDown(3);
    
    // ==========================================
    // ITENS DO PEDIDO - TABELA PROFISSIONAL
    // ==========================================
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('ITENS DO PEDIDO', 50, doc.y);
    
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    const itemHeight = 25;
    
    // Cabeçalho da tabela
    doc.rect(50, tableTop, 495, itemHeight)
       .fillColor('#2563eb')
       .fill()
       .fillColor('#ffffff');
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('PRODUTO', 60, tableTop + 7, { width: 310 })
       .text('QTD', 375, tableTop + 7)
       .text('PREÇO UNIT.', 420, tableTop + 7, { width: 70 })
       .text('SUBTOTAL', 495, tableTop + 7, { align: 'right', width: 50 });
    
    // Linhas dos itens
    items.forEach((item, index) => {
      const y = tableTop + (index + 1) * itemHeight;
      
      // Alternância de cores
      if (index % 2 === 0) {
        doc.rect(50, y, 495, itemHeight)
           .fillColor('#f9fafb')
           .fill();
      }
      
      doc.fillColor('#1a1a1a')
         .font('Helvetica')
         .fontSize(9)
         .text(item.product_name || `Produto #${item.product_id}`, 60, y + 8, { width: 310, ellipsis: true })
         .text(item.quantity.toString(), 375, y + 8)
         .text(`${parseFloat(item.price || 0).toFixed(2)} MZN`, 420, y + 8, { width: 70 })
         .text(`${(parseFloat(item.price || 0) * item.quantity).toFixed(2)} MZN`, 495, y + 8, { align: 'right', width: 50 });
    });
    
    // Linha divisória final
    const finalLineY = tableTop + (items.length + 1) * itemHeight;
    doc.moveTo(50, finalLineY)
       .lineTo(545, finalLineY)
       .strokeColor('#e5e7eb')
       .lineWidth(2)
       .stroke();
    
    doc.moveDown(1.5);
    
    // ==========================================
    // TOTAL
    // ==========================================
    const totalBoxY = doc.y;
    doc.rect(350, totalBoxY, 195, 50)
       .fillColor('#10b981')
       .fill()
       .fillColor('#ffffff');
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('TOTAL PAGO', 360, totalBoxY + 10);
    
    doc.fontSize(20)
       .text(`${parseFloat(order.total || 0).toFixed(2)} MZN`, 360, totalBoxY + 28);
    
    doc.moveDown(3);
    
    // ==========================================
    // RODAPÉ COM PARCEIROS E MÉTODOS DE PAGAMENTO
    // ==========================================
    const footerY = 680;
    
    // Linha divisória
    doc.moveTo(50, footerY)
       .lineTo(545, footerY)
       .strokeColor('#e5e7eb')
       .lineWidth(1)
       .stroke();
    
    doc.moveDown(1);
    
    // Agradecimento
    doc.fillColor('#1a1a1a')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Obrigado pela sua compra!', 50, doc.y, { align: 'center', width: 495 });
    
    doc.moveDown(0.5);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('Papel & Pixel - Transformando ideias em realidade', 50, doc.y, { align: 'center', width: 495 });
    
    doc.moveDown(1);
    
    // Métodos de Pagamento Aceitos
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#4b5563')
       .text('MÉTODOS DE PAGAMENTO ACEITOS:', 50, doc.y, { width: 495, align: 'center' });
    
    doc.moveDown(0.3);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('PayPal • Cartão de Crédito/Débito • M-Pesa • EMOLA • Mkesh • Dinheiro na Entrega', 
             50, doc.y, { width: 495, align: 'center' });
    
    doc.moveDown(1);
    
    // Parceiros/Marcas
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#4b5563')
       .text('NOSSOS PARCEIROS:', 50, doc.y, { width: 495, align: 'center' });
    
    doc.moveDown(0.3);
    
    try {
      const path = require('path');
      const fs = require('fs');
      const brandsEnv = process.env.RECEIPT_BRANDS || '';
      const brandPaths = brandsEnv.split(',').map(s => s.trim()).filter(Boolean)
        .map(p => p.startsWith('/') || p.includes(':') ? p : path.join(__dirname, p));
      const logos = brandPaths.filter(p => { try { return fs.existsSync(p); } catch { return false; } }).slice(0, 5);
      if (logos.length > 0) {
        const totalWidth = logos.length * 64 + (logos.length - 1) * 16;
        let x = 50 + (495 - totalWidth) / 2;
        const y = doc.y;
        logos.forEach(lp => { doc.image(lp, x, y, { width: 64, height: 32 }); x += 64 + 16; });
        doc.moveDown(2);
      } else {
        doc.fontSize(9).font('Helvetica')
           .text('Editoras Premium • Marcas Internacionais • Fornecedores Locais', 50, doc.y, { width: 495, align: 'center' });
      }
    } catch (_) {
      doc.fontSize(9).font('Helvetica')
         .text('Editoras Premium • Marcas Internacionais • Fornecedores Locais', 50, doc.y, { width: 495, align: 'center' });
    }
    
    doc.moveDown(1);
    
    // Informações de contato
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('📧 atendimento@papelepixel.co.mz  •  📱 +258 874383621', 
             50, doc.y, { width: 495, align: 'center' });
    
    doc.text('Moçambique - Cidade da Beira', 50, doc.y, { width: 495, align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(8).fillColor('#9ca3af')
       .text('Documento processado por computador — válido sem assinatura.', 50, doc.y, { width: 495, align: 'center' });
    
    // Finalizar PDF
    doc.end();
    
    console.log('✅ [RECEIPT] Recibo profissional gerado com sucesso');
    
  } catch (error) {
    console.error('❌ [RECEIPT] Erro ao gerar recibo:', error);
    res.status(500).json({ error: 'Erro ao gerar recibo', details: error.message });
  }
});

// Funções auxiliares para labels
function getStatusLabel(status) {
  const labels = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    processing: 'Em Processamento',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
}

function getPaymentMethodLabel(method) {
  const labels = {
    paypal: 'PayPal',
    card: 'Cartão de Crédito/Débito',
    mpesa: 'M-Pesa',
    emola: 'EMOLA',
    mkesh: 'Mkesh',
    cash: 'Dinheiro na Entrega'
  };
  return labels[method] || method || 'N/A';
}


// POST /api/notifications/sms
app.post('/api/notifications/sms', async (req, res) => {
  try {
    const { phone, message } = req.body;
    const result = await sendSMSNotification(phone, message);
    res.json(result);
  } catch (error) {
    console.error('❌ [SMS] Erro:', error);
    res.status(500).json({ error: 'Erro ao enviar SMS' });
  }
});

// ==========================================
// NEWSLETTER & MARKETING ROUTES
// ==========================================

// POST /api/subscribers - Inscrever na newsletter
app.post('/api/subscribers', async (req, res) => {
  try {
    const { email, name, source } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    // Verificar se já existe
    const [existing] = await pool.execute(
      'SELECT * FROM subscribers WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      console.log(`📧 [NEWSLETTER] Email já inscrito: ${email} (fonte: ${source || 'desconhecida'})`);
      return res.status(200).json({ 
        success: true, 
        message: 'Você já está inscrito na nossa newsletter!',
        subscriber: existing[0]
      });
    }
    
    // Inserir novo subscriber (nome é opcional, usa "Assinante" se não fornecido)
    const subscriberName = name || 'Assinante';
    const [result] = await pool.execute(
      'INSERT INTO subscribers (email, name) VALUES (?, ?)',
      [email, subscriberName]
    );
    
    const [newSubscriber] = await pool.execute(
      'SELECT * FROM subscribers WHERE id = ?',
      [result.insertId]
    );
    
    console.log(`✅ [NEWSLETTER] Novo inscrito: ${email} (fonte: ${source || 'desconhecida'})`);
    
    res.status(201).json({
      success: true,
      message: 'Inscrição realizada com sucesso! Você receberá nossas promoções.',
      subscriber: newSubscriber[0]
    });
    
  } catch (error) {
    console.error('❌ [NEWSLETTER] Erro ao inscrever:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(200).json({ 
        success: true, 
        message: 'Você já está inscrito na nossa newsletter!'
      });
    }
    
    res.status(500).json({ error: 'Erro ao processar inscrição' });
  }
});

// POST /api/subscribers/unsubscribe - Cancelar inscrição (público, por email)
app.post('/api/subscribers/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    // Verificar se existe
    const [existing] = await pool.execute(
      'SELECT * FROM subscribers WHERE email = ?',
      [email]
    );
    
    if (existing.length === 0) {
      // Por segurança, retornar sucesso mesmo se não existir
      return res.json({
        success: true,
        message: 'Email removido da nossa lista de newsletter'
      });
    }
    
    // Remover subscriber
    await pool.execute(
      'DELETE FROM subscribers WHERE email = ?',
      [email]
    );
    
    console.log('🗑️ [NEWSLETTER] Inscrição cancelada:', email);
    
    res.json({
      success: true,
      message: 'Você foi removido da nossa lista de newsletter. Você não receberá mais nossos emails promocionais.'
    });
    
  } catch (error) {
    console.error('❌ [NEWSLETTER] Erro ao cancelar inscrição:', error);
    res.status(500).json({ error: 'Erro ao cancelar inscrição' });
  }
});

// GET /api/subscribers/unsubscribe/:email - Cancelar inscrição via link (público)
app.get('/api/subscribers/unsubscribe/:email', async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/unsubscribe?error=invalid`);
    }
    
    // Verificar se existe
    const [existing] = await pool.execute(
      'SELECT * FROM subscribers WHERE email = ?',
      [email]
    );
    
    if (existing.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/unsubscribe?error=notfound`);
    }
    
    // Remover subscriber
    await pool.execute(
      'DELETE FROM subscribers WHERE email = ?',
      [email]
    );
    
    console.log('🗑️ [NEWSLETTER] Inscrição cancelada via link:', email);
    
    // Redirecionar para página de confirmação
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/unsubscribe?success=true&email=${encodeURIComponent(email)}`);
    
  } catch (error) {
    console.error('❌ [NEWSLETTER] Erro ao cancelar inscrição:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/unsubscribe?error=server`);
  }
});

// GET /api/subscribers - Listar assinantes (Admin)
app.get('/api/subscribers', authenticate, isAdmin, async (req, res) => {
  try {
    const [subscribers] = await pool.execute(
      'SELECT * FROM subscribers ORDER BY subscribed_at DESC'
    );
    
    res.json({
      success: true,
      count: subscribers.length,
      subscribers
    });
  } catch (error) {
    console.error('❌ [NEWSLETTER] Erro ao listar:', error);
    res.status(500).json({ error: 'Erro ao listar assinantes' });
  }
});

// POST /api/marketing/send - Enviar promoção para todos (Admin)
app.post('/api/marketing/send', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, content, bannerUrl, couponCode, couponText, ctaLabel, destinationUrl } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }
    
    // Buscar todos os subscribers (garantir que name não seja NULL ou vazio)
    const [subscribers] = await pool.execute(
      'SELECT id, email, COALESCE(NULLIF(name, ""), "Cliente") as name, subscribed_at FROM subscribers WHERE email IS NOT NULL ORDER BY subscribed_at DESC'
    );
    
    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'Nenhum assinante encontrado' });
    }
    
    // Salvar campanha (incluindo campos extras)
    const [campaignResult] = await pool.execute(
      'INSERT INTO campaigns (title, content, status, send_date, subscribers_count, banner_url, coupon_code, coupon_text, cta_label, destination_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, content, 'sent', new Date(), subscribers.length, bannerUrl || null, couponCode || null, couponText || null, ctaLabel || null, destinationUrl || null]
    );
    
    const campaignId = campaignResult.insertId;
    
    // Enviar emails
    const emailService = require('./config/email');
    let successCount = 0;
    let errorCount = 0;
    
    console.log(`📧 [MARKETING] Enviando promoção "${title}" para ${subscribers.length} assinantes...`);
    
    for (const subscriber of subscribers) {
      try {
        const subscriberEmail = subscriber.email;
        // Garantir que o nome não seja NULL ou vazio (já tratado na query, mas garantindo aqui também)
        const subscriberName = subscriber.name && subscriber.name.trim() !== '' ? subscriber.name.trim() : 'Cliente';
        
        console.log(`📧 [MARKETING] Enviando para: ${subscriberEmail} (Nome: ${subscriberName})`);
        
        const emailData = {
          name: subscriberName,
          email: subscriberEmail,
          title: title,
          content: content,
          bannerUrl: bannerUrl || process.env.CAMPAIGN_BANNER || null,
          couponCode: couponCode || process.env.CAMPAIGN_COUPON || null,
          couponText: couponText || process.env.CAMPAIGN_COUPON_TEXT || null,
          ctaLabel: ctaLabel || process.env.CAMPAIGN_CTA_LABEL || undefined,
          destinationUrl: destinationUrl || `${process.env.FRONTEND_URL || 'http://127.0.0.1:8080'}/promotions`
        };
        
        const emailResult = await emailService.sendEmail(
          subscriberEmail,
          emailService.emailTemplates.promotion,
          emailData
        );
        
        if (emailResult.success) {
          successCount++;
          console.log(`✅ [MARKETING] Email enviado com sucesso para ${subscriberEmail}`);
        } else {
          errorCount++;
          console.warn(`⚠️ [MARKETING] Erro ao enviar para ${subscriberEmail}:`, emailResult.error);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ [MARKETING] Erro ao enviar para ${subscriber.email}:`, error.message);
        console.error(`❌ [MARKETING] Stack trace:`, error.stack);
      }
    }
    
    console.log(`✅ [MARKETING] Enviado: ${successCount} | Erros: ${errorCount}`);
    
    res.json({
      success: true,
      message: `Promoção "${title}" enviada para ${successCount} assinantes!`,
      campaignId,
      stats: {
        total: subscribers.length,
        sent: successCount,
        errors: errorCount
      }
    });
    
  } catch (error) {
    console.error('❌ [MARKETING] Erro ao enviar promoção:', error);
    res.status(500).json({ error: 'Erro ao enviar promoção' });
  }
});

// GET /api/campaigns - Listar campanhas (Admin)
app.get('/api/campaigns', authenticate, isAdmin, async (req, res) => {
  try {
    const [campaigns] = await pool.execute(
      'SELECT * FROM campaigns ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    console.error('❌ [MARKETING] Erro ao listar campanhas:', error);
    res.status(500).json({ error: 'Erro ao listar campanhas' });
  }
});

// DELETE /api/campaigns/:id - Deletar campanha (Admin)
app.delete('/api/campaigns/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a campanha existe
    const [existing] = await pool.execute(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Campanha não encontrada' });
    }
    
    // Deletar campanha
    await pool.execute(
      'DELETE FROM campaigns WHERE id = ?',
      [id]
    );
    
    console.log(`🗑️ [MARKETING] Campanha ${id} deletada`);
    
    res.json({
      success: true,
      message: 'Campanha deletada com sucesso'
    });
  } catch (error) {
    console.error('❌ [MARKETING] Erro ao deletar campanha:', error);
    res.status(500).json({ error: 'Erro ao deletar campanha' });
  }
});

// ==========================================
// RIHA WEBHOOK
// ==========================================

app.post('/api/payments/riha/webhook', express.json(), async (req, res) => {
  try {
    console.log('📩 [RIHA WEBHOOK] Recebido:', JSON.stringify(req.body, null, 2));
    
    const { event, data, timestamp } = req.body;
    
    if (!event || !data) {
      return res.status(400).json({ error: 'Formato inválido' });
    }
    
    // Verificar se é evento de pagamento completo
    if (event === 'payment.completed') {
      const { payment_link_id, amount, metadata } = data;
      
      if (!metadata || !metadata.order_id) {
        console.error('❌ [RIHA WEBHOOK] Metadata ou order_id ausente');
        return res.status(400).json({ error: 'Dados incompletos' });
      }
      
      const orderId = metadata.order_id;
      
      // Atualizar pagamento
      const [payments] = await pool.execute(
        `SELECT * FROM payments WHERE transaction_id LIKE ?`,
        [`RIHA-${payment_link_id}%`]
      );
      
      if (payments.length > 0) {
        const payment = payments[0];
        
        // Atualizar status do pagamento
        await pool.execute(
          'UPDATE payments SET status = ?, completed_at = NOW() WHERE id = ?',
          ['paid', payment.id]
        );
        
        // Atualizar status do pedido
        await pool.execute(
          'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
          ['confirmed', 'paid', orderId]
        );
        
        // REDUZIR ESTOQUE
        await stockManager.reduceStockFromOrder(orderId);
        
        // Buscar dados do pedido para enviar emails
        const [orders] = await pool.execute(
          'SELECT * FROM orders WHERE id = ?',
          [orderId]
        );
        
        if (orders.length > 0) {
          const order = orders[0];
          
          // Notificar admin
          try {
            await notifyAdminNewOrder(orderId, amount, order.shipping_name);
          } catch (emailError) {
            console.error('❌ [RIHA WEBHOOK] Erro ao notificar admin:', emailError);
          }
          
          // Notificar cliente
          try {
            await sendEmail(order.shipping_email, emailTemplates.orderConfirmation, {
              id: orderId,
              total: amount,
              status: 'confirmed'
            });
            console.log('✅ [RIHA WEBHOOK] Email enviado ao cliente');
          } catch (emailError) {
            console.error('❌ [RIHA WEBHOOK] Erro ao enviar email:', emailError);
          }
          
          // Criar notificação in-app
          await pool.execute(
            `INSERT INTO notifications (user_id, type, title, message, link, created_at)
             VALUES (?, 'order_approved', 'Pedido aprovado!', 'Seu pedido #${orderId} foi confirmado e está sendo preparado.', '/profile#pedidos', NOW())`,
            [order.user_id]
          );
        }
        
        console.log(`✅ [RIHA WEBHOOK] Pedido ${orderId} confirmado`);
      } else {
        console.error('❌ [RIHA WEBHOOK] Pagamento não encontrado para payment_link_id:', payment_link_id);
      }
    }
    
    // Sempre retornar 200 para a RIHA
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ [RIHA WEBHOOK] Erro:', error);
    // Retornar 200 mesmo em caso de erro para não bloquear a RIHA
    res.status(200).json({ received: true, error: error.message });
  }
});

// ==========================================
// RETURNS ROUTES
// ==========================================

app.use('/api/returns', require('./routes/returns'));

// ==========================================
// REVIEWS ROUTES
// ==========================================

app.use('/api/reviews', require('./routes/reviews'));

// ==========================================
// NOTIFICATIONS ROUTES
// ==========================================

app.use('/api/notifications', require('./routes/notifications'));

// ==========================================
// ABANDONED CARTS ROUTES
// ==========================================

app.use('/api/abandoned-carts', require('./routes/abandoned-carts'));

// ==========================================
// A/B TESTING ROUTES
// ==========================================

app.use('/api/ab-testing', require('./routes/ab-testing'));

// ==========================================
// COUPONS ROUTES
// ==========================================

app.use('/api/coupons', require('./routes/coupons'));

// ==========================================
// DEBUG ROUTES (REMOVER EM PRODUÇÃO)
// ==========================================

app.use('/api/debug', require('./routes/debug'));

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    method: req.method,
    path: req.path,
    hint: 'Verifique se está usando o método correto (GET/POST) e a URL correta'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// ==========================================
// START SERVER
// ==========================================

// ==========================================
// CARRINHOS ABANDONADOS E MARKETING
// ==========================================

// Criar tabelas se não existirem
(async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS abandoned_carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        session_id VARCHAR(255),
        email VARCHAR(255),
        cart_items JSON NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        email_sent_count INT DEFAULT 0,
        recovered BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_last_activity (last_activity),
        INDEX idx_recovered (recovered)
      )
    `);
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS product_notifications_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        notification_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        subscribers_notified INT DEFAULT 0,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_notification (product_id)
      )
    `);
    
    console.log('✅ Tabelas de marketing criadas/verificadas');
  } catch (error) {
    console.warn('⚠️ Erro ao criar tabelas de marketing:', error.message);
  }
})();

// POST /api/cart/save - Salvar carrinho (abandonado)
app.post('/api/cart/save', async (req, res) => {
  try {
    const { userId, sessionId, email, items, total } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }
    
    const cartData = {
      user_id: userId || null,
      session_id: sessionId || `session_${Date.now()}`,
      email: email || null,
      cart_items: JSON.stringify(items),
      total: total || 0,
      last_activity: new Date()
    };
    
    // Verificar se já existe carrinho para este usuário/sessão
    let query = 'SELECT * FROM abandoned_carts WHERE ';
    let params = [];
    
    if (userId) {
      query += 'user_id = ? AND recovered = false';
      params = [userId];
    } else if (sessionId) {
      query += 'session_id = ? AND recovered = false';
      params = [sessionId];
    } else {
      return res.status(400).json({ error: 'userId ou sessionId é obrigatório' });
    }
    
    const [existing] = await pool.execute(query, params);
    
    if (existing.length > 0) {
      // Atualizar carrinho existente
      await pool.execute(
        `UPDATE abandoned_carts 
         SET cart_items = ?, total = ?, last_activity = ?, email = ?
         WHERE id = ?`,
        [cartData.cart_items, cartData.total, cartData.last_activity, cartData.email, existing[0].id]
      );
      
      return res.json({ success: true, cartId: existing[0].id, message: 'Carrinho atualizado' });
    } else {
      // Criar novo carrinho
      const [result] = await pool.execute(
        `INSERT INTO abandoned_carts (user_id, session_id, email, cart_items, total, last_activity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [cartData.user_id, cartData.session_id, cartData.email, cartData.cart_items, cartData.total, cartData.last_activity]
      );
      
      return res.json({ success: true, cartId: result.insertId, message: 'Carrinho salvo' });
    }
  } catch (error) {
    console.error('❌ Erro ao salvar carrinho:', error);
    res.status(500).json({ error: 'Erro ao salvar carrinho', details: error.message });
  }
});

// GET /api/cart/abandoned - Listar carrinhos abandonados (Admin)
app.get('/api/cart/abandoned', authenticate, isAdmin, async (req, res) => {
  try {
    const [carts] = await pool.execute(
      `SELECT ac.*, u.name, u.email as user_email
       FROM abandoned_carts ac
       LEFT JOIN users u ON ac.user_id = u.id
       WHERE ac.recovered = false
       AND ac.last_activity < DATE_SUB(NOW(), INTERVAL 1 HOUR)
       ORDER BY ac.last_activity DESC
       LIMIT 100`
    );
    
    res.json({ success: true, carts });
  } catch (error) {
    console.error('❌ Erro ao buscar carrinhos abandonados:', error);
    res.status(500).json({ error: 'Erro ao buscar carrinhos abandonados' });
  }
});

// POST /api/cart/:id/recover - Marcar carrinho como recuperado
app.post('/api/cart/:id/recover', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE abandoned_carts SET recovered = true WHERE id = ?',
      [req.params.id]
    );
    
    res.json({ success: true, message: 'Carrinho marcado como recuperado' });
  } catch (error) {
    console.error('❌ Erro ao recuperar carrinho:', error);
    res.status(500).json({ error: 'Erro ao recuperar carrinho' });
  }
});

// POST /api/marketing/send-abandoned-carts - Enviar emails para carrinhos abandonados
app.post('/api/marketing/send-abandoned-carts', authenticate, isAdmin, async (req, res) => {
  try {
    const { hours = 24 } = req.body; // Horas de inatividade padrão: 24h
    
    // Buscar carrinhos abandonados (não recuperados, sem email enviado nas últimas 24h)
    const [carts] = await pool.execute(
      `SELECT ac.*, u.name, u.email as user_email
       FROM abandoned_carts ac
       LEFT JOIN users u ON ac.user_id = u.id
       WHERE ac.recovered = false
       AND ac.last_activity < DATE_SUB(NOW(), INTERVAL ? HOUR)
       AND (ac.email_sent_count = 0 OR ac.last_activity > DATE_SUB(NOW(), INTERVAL 48 HOUR))
       ORDER BY ac.last_activity ASC
       LIMIT 50`,
      [hours]
    );
    
    if (carts.length === 0) {
      return res.json({ success: true, message: 'Nenhum carrinho abandonado encontrado', sent: 0 });
    }
    
    const emailService = require('./config/email');
    let successCount = 0;
    let errorCount = 0;
    
    for (const cart of carts) {
      try {
        const email = cart.email || cart.user_email;
        if (!email) {
          console.warn(`⚠️ [CARRINHO] Sem email para carrinho ${cart.id}`);
          continue;
        }
        
        const items = JSON.parse(cart.cart_items);
        const itemsList = items.map((item) => 
          `- ${item.name} (Qtd: ${item.quantity}) - ${(item.price * item.quantity).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}`
        ).join('\n');
        
        // Montar dados para template moderno
        const frontendUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
        const itemsForTemplate = items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          image: i.image || i.imageUrl || ''
        }));

        const emailResult = await emailService.sendEmail(
          email,
          require('./config/email').emailTemplates.abandonedCart,
          {
            name: cart.name || 'Cliente',
            email: email,
            items: itemsForTemplate,
            subtotal: Number(cart.total || 0),
            coupon: process.env.ABANDONED_CART_COUPON || null,
            checkoutUrl: frontendUrl,
            bannerUrl: process.env.ABANDONED_CART_BANNER || null
          }
        );
        
        if (emailResult.success) {
          successCount++;
          await pool.execute(
            'UPDATE abandoned_carts SET email_sent_count = email_sent_count + 1, updated_at = NOW() WHERE id = ?',
            [cart.id]
          );
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ [CARRINHO] Erro ao enviar para carrinho ${cart.id}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      message: `Emails enviados: ${successCount} | Erros: ${errorCount}`,
      sent: successCount,
      errors: errorCount,
      total: carts.length
    });
  } catch (error) {
    console.error('❌ Erro ao enviar emails de carrinho abandonado:', error);
    res.status(500).json({ error: 'Erro ao enviar emails', details: error.message });
  }
});

// POST /api/marketing/notify-new-products - Notificar produtos novos
app.post('/api/marketing/notify-new-products', authenticate, isAdmin, async (req, res) => {
  try {
    // Buscar produtos criados nas últimas 24h que ainda não foram notificados
    const [newProducts] = await pool.execute(
      `SELECT p.* 
       FROM products p
       LEFT JOIN product_notifications_log pnl ON p.id = pnl.product_id
       WHERE p.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
       AND pnl.id IS NULL
       ORDER BY p.created_at DESC`
    );
    
    if (newProducts.length === 0) {
      return res.json({ success: true, message: 'Nenhum produto novo encontrado', notified: 0 });
    }
    
    // Buscar assinantes
    // Buscar subscribers com nome garantido (não NULL/vazio)
    const [subscribers] = await pool.execute(
      'SELECT id, email, COALESCE(NULLIF(name, ""), "Cliente") as name, subscribed_at FROM subscribers WHERE email IS NOT NULL'
    );
    
    if (subscribers.length === 0) {
      return res.json({ success: false, message: 'Nenhum assinante encontrado' });
    }
    
    const emailService = require('./config/email');
    const API_URL = process.env.API_URL || 'http://localhost:3001';
    let totalSent = 0;
    
    for (const product of newProducts) {
      try {
        const productImage = product.image?.startsWith('http') 
          ? product.image 
          : `${API_URL}${product.image?.startsWith('/') ? '' : '/'}${product.image || '/uploads/products/placeholder.jpg'}`;
        
        let notifiedCount = 0;
        const frontendUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
        
        for (const subscriber of subscribers) {
          try {
            const emailResult = await emailService.sendEmail(
              subscriber.email,
              require('./config/email').emailTemplates.productAnnouncement,
              {
                name: subscriber.name && subscriber.name.trim() !== '' ? subscriber.name.trim() : 'Cliente',
                email: subscriber.email,
                product: {
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  image: productImage
                },
                productUrl: `${frontendUrl}/products/${product.id}`,
                bannerUrl: process.env.NEW_PRODUCT_BANNER || null
              }
            );
            
            if (emailResult.success) {
              notifiedCount++;
            }
          } catch (error) {
            console.error(`❌ Erro ao enviar para ${subscriber.email}:`, error.message);
          }
        }
        
        // Registrar notificação enviada
        await pool.execute(
          'INSERT INTO product_notifications_log (product_id, subscribers_notified) VALUES (?, ?)',
          [product.id, notifiedCount]
        );
        
        totalSent += notifiedCount;
        
      } catch (error) {
        console.error(`❌ Erro ao processar produto ${product.id}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      message: `Notificações enviadas para ${totalSent} assinantes sobre ${newProducts.length} produtos novos`,
      products: newProducts.length,
      notified: totalSent
    });
  } catch (error) {
    console.error('❌ Erro ao notificar produtos novos:', error);
    res.status(500).json({ error: 'Erro ao notificar produtos novos', details: error.message });
  }
});

// ==========================================
// COUPONS ROUTES
// ==========================================

// GET /api/coupons - Listar todos os cupons (Admin)
app.get('/api/coupons', authenticate, isAdmin, async (req, res) => {
  try {
    const [coupons] = await pool.execute(`
      SELECT c.* 
      FROM coupons c
      ORDER BY c.created_at DESC
    `);
    
    // Adicionar estatísticas de uso e mapear campos
    for (let coupon of coupons) {
      const [usageStats] = await pool.execute(
        'SELECT COUNT(*) as total_uses, SUM(discount_amount) as total_discounts FROM coupon_usages WHERE coupon_id = ?',
        [coupon.id]
      );
      coupon.totalUses = usageStats[0].total_uses || 0;
      coupon.totalDiscounts = usageStats[0].total_discounts || 0;
      
      // Mapear campos para compatibilidade
      coupon.type = coupon.discount_type;
      coupon.value = coupon.discount_value;
    }
    
    res.json({ success: true, coupons });
  } catch (error) {
    console.error('❌ Erro ao listar cupons:', error);
    res.status(500).json({ error: 'Erro ao listar cupons' });
  }
});

// POST /api/coupons - Criar cupom (Admin)
app.post('/api/coupons', authenticate, isAdmin, async (req, res) => {
  try {
    const { code, type, value, category, productId, expiresAt, usageLimit, active, minPurchase, description } = req.body;
    
    if (!code || !type || !value) {
      return res.status(400).json({ error: 'Código, tipo e valor são obrigatórios' });
    }
    
    // Verificar se código já existe
    const [existing] = await pool.execute('SELECT id FROM coupons WHERE code = ?', [code]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Código de cupom já existe' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO coupons (code, discount_type, discount_value, expires_at, usage_limit, active, min_purchase)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, type, value, expiresAt || null, usageLimit || null, active !== false, minPurchase || null]
    );
    
    res.json({ success: true, couponId: result.insertId, message: 'Cupom criado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao criar cupom:', error);
    res.status(500).json({ error: 'Erro ao criar cupom' });
  }
});

// GET /api/coupons/validate/:code - Validar cupom (para o cliente)
app.get('/api/coupons/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const cartTotal = parseFloat(req.query.total || 0);
    
    const [coupons] = await pool.execute(
      'SELECT * FROM coupons WHERE code = ? AND active = TRUE',
      [code.toUpperCase()]
    );
    
    if (coupons.length === 0) {
      return res.json({ valid: false, message: 'Cupom inválido ou inativo' });
    }
    
    const coupon = coupons[0];
    
    // Mapear campos
    const couponType = coupon.discount_type;
    const couponValue = coupon.discount_value;
    
    // Verificar se expirou
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.json({ valid: false, message: 'Cupom expirado' });
    }
    
    // Verificar limite de uso
    const [usageCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM coupon_usages WHERE coupon_id = ?',
      [coupon.id]
    );
    const count = usageCount[0].count || 0;
    
    if (coupon.usage_limit && count >= coupon.usage_limit) {
      return res.json({ valid: false, message: 'Cupom atingiu o limite de uso' });
    }
    
    // Verificar valor mínimo de compra
    if (coupon.min_purchase && cartTotal < coupon.min_purchase) {
      return res.json({ 
        valid: false, 
        message: `Valor mínimo de compra: ${Number(coupon.min_purchase).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}` 
      });
    }
    
    // Calcular desconto
    let discount = 0;
    if (couponType === 'percentage') {
      discount = (cartTotal * couponValue) / 100;
    } else if (couponType === 'fixed') {
      discount = Math.min(couponValue, cartTotal); // Não pode ser maior que o total
    }
    
    res.json({ 
      valid: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: couponType,
        value: couponValue,
        discount: discount
      }
    });
  } catch (error) {
    console.error('❌ Erro ao validar cupom:', error);
    res.status(500).json({ error: 'Erro ao validar cupom' });
  }
});

// PUT /api/coupons/:id - Atualizar cupom (Admin)
app.put('/api/coupons/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, category, productId, expiresAt, usageLimit, active, minPurchase, description } = req.body;
    
    const [result] = await pool.execute(
      `UPDATE coupons 
       SET code = ?, discount_type = ?, discount_value = ?, expires_at = ?, usage_limit = ?, active = ?, min_purchase = ?
       WHERE id = ?`,
      [code, type, value, expiresAt || null, usageLimit || null, active !== false, minPurchase || null, id]
    );
    
    res.json({ success: true, message: 'Cupom atualizado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao atualizar cupom:', error);
    res.status(500).json({ error: 'Erro ao atualizar cupom' });
  }
});

// DELETE /api/coupons/:id - Excluir cupom (Admin)
app.delete('/api/coupons/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ success: true, message: 'Cupom excluído com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao excluir cupom:', error);
    res.status(500).json({ error: 'Erro ao excluir cupom' });
  }
});

// GET /api/coupons/:id/stats - Estatísticas de uso do cupom (Admin)
app.get('/api/coupons/:id/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [usages] = await pool.execute(`
      SELECT cu.*, u.name as user_name, u.email as user_email, o.id as order_id
      FROM coupon_usages cu
      LEFT JOIN users u ON cu.user_id = u.id
      LEFT JOIN orders o ON cu.order_id = o.id
      WHERE cu.coupon_id = ?
      ORDER BY cu.created_at DESC
    `, [id]);
    
    const [coupon] = await pool.execute('SELECT * FROM coupons WHERE id = ?', [id]);
    
    if (coupon.length === 0) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }
    
    res.json({ 
      success: true, 
      coupon: coupon[0],
      usages,
      totalUses: usages.length,
      totalDiscounts: usages.reduce((sum, u) => sum + parseFloat(u.discount_amount || 0), 0)
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas do cupom:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`   Papel & Pixel Backend API`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n   Rotas disponíveis:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/products');
  console.log('   POST /api/products (Admin)');
  console.log('   PUT  /api/products/:id (Admin)');
  console.log('   DELETE /api/products/:id (Admin)');
  console.log('   POST /api/upload (Admin - Upload de imagens)');
  console.log('   POST /api/upload/book (Admin - Upload de PDF de livros)');
  console.log('   GET  /api/orders (Admin - todos pedidos)');
  console.log('   GET  /api/orders/user/:userId (Pedidos do usuário)');
  console.log('   POST /api/orders');
  console.log('   📧 Newsletter:');
  console.log('      POST /api/subscribers (Inscrever)');
  console.log('      GET  /api/subscribers (Listar - Admin)');
  console.log('      POST /api/marketing/send (Enviar promoção - Admin)');
  console.log('      GET  /api/campaigns (Listar campanhas - Admin)');
  console.log('   🎫 Cupons:');
  console.log('      GET  /api/coupons (Listar - Admin)');
  console.log('      POST /api/coupons (Criar - Admin)');
  console.log('      GET  /api/coupons/validate/:code (Validar cupom)');
  console.log('      PUT  /api/coupons/:id (Atualizar - Admin)');
  console.log('      DELETE /api/coupons/:id (Excluir - Admin)');
  console.log('      GET  /api/coupons/:id/stats (Estatísticas - Admin)');
  console.log('   📄 Outros:');
  console.log('      GET  /api/returns (Devoluções)');
  console.log('      POST /api/returns (Solicitar devolução)');
  console.log('      GET  /api/receipt/:orderId (Recibo PDF)');
  console.log('   🛒 Carrinhos Abandonados:');
  console.log('      POST /api/abandoned-carts/save (Salvar carrinho)');
  console.log('      POST /api/abandoned-carts/recover (Marcar como recuperado)');
  console.log('      GET  /api/abandoned-carts/list (Listar - Admin)');
  console.log('      POST /api/abandoned-carts/process (Processar e enviar emails - Admin)');
  console.log('      GET  /api/abandoned-carts/stats (Estatísticas - Admin)');
  console.log('========================================\n');
  
  // Iniciar jobs agendados (cron)
  console.log('🚀 Iniciando jobs agendados...');
  cronJobs.startAllJobs();
});

