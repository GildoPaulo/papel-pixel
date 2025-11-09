const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail, emailTemplates } = require('../config/email');

// Criar tabela de tokens de reset (se não existir)
// CREATE TABLE password_resets (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   user_id INT,
//   token VARCHAR(255),
//   expires_at TIMESTAMP,
//   used BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (user_id) REFERENCES users(id)
// );

// Solicitar recuperação de senha
router.post('/request', async (req, res) => {
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
    
    // Salvar token no banco (ou em memória para simulação)
    // Por enquanto, vamos usar localStorage no frontend
    
    // Salvar token no banco de dados (criar tabela se não existir)
    try {
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
      
      // Remover tokens expirados ou usados deste usuário
      await pool.execute(
        'DELETE FROM password_resets WHERE user_id = ? AND (expires_at < NOW() OR used = TRUE)',
        [user.id]
      );
      
      // Inserir novo token
      await pool.execute(
        'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );
    } catch (error) {
      console.error('Error saving password reset token:', error);
      // Continuar mesmo se der erro na tabela
    }
    
    // Enviar email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    
    const emailResult = await sendEmail(
      user.email,
      emailTemplates.passwordReset,
      { name: user.name, resetLink }
    );
    
    // Por enquanto, retornar token (em produção, só enviar por email)
    res.json({
      success: true,
      message: 'Email enviado com instruções',
      token: token, // REMOVER em produção!
      resetLink: resetLink
    });
    
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// Validar token
router.post('/validate-token', async (req, res) => {
  try {
    const { token, email } = req.body;
    
    // Em produção, validar token no banco
    // Por enquanto, aceitar qualquer token válido (formato correto)
    
    if (token && token.length === 64) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao validar token' });
  }
});

// Redefinir senha
router.post('/reset', async (req, res) => {
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
      // Se a tabela não existir, validar apenas o formato do token
      console.warn('Tabela password_resets não encontrada, validando formato do token');
      if (!token || token.length !== 64) {
        return res.status(400).json({ error: 'Token inválido' });
      }
    }
    
    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Atualizar senha
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    res.json({ 
      success: true, 
      message: 'Senha redefinida com sucesso!' 
    });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

module.exports = router;



