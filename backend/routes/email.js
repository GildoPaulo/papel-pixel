const express = require('express');
const router = express.Router();
const { sendEmail, emailTemplates } = require('../config/email');

// Enviar email de boas-vindas
router.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    const result = await sendEmail(email, emailTemplates.welcome, name);
    
    res.json(result);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

// Enviar confirmação de pedido
router.post('/order-confirmation', async (req, res) => {
  try {
    const { email, order } = req.body;
    
    const result = await sendEmail(email, emailTemplates.orderConfirmation, order);
    
    res.json(result);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

// Enviar email de recuperação de senha
router.post('/password-reset', async (req, res) => {
  try {
    const { email, name, resetLink } = req.body;
    
    const result = await sendEmail(email, emailTemplates.passwordReset, { name, resetLink });
    
    res.json(result);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

module.exports = router;



