const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ==========================================
// SIMULAÇÃO DE PAGAMENTOS COM CARTEIRA MÓVEL
// ==========================================

// Simular pagamento M-Pesa
router.post('/simulate', async (req, res) => {
  try {
    const { phone, amount, orderId, paymentMethod } = req.body;
    
    console.log('📱 Simulando pagamento:', { phone, amount, orderId, paymentMethod });
    
    const transactionId = `${paymentMethod.toUpperCase()}-${Date.now()}`;
    
    // Simular verificação de saldo
    const hasBalance = amount <= 1000; // Simula que tem saldo
    const randomSuccess = Math.random() > 0.1; // 90% de chance de sucesso
    
    if (!hasBalance || !randomSuccess) {
      return res.status(400).json({
        success: false,
        error: hasBalance ? 'Falha ao processar pagamento' : 'Saldo insuficiente',
        transactionId
      });
    }
    
    // Simular atraso de 2-3 segundos (como se fosse processamento real)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Salvar transação no banco
    await pool.execute(
      `INSERT INTO payments 
       (transaction_id, order_id, amount, payment_method, status, metadata, created_at, completed_at)
       VALUES (?, ?, ?, ?, 'completed', ?, NOW(), NOW())`,
      [transactionId, orderId, amount, paymentMethod, JSON.stringify({ phone, simulated: true })]
    );
    
    // Atualizar pedido
    await pool.execute(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      ['confirmed', 'paid', orderId]
    );
    
    console.log('✅ Pagamento simulado com sucesso:', transactionId);
    
    res.json({
      success: true,
      transactionId,
      message: 'Pagamento confirmado!',
      receipt: `${paymentMethod.toUpperCase()}-${Date.now()}`,
      details: {
        amount: amount,
        phone: phone,
        method: paymentMethod,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error simulating payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao simular pagamento' 
    });
  }
});

// Verificar status do pagamento
router.get('/status/:transactionId', async (req, res) => {
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
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
});

module.exports = router;



