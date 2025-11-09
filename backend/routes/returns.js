const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Garantir que a tabela returns existe
async function ensureReturnsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS returns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        user_id INT NOT NULL,
        reason TEXT NOT NULL,
        reason_type VARCHAR(50) NULL,
        image_url VARCHAR(500) NULL,
        status ENUM('pending', 'analyzing', 'approved', 'rejected', 'received', 'processed', 'cancelled') DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        received_at TIMESTAMP NULL,
        refund_amount DECIMAL(10, 2),
        refund_processed_at TIMESTAMP NULL,
        notes TEXT,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status)
      )
    `);
    console.log('✅ [RETURNS] Tabela returns verificada/criada');
  } catch (error) {
    console.error('❌ [RETURNS] Erro ao criar tabela:', error.message);
    // Não bloquear se já existir
  }
}

// Garantir que a tabela notifications existe com a estrutura correta
async function ensureNotificationsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) DEFAULT 'return_status',
        title VARCHAR(255) NOT NULL,
        message TEXT,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      )
    `);
    
    // Adicionar coluna link se não existir
    try {
      await pool.execute(`ALTER TABLE notifications ADD COLUMN link VARCHAR(500) NULL`);
    } catch (alterError) {
      // Ignora se a coluna já existe
      if (!alterError.message.includes('Duplicate column name') && !alterError.message.includes('already exists')) {
        console.log('⚠️ [RETURNS] Info sobre coluna link:', alterError.message);
      }
    }
  } catch (error) {
    console.error('❌ [RETURNS] Erro ao verificar tabela notifications:', error.message);
  }
}

// Executar ao carregar o módulo
ensureReturnsTable();
ensureNotificationsTable();

// GET /api/returns - Listar devoluções
router.get('/', async (req, res) => {
  try {
    const [returns] = await pool.execute(`
      SELECT r.*, o.total, o.created_at as order_date,
             u.name as customer_name, u.email as customer_email
      FROM returns r
      LEFT JOIN orders o ON r.order_id = o.id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.requested_at DESC
    `);
    
    res.json(returns);
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ error: 'Erro ao buscar devoluções' });
  }
});

