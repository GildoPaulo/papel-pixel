const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Middleware de autenticação
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      // Garantir compatibilidade com diferentes formatos
      req.user = {
        id: decoded.id || decoded.userId,
        userId: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
      console.log('✅ [AUTH] Token válido para usuário:', req.user.id);
      next();
    } catch (error) {
      console.log('❌ [AUTH] Token inválido:', error.message);
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Erro de autenticação' });
  }
};

// Helper function to get user role from database
const getUserRole = async (userId) => {
  try {
    const [users] = await pool.execute(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );
    return users.length > 0 ? users[0].role : null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Middleware para verificar se é admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      console.log('❌ [AUTH] Usuário não autenticado');
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const userId = req.user.id || req.user.userId;
    
    if (!userId) {
      console.log('❌ [AUTH] ID do usuário não encontrado no token:', req.user);
      return res.status(401).json({ error: 'Token inválido' });
    }

    console.log('🔐 [AUTH] Verificando admin para usuário:', userId);

    // Buscar dados completos do usuário do banco
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      console.log('❌ [AUTH] Usuário não encontrado no banco:', userId);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (users[0].role !== 'admin') {
      console.log('❌ [AUTH] Acesso negado - usuário não é admin:', users[0].role);
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    req.user.role = users[0].role;
    req.user.id = users[0].id;
    console.log('✅ [AUTH] Admin verificado:', users[0].email);
    next();
  } catch (error) {
    console.error('❌ [AUTH] Erro ao verificar permissões:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

// Middleware para verificar se é Analyst (pode cadastrar e modificar)
const isAnalyst = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const role = await getUserRole(userId);
    
    // Admin e Analyst têm permissão para criar/modificar
    if (role !== 'admin' && role !== 'analyst') {
      console.log('❌ [AUTH] Acesso negado - usuário não é admin ou analyst:', role);
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores e analistas.' });
    }

    req.user.role = role;
    console.log('✅ [AUTH] Analyst/Admin verificado:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ [AUTH] Erro ao verificar permissões:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

// Middleware para verificar se é Assistant (apenas visualização)
const isAssistant = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const userId = req.user.id || req.user.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const role = await getUserRole(userId);
    
    // Qualquer papel autenticado pode ver (assistant, analyst, admin)
    if (!role) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    req.user.role = role;
    console.log('✅ [AUTH] Assistant/Analyst/Admin verificado:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ [AUTH] Erro ao verificar permissões:', error);
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

// Middleware opcional - não bloqueia se não autenticado
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
      } catch (error) {
        // Token inválido, mas não bloqueia
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  isAdmin,
  isAnalyst,
  isAssistant,
  optionalAuth
};

