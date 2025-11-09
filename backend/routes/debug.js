const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

/**
 * GET /api/debug/verify-token
 * Verifica se o token está válido (APENAS PARA DEBUG)
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        valid: false,
        error: 'Token não fornecido',
        solution: 'Faça login novamente'
      });
    }

    // Tentar verificar o token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key');
      
      // Buscar usuário no banco
      const [users] = await pool.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [decoded.id]
      );
      
      if (users.length === 0) {
        return res.json({
          valid: false,
          tokenDecoded: true,
          userExists: false,
          error: 'Usuário não encontrado no banco de dados',
          decoded: decoded,
          solution: 'Recrie o usuário ou faça login com outro'
        });
      }
      
      return res.json({
        valid: true,
        tokenDecoded: true,
        userExists: true,
        user: users[0],
        decoded: decoded,
        message: 'Token válido! ✅'
      });
      
    } catch (jwtError) {
      return res.json({
        valid: false,
        tokenDecoded: false,
        error: jwtError.message,
        errorType: jwtError.name,
        solution: jwtError.message.includes('expired') 
          ? 'Token expirado. Faça login novamente.' 
          : jwtError.message.includes('malformed')
          ? 'Token corrompido. Limpe localStorage e faça login novamente.'
          : 'Faça logout e login novamente.',
        jwt_secret_ok: !!(process.env.JWT_SECRET),
        hint: 'Execute: localStorage.clear(); location.reload();'
      });
    }
  } catch (error) {
    res.status(500).json({
      valid: false,
      error: 'Erro ao verificar token',
      details: error.message
    });
  }
});

/**
 * GET /api/debug/check-auth
 * Verifica configuração de autenticação
 */
router.get('/check-auth', (req, res) => {
  res.json({
    jwt_secret_configured: !!(process.env.JWT_SECRET),
    jwt_secret_length: process.env.JWT_SECRET?.length || 0,
    jwt_secret_preview: process.env.JWT_SECRET?.substring(0, 10) + '...',
    default_secret_in_use: !process.env.JWT_SECRET,
    recommendation: process.env.JWT_SECRET 
      ? 'JWT_SECRET configurado ✅' 
      : '⚠️ Usando JWT_SECRET padrão. Configure no .env!'
  });
});

module.exports = router;