// GET /api/returns/user/:userId - Devoluções de um usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const [returns] = await pool.execute(`
      SELECT r.*, o.total, o.created_at as order_date
      FROM returns r
      LEFT JOIN orders o ON r.order_id = o.id
      WHERE r.user_id = ?
      ORDER BY r.requested_at DESC
    `, [req.params.userId]);
    
    res.json(returns);
  } catch (error) {
    console.error('Error fetching user returns:', error);
    res.status(500).json({ error: 'Erro ao buscar devoluções' });
  }
});

// POST /api/returns - Solicitar devolução
router.post('/', async (req, res) => {
  try {
    console.log('📦 [RETURNS] Nova solicitação de devolução:', req.body);
    const { order_id, user_id, reason, reason_type, image_url } = req.body;
    
    if (!order_id || !user_id || !reason) {
      console.log('❌ [RETURNS] Dados incompletos:', { order_id, user_id, reason: reason ? 'presente' : 'faltando' });
      return res.status(400).json({ error: 'Dados incompletos: order_id, user_id e reason são obrigatórios' });
    }
    
    // Verificar se pedido existe e pertence ao usuário
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, user_id]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    const order = orders[0];
    
    // Verificar se já existe devolução ativa para este pedido
    const [existing] = await pool.execute(
      'SELECT * FROM returns WHERE order_id = ? AND status NOT IN ("cancelled", "rejected", "processed")',
      [order_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe uma devolução em andamento para este pedido' });
    }
    
    // Criar solicitação de devolução (status inicia como 'pending', depois admin muda para 'analyzing')
    const [result] = await pool.execute(
      'INSERT INTO returns (order_id, user_id, reason, reason_type, image_url, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [order_id, user_id, reason, reason_type || null, image_url || null]
    );
    
    const returnId = result.insertId;
    console.log(`✅ [RETURNS] Devolução criada com ID ${returnId}`);
    
    // Enviar email para admin sobre nova solicitação
    try {
      const emailService = require('../config/email');
      const [admins] = await pool.execute('SELECT email, name FROM users WHERE role = ?', ['admin']);
      
      // Buscar dados do pedido e produtos
      const [orderItems] = await pool.execute(
        `SELECT oi.*, p.name as product_name
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order_id]
      );
      
      const itemsForEmail = orderItems.map(item => ({
        name: item.product_name || 'Produto',
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));
      
      const [userData] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [user_id]);
      const customerName = userData[0]?.name || 'Cliente';
      const customerEmail = userData[0]?.email || order.shipping_email;
      
      for (const admin of admins) {
        await emailService.sendEmail(
          admin.email,
          emailService.emailTemplates.newReturnRequest || emailService.emailTemplates.newOrder,
          {
            returnId: returnId,
            orderId: order_id,
            customerName: customerName,
            customerEmail: customerEmail,
            reason: reason,
            reasonType: reason_type || 'Não especificado',
            total: order.total,
            items: itemsForEmail,
            orderDate: new Date(order.created_at).toLocaleString('pt-BR')
          }
        );
      }
      console.log(`✅ [RETURNS] Email enviado para admin(s)`);
    } catch (emailError) {
      console.error('❌ [RETURNS] Erro ao enviar email para admin (não bloqueia):', emailError.message);
    }
    
    // Enviar email para cliente confirmando a solicitação
    try {
      const emailService = require('../config/email');
      const [userData] = await pool.execute('SELECT name, email FROM users WHERE id = ?', [user_id]);
      const customerEmail = userData[0]?.email || order.shipping_email;
      
      if (customerEmail) {
        await emailService.sendEmail(
          customerEmail,
          emailService.emailTemplates.returnRequestReceived || emailService.emailTemplates.returnStatusUpdate,
          {
            name: userData[0]?.name || 'Cliente',
            returnId: returnId,
            orderId: order_id,
            status: 'pending',
            message: 'Sua solicitação de devolução foi recebida e está sendo analisada. Você receberá uma atualização em até 48 horas.'
          }
        );
        console.log(`✅ [RETURNS] Email de confirmação enviado para cliente`);
      }
    } catch (emailError) {
      console.error('❌ [RETURNS] Erro ao enviar email para cliente (não bloqueia):', emailError.message);
    }
    
    res.status(201).json({
      id: returnId,
      message: 'Solicitação de devolução criada com sucesso. Você receberá uma atualização por email em breve.'
    });
    
  } catch (error) {
    console.error('❌ [RETURNS] Error creating return:', error);
    console.error('❌ [RETURNS] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao criar solicitação de devolução',
      details: error.message 
    });
  }
});

