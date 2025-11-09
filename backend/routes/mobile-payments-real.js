const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const router = express.Router();
const pool = require('../config/database');

// ==========================================
// CONFIGURAÇÕES (Defina suas credenciais aqui)
// ==========================================

const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || 'SUA_API_KEY',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'SUA_API_SECRET',
  passKey: process.env.MPESA_PASSKEY || 'SUA_PASSKEY',
  shortCode: process.env.MPESA_SHORTCODE || '174379',
  sandbox: process.env.NODE_ENV !== 'production'
};

const MKESH_CONFIG = {
  apiKey: process.env.MKESH_API_KEY || 'SUA_API_KEY',
  merchantId: process.env.MKESH_MERCHANT_ID || 'SEU_MERCHANT_ID'
};

const EMOLA_CONFIG = {
  apiKey: process.env.EMOLA_API_KEY || 'SUA_API_KEY',
  merchantId: process.env.EMOLA_MERCHANT_ID || 'SEU_MERCHANT_ID'
};

// ==========================================
// M-PESA - PAGAMENTO REAL
// ==========================================

router.post('/mpesa/stk-push', async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    
    // Validar formato do telefone (+258XXXXXXXXX)
    const cleanPhone = phone.replace(/\+| /g, '');
    
    const transactionId = `MPESA-${Date.now()}`;
    
    // Chamar API oficial do M-Pesa
    const stkPushPayload = {
      BusinessShortCode: MPESA_CONFIG.shortCode,
      Password: generatePassword(),
      Timestamp: getTimestamp(),
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: cleanPhone,
      PartyB: MPESA_CONFIG.shortCode,
      PhoneNumber: cleanPhone,
      CallBackURL: `${process.env.BACKEND_URL}/api/payments/mpesa/callback`,
      AccountReference: `Order-${orderId}`,
      TransactionDesc: `Pagamento Pedido #${orderId}`
    };
    
    // Autenticar primeiro
    const authResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        auth: {
          username: MPESA_CONFIG.consumerKey,
          password: MPESA_CONFIG.consumerSecret
        }
      }
    );
    
    const accessToken = authResponse.data.access_token;
    
    // Enviar STK Push
    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Salvar transação no banco
    await pool.execute(
      `INSERT INTO payments 
       (transaction_id, order_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, 'mpesa', 'pending', ?, NOW())`,
      [transactionId, orderId, amount, JSON.stringify(stkResponse.data)]
    );
    
    res.json({
      success: true,
      transactionId,
      checkoutRequestId: stkResponse.data.CheckoutRequestID,
      message: 'Envie PACE para 79798 e siga as instruções no seu telefone'
    });
    
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Erro ao processar pagamento M-Pesa',
      details: MPESA_CONFIG.sandbox ? error.message : 'Erro ao conectar com M-Pesa'
    });
  }
});

// Callback do M-Pesa
router.post('/mpesa/callback', async (req, res) => {
  try {
    const callbackData = req.body;
    
    // Processar callback do M-Pesa
    const paymentInfo = {
      resultCode: callbackData.Body.stkCallback.ResultCode,
      resultDesc: callbackData.Body.stkCallback.ResultDesc,
      checkoutRequestId: callbackData.Body.stkCallback.CheckoutRequestID,
      merchantRequestId: callbackData.Body.stkCallback.MerchantRequestID
    };
    
    if (paymentInfo.resultCode === 0) {
      // Pagamento bem-sucedido
      const items = callbackData.Body.stkCallback.CallbackMetadata.Item;
      const amount = items.find(i => i.Name === 'Amount')?.Value;
      const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const phone = items.find(i => i.Name === 'PhoneNumber')?.Value;
      
      // Atualizar pagamento
      await pool.execute(
        'UPDATE payments SET status = ?, completed_at = NOW(), metadata = ? WHERE checkout_request_id = ?',
        ['completed', JSON.stringify({ receipt, phone }), paymentInfo.checkoutRequestId]
      );
      
      // Buscar order_id
      const [payment] = await pool.execute(
        'SELECT order_id FROM payments WHERE checkout_request_id = ?',
        [paymentInfo.checkoutRequestId]
      );
      
      if (payment[0]?.order_id) {
        // Atualizar status do pedido
        await pool.execute(
          'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
          ['confirmed', 'paid', payment[0].order_id]
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ error: 'Erro ao processar callback' });
  }
});

// ==========================================
// M-KESH - PAGAMENTO REAL
// ==========================================

router.post('/mkesh/payment', async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    
    const transactionId = `MKESH-${Date.now()}`;
    
    // Integrar com API M-Kesh (substitua pela API real)
    const mkeshPayload = {
      merchantId: MKESH_CONFIG.merchantId,
      apiKey: MKESH_CONFIG.apiKey,
      amount: amount,
      phone: phone,
      orderId: orderId,
      description: `Pagamento Pedido #${orderId}`
    };
    
    // Salvar transação
    await pool.execute(
      `INSERT INTO payments 
       (transaction_id, order_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, 'mkesh', 'pending', ?, NOW())`,
      [transactionId, orderId, amount, JSON.stringify(mkeshPayload)]
    );
    
    res.json({
      success: true,
      transactionId,
      message: 'Receberá USSD no seu celular. Siga as instruções.',
      instructions: [
        '1. Aguarde o USSD no seu celular',
        '2. Digite *555#',
        '3. Escolha "Pagamento"',
        `4. Digite o código: ${transactionId}`,
        `5. Confirme o valor: ${amount} MZN`
      ]
    });
    
  } catch (error) {
    console.error('M-Kesh error:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento M-Kesh' });
  }
});

// ==========================================
// EMOLA - PAGAMENTO REAL
// ==========================================

router.post('/emola/payment', async (req, res) => {
  try {
    const { phone, amount, orderId } = req.body;
    
    const transactionId = `EMOLA-${Date.now()}`;
    
    // Integrar com API Emola (substitua pela API real)
    const emolaPayload = {
      merchantId: EMOLA_CONFIG.merchantId,
      apiKey: EMOLA_CONFIG.apiKey,
      amount: amount,
      phone: phone,
      orderId: orderId,
      description: `Pagamento Pedido #${orderId}`
    };
    
    // Salvar transação
    await pool.execute(
      `INSERT INTO payments 
       (transaction_id, order_id, amount, payment_method, status, metadata, created_at)
       VALUES (?, ?, ?, 'emola', 'pending', ?, NOW())`,
      [transactionId, orderId, amount, JSON.stringify(emolaPayload)]
    );
    
    res.json({
      success: true,
      transactionId,
      message: 'Redirecionando para gateway Emola...',
      redirectUrl: `https://pay.emola.co.mz/checkout/${transactionId}`
    });
    
  } catch (error) {
    console.error('Emola error:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento Emola' });
  }
});

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function generatePassword() {
  const timestamp = getTimestamp();
  const password = Buffer.from(
    MPESA_CONFIG.shortCode + MPESA_CONFIG.passKey + timestamp
  ).toString('base64');
  return password;
}

function getTimestamp() {
  return new Date().toISOString().replace(/[-:T.]/g, '').slice(0, -5);
}

module.exports = router;