// PATCH /api/returns/:id - Atualizar status da devolução
router.patch('/:id', async (req, res) => {
  try {
    const { status, refund_amount, notes } = req.body;
    const returnId = req.params.id;
    
    // Buscar dados da devolução ANTES de atualizar (para email)
    const [returnDataBefore] = await pool.execute(`
      SELECT r.*, u.name as customer_name, u.email as customer_email, o.id as order_id
      FROM returns r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN orders o ON r.order_id = o.id
      WHERE r.id = ?
    `, [returnId]);
    
    if (returnDataBefore.length === 0) {
      return res.status(404).json({ error: 'Devolução não encontrada' });
    }
    
    const oldStatus = returnDataBefore[0].status;
    const updates = [];
    const values = [];
    
    if (status) {
      updates.push('status = ?');
      values.push(status);
      
      // Atualizar timestamps conforme o status
      if (status === 'analyzing') {
        // Status muda para analyzing quando admin começa a analisar
      } else if (status === 'approved') {
        // Quando aprovado, já está pronto para receber produto
      } else if (status === 'received') {
        updates.push('received_at = NOW()');
      } else if (status === 'processed') {
        updates.push('processed_at = NOW()');
      }
    }
    
    if (refund_amount !== undefined) {
      updates.push('refund_amount = ?');
      values.push(refund_amount);
    }
    
    if (notes) {
      updates.push('notes = ?');
      values.push(notes);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    values.push(returnId);
    
    await pool.execute(
      `UPDATE returns SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Se aprovado e tem valor de reembolso, atualizar pedido
    if (status === 'approved' && refund_amount) {
      const [returnData] = await pool.execute(
        'SELECT order_id FROM returns WHERE id = ?',
        [returnId]
      );
      
      if (returnData.length > 0) {
        await pool.execute(
          'UPDATE orders SET status = ? WHERE id = ?',
          ['cancelled', returnData[0].order_id]
        );
      }
    }
    
    // Enviar email e criar notificação se status mudou
    if (status && status !== oldStatus) {
      const returnInfo = returnDataBefore[0];
      const customerEmail = returnInfo.customer_email;
      const customerName = returnInfo.customer_name || 'Cliente';
      
      if (customerEmail) {
        try {
          const emailService = require('../config/email');
          await emailService.sendEmail(
            customerEmail,
            emailService.emailTemplates.returnStatusUpdate,
            {
              name: customerName,
              returnId: returnId,
              orderId: returnInfo.order_id,
              status: status,
              refundAmount: refund_amount || returnInfo.refund_amount,
              notes: notes || returnInfo.notes,
              frontendUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:8080'
            }
          );
          console.log(`✅ [RETURNS] Email de notificação enviado para ${customerEmail}`);
        } catch (emailError) {
          console.error('❌ [RETURNS] Erro ao enviar email (não bloqueia):', emailError.message);
        }
      }
      
      // Criar notificação no banco de dados
      try {
        const statusMessages = {
          approved: 'Sua solicitação de devolução foi aprovada!',
          rejected: 'Sua solicitação de devolução foi rejeitada.',
          received: 'Seu produto foi recebido! O reembolso será processado em breve.',
          processed: 'Seu reembolso foi processado!'
        };
        
        await pool.execute(
          `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
          [
            returnInfo.user_id,
            'return_status',
            `Devolução #${returnId} - Status atualizado`,
            statusMessages[status] || `Status da devolução alterado para: ${status}`,
            `/returns`
          ]
        );
        console.log(`✅ [RETURNS] Notificação criada para usuário ${returnInfo.user_id}`);
      } catch (notifError) {
        console.error('❌ [RETURNS] Erro ao criar notificação (não bloqueia):', notifError.message);
      }
    }
    
    res.json({ success: true, message: 'Devolução atualizada' });
    
  } catch (error) {
    console.error('Error updating return:', error);
    res.status(500).json({ error: 'Erro ao atualizar devolução' });
  }
});

// PATCH /api/returns/:id/mark-received - Marcar devolução como recebida (Admin)
router.patch('/:id/mark-received', async (req, res) => {
  try {
    const returnId = req.params.id;
    
    // Buscar dados da devolução
    const [returnData] = await pool.execute(`
      SELECT r.*, u.name as customer_name, u.email as customer_email, o.id as order_id, o.total
      FROM returns r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN orders o ON r.order_id = o.id
      WHERE r.id = ?
    `, [returnId]);
    
    if (returnData.length === 0) {
      return res.status(404).json({ error: 'Devolução não encontrada' });
    }
    
    const returnInfo = returnData[0];
    
    // Verificar se está aprovada
    if (returnInfo.status !== 'approved') {
      return res.status(400).json({ error: 'A devolução precisa estar aprovada antes de ser marcada como recebida' });
    }
    
    // Atualizar status para received
    await pool.execute(
      'UPDATE returns SET status = ?, received_at = NOW() WHERE id = ?',
      ['received', returnId]
    );
    
    // Enviar email ao cliente
    try {
      const emailService = require('../config/email');
      const customerEmail = returnInfo.customer_email;
      
      if (customerEmail) {
        await emailService.sendEmail(
          customerEmail,
          emailService.emailTemplates.returnStatusUpdate,
          {
            name: returnInfo.customer_name || 'Cliente',
            returnId: returnId,
            orderId: returnInfo.order_id,
            status: 'received',
            message: 'Produto recebido! O reembolso será processado em breve.',
            frontendUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:8080'
          }
        );
      }
    } catch (emailError) {
      console.error('❌ [RETURNS] Erro ao enviar email (não bloqueia):', emailError.message);
    }
    
    // Criar notificação
    try {
      await pool.execute(
        `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
        [
          returnInfo.user_id,
          'return_status',
          `Devolução #${returnId} - Produto recebido`,
          'Seu produto foi recebido. O reembolso será processado em breve.',
          '/returns'
        ]
      );
    } catch (notifError) {
      console.error('❌ [RETURNS] Erro ao criar notificação (não bloqueia):', notifError.message);
    }
    
    res.json({ success: true, message: 'Devolução marcada como recebida' });
    
  } catch (error) {
    console.error('Error marking return as received:', error);
    res.status(500).json({ error: 'Erro ao marcar como recebida' });
  }
});

// PATCH /api/returns/:id/process-refund - Processar reembolso (Admin)
router.patch('/:id/process-refund', async (req, res) => {
  try {
    const returnId = req.params.id;
    const { refund_amount, notes } = req.body;
    
    // Buscar dados da devolução
    const [returnData] = await pool.execute(`
      SELECT r.*, u.name as customer_name, u.email as customer_email, o.id as order_id, o.total
      FROM returns r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN orders o ON r.order_id = o.id
      WHERE r.id = ?
    `, [returnId]);
    
    if (returnData.length === 0) {
      return res.status(404).json({ error: 'Devolução não encontrada' });
    }
    
    const returnInfo = returnData[0];
    
    // Verificar se está recebida
    if (returnInfo.status !== 'received') {
      return res.status(400).json({ error: 'A devolução precisa estar marcada como recebida antes de processar o reembolso' });
    }
    
    // Usar refund_amount fornecido ou calcular automaticamente
    const finalRefundAmount = refund_amount !== undefined ? refund_amount : returnInfo.total || 0;
    
    // Atualizar status para processed e registrar reembolso
    await pool.execute(
      'UPDATE returns SET status = ?, refund_amount = ?, refund_processed_at = NOW(), processed_at = NOW(), notes = COALESCE(?, notes) WHERE id = ?',
      ['processed', finalRefundAmount, notes || null, returnId]
    );
    
    // Restaurar estoque do pedido
    try {
      const stockManager = require('../utils/stockManager');
      await stockManager.restoreStockFromOrder(returnInfo.order_id);
      console.log(`✅ [RETURNS] Estoque restaurado para pedido ${returnInfo.order_id}`);
    } catch (stockError) {
      console.error('⚠️ [RETURNS] Erro ao restaurar estoque (não bloqueia):', stockError.message);
    }
    
    // Enviar email ao cliente
    try {
      const emailService = require('../config/email');
      const customerEmail = returnInfo.customer_email;
      
      if (customerEmail) {
        await emailService.sendEmail(
          customerEmail,
          emailService.emailTemplates.returnStatusUpdate,
          {
            name: returnInfo.customer_name || 'Cliente',
            returnId: returnId,
            orderId: returnInfo.order_id,
            status: 'processed',
            refundAmount: finalRefundAmount,
            notes: notes || 'Reembolso processado com sucesso',
            message: `Seu reembolso de ${Number(finalRefundAmount).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} foi processado!`,
            frontendUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:8080'
          }
        );
      }
    } catch (emailError) {
      console.error('❌ [RETURNS] Erro ao enviar email (não bloqueia):', emailError.message);
    }
    
    // Criar notificação
    try {
      await pool.execute(
        `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
        [
          returnInfo.user_id,
          'return_status',
          `Devolução #${returnId} - Reembolso processado`,
          `Seu reembolso de ${Number(finalRefundAmount).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} foi processado!`,
          '/returns'
        ]
      );
    } catch (notifError) {
      console.error('❌ [RETURNS] Erro ao criar notificação (não bloqueia):', notifError.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Reembolso processado com sucesso',
      refundAmount: finalRefundAmount
    });
    
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Erro ao processar reembolso' });
  }
});

// POST /api/returns/upload-image - Upload de imagem para devolução
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const returnImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'returns');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `return-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const uploadReturnImage = multer({
  storage: returnImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens (JPG, PNG) são permitidas!'));
  }
});

router.post('/upload-image', uploadReturnImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }
    
    const imageUrl = `/uploads/returns/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl,
      message: 'Imagem enviada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ [RETURNS] Erro ao fazer upload:', error);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: 'Erro ao fazer upload da imagem',
      details: error.message 
    });
  }
});

module.exports = router;



