const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const crypto = require('crypto');

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Generate unique transaction ID
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// Generate QR code data for mobile payments
const generateQRCode = (amount, transactionId, phone) => {
  const data = {
    amount,
    transactionId,
    phone,
    timestamp: Date.now()
  };
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

// Generate unique tracking code (PX-AAAAMMDD-XXXXXX)
const generateTrackingCode = () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PX-${dateStr}-${randomStr}`;
};

// Helper function to insert order item with product info
const insertOrderItem = async (orderId, item) => {
  // Buscar informações completas do produto
  const [products] = await pool.execute(`
    SELECT tipo, arquivo_digital, gratuito, name, price 
    FROM products WHERE id = ?
  `, [item.id || item.product_id]);
  
  const productInfo = products[0] || { 
    tipo: 'fisico', 
    arquivo_digital: null, 
    gratuito: 0,
    name: item.name,
    price: item.price
  };
  
  await pool.execute(
    `INSERT INTO order_items (
      order_id, product_id, quantity, price,
      product_type, product_arquivo_digital, product_gratuito,
      product_name, product_price, subtotal
    )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId, 
      item.id || item.product_id, 
      item.quantity, 
      item.price,
      productInfo.tipo || 'fisico',
      productInfo.arquivo_digital || null,
      productInfo.gratuito || 0,
      productInfo.name || item.name,
      productInfo.price || item.price,
      (productInfo.price || item.price) * item.quantity
    ]
  );
  
  // Atualizar estoque APENAS para produtos físicos
  if (!productInfo.tipo || productInfo.tipo === 'fisico') {
    await pool.execute(
      'UPDATE products SET stock = stock - ? WHERE id = ?',
      [item.quantity, item.id || item.product_id]
    );
  }
};

// Helper function to create order from payment
const createOrderFromPayment = async (paymentId, paymentData, shippingInfo) => {
  try {
    const { items } = paymentData;
    
    // Create order
    const [orderResult] = await pool.execute(
      `INSERT INTO orders 
       (user_id, total, payment_method, payment_id, payment_status, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
      [
        paymentData.userId,
        paymentData.amount,
        paymentData.payment_method,
        paymentId,
        'pending',
        shippingInfo?.name,
        shippingInfo?.email,
        shippingInfo?.phone,
        shippingInfo?.address,
        shippingInfo?.city,
        shippingInfo?.province
      ]
    );
    
    const orderId = orderResult.insertId;
    
    // Create order items with product information
    for (const item of items) {
      await insertOrderItem(orderId, item);
    }
    
    return orderId;
  } catch (error) {
    console.error('Error creating order from payment:', error);
    throw error;
  }
};

// ==========================================
// PAYPAL PAYMENT
// ==========================================

router.post('/paypal/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo } = req.body;
    const transactionId = generateTransactionId();
    
    // Store pending payment in database
    const [paymentResult] = await pool.execute(
      `INSERT INTO payments 
       (transaction_id, user_id, amount, payment_method, status, order_data, created_at)
       VALUES (?, ?, ?, 'paypal', 'pending', ?, NOW())`,
      [transactionId, userId, amount, JSON.stringify({ items, shippingInfo })]
    );
    
    const paymentId = paymentResult.insertId;
    
    // Create order immediately
    const orderId = await createOrderFromPayment(paymentId, {
      userId,
      amount,
      payment_method: 'paypal',
      items
    }, shippingInfo);
    
    // In production, integrate with PayPal API
    // For now, return success with orderId
    res.json({
      success: true,
      transactionId,
      orderId,
      paymentUrl: `https://www.paypal.com/checkoutnow?token=${transactionId}`,
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    console.error('PayPal payment error:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar pagamento PayPal' });
  }
});

router.post('/paypal/complete', async (req, res) => {
  try {
    const { transactionId, payerId } = req.body;
    
    // Update payment status
    await pool.execute(
      'UPDATE payments SET status = ?, completed_at = NOW() WHERE transaction_id = ?',
      ['completed', transactionId]
    );
    
    res.json({ success: true, message: 'Payment completed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// M-PESA PAYMENT
// ==========================================

router.post('/mpesa/initiate', async (req, res) => {
  try {
    const { amount, phone, items, userId, shippingInfo } = req.body;
    
    // Validate phone number format (+258XXXXXXXXX)
    const phoneRegex = /^\+258\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }
    
    const transactionId = generateTransactionId();
    
    // Store pending payment
    await pool.execute(
      `INSERT INTO payments 
       (transaction_id, user_id, amount, payment_method, status, order_data, created_at)
       VALUES (?, ?, ?, 'mpesa', 'pending', ?, NOW())`,
      [transactionId, userId, amount, JSON.stringify({ items, shippingInfo, phone })]
    );
    
    // Generate payment QR code
    const qrCode = generateQRCode(amount, transactionId, phone);
    
    // In production, integrate with M-Pesa API
    // Send STK push to customer's phone
    res.json({
      success: true,
      transactionId,
      message: 'Please enter your M-Pesa PIN on your phone',
      instructions: [
        'You will receive an M-Pesa push notification on your phone',
        'Enter your M-Pesa PIN',
        'Confirm the transaction',
        'You will receive a confirmation SMS'
      ],
      qrCode,
      amount
    });
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/mpesa/status/:transactionId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE transaction_id = ?',
      [req.params.transactionId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// EMOLA PAYMENT
// ==========================================

router.post('/emola/initiate', async (req, res) => {
  try {
    const { amount, phone, items, userId, shippingInfo } = req.body;
    const transactionId = generateTransactionId();
    
    // Store pending payment
    await pool.execute(
      `INSERT INTO payments 
       (transaction_id, user_id, amount, payment_method, status, order_data, created_at)
       VALUES (?, ?, ?, 'emola', 'pending', ?, NOW())`,
      [transactionId, userId, amount, JSON.stringify({ items, shippingInfo, phone })]
    );
    
    // Generate payment reference
    res.json({
      success: true,
      transactionId,
      reference: `EML-${transactionId}`,
      message: 'Redirecting to EMOLA payment gateway...',
      redirectUrl: `https://pay.emola.co.mz/pay/${transactionId}`
    });
  } catch (error) {
    console.error('EMOLA payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// MKESH PAYMENT
// ==========================================

router.post('/mkesh/initiate', async (req, res) => {
  try {
    const { amount, phone, items, userId, shippingInfo } = req.body;
    const transactionId = generateTransactionId();
    
    // Store pending payment
    await pool.execute(
      `INSERT INTO payments 
       (transaction_id, user_id, amount, payment_method, status, order_data, created_at)
       VALUES (?, ?, ?, 'mkesh', 'pending', ?, NOW())`,
      [transactionId, userId, amount, JSON.stringify({ items, shippingInfo, phone })]
    );
    
    // Generate payment details
    res.json({
      success: true,
      transactionId,
      paymentCode: `MKS-${Date.now()}`,
      message: 'Please send payment to:',
      instructions: [
        'Open your Mkesh app',
        'Go to Send Money',
        'Enter account: 8888888888',
        `Enter amount: ${amount} MZN`,
        `Enter reference: ${transactionId}`
      ],
      amount
    });
  } catch (error) {
    console.error('Mkesh payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// RIHA PAYMENT
// ==========================================

router.post('/riha/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo } = req.body;
    const transactionId = generateTransactionId();
    
    // Store pending payment in database
    const [paymentResult] = await pool.execute(
      `INSERT INTO payments 
       (transaction_id, user_id, amount, payment_method, status, order_data, created_at)
       VALUES (?, ?, ?, 'riha', 'pending', ?, NOW())`,
      [transactionId, userId, amount, JSON.stringify({ items, shippingInfo })]
    );
    
    const paymentId = paymentResult.insertId;
    
    // Create order immediately
    const orderId = await createOrderFromPayment(paymentId, {
      userId,
      amount,
      payment_method: 'riha',
      items
    }, shippingInfo);
    
    // In production, integrate with RIHA API
    // Return payment URL for redirection
    res.json({
      success: true,
      transactionId,
      orderId,
      paymentUrl: `https://gateway.riha.co.mz/payment/${transactionId}`,
      message: 'Redirecionando para gateway RIHA...'
    });
  } catch (error) {
    console.error('RIHA payment error:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar pagamento RIHA' });
  }
});

// ==========================================
// CARD PAYMENT (Visa/Mastercard)
// ==========================================

router.post('/card/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo, cardDetails } = req.body;
    const transactionId = generateTransactionId();
    
    // In production, integrate with payment gateway (Stripe, etc.)
    // For now, create pending payment
    const [paymentResult] = await pool.execute(
      `INSERT INTO payments 
       (transaction_id, user_id, amount, payment_method, status, order_data, created_at)
       VALUES (?, ?, ?, 'card', 'pending', ?, NOW())`,
      [transactionId, userId, amount, JSON.stringify({ items, shippingInfo, cardDetails: { last4: cardDetails.number.slice(-4) } })]
    );
    
    const paymentId = paymentResult.insertId;
    
    // Create order immediately
    const orderId = await createOrderFromPayment(paymentId, {
      userId,
      amount,
      payment_method: 'card',
      items
    }, shippingInfo);
    
    // Simulate card processing
    res.json({
      success: true,
      transactionId,
      orderId,
      requiresRedirect: true,
      redirectUrl: '/payment/card-processing',
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    console.error('Card payment error:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar pagamento com cartão' });
  }
});

// ==========================================
// CASH ON DELIVERY
// ==========================================

router.post('/cash/create', async (req, res) => {
  try {
    const { amount, items, userId, shippingInfo } = req.body;
    const transactionId = generateTransactionId();
    
    // Store payment as confirmed (cash doesn't need payment processing)
    await pool.execute(
      `INSERT INTO payments 
       (transaction_id, user_id, amount, payment_method, status, order_data, created_at)
       VALUES (?, ?, ?, 'cash', 'confirmed', ?, NOW())`,
      [transactionId, userId, amount, JSON.stringify({ items, shippingInfo })]
    );
    
    res.json({
      success: true,
      transactionId,
      status: 'confirmed',
      message: 'Order will be prepared for delivery'
    });
  } catch (error) {
    console.error('Cash payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PAYMENT STATUS
// ==========================================

router.get('/status/:transactionId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE transaction_id = ?',
      [req.params.transactionId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const payment = rows[0];
    
    // Create order if payment is completed
    if (payment.status === 'completed' || payment.status === 'confirmed') {
      const orderData = JSON.parse(payment.order_data);
      
      // Check if order already exists
      const [existingOrder] = await pool.execute(
        'SELECT * FROM orders WHERE payment_id = ?',
        [payment.id]
      );
      
      if (existingOrder.length === 0) {
        // Create order
        const [orderResult] = await pool.execute(
          `INSERT INTO orders 
           (user_id, total, payment_method, payment_id, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            payment.user_id,
            payment.amount,
            payment.payment_method,
            payment.id,
            orderData.shippingInfo.name,
            orderData.shippingInfo.email,
            orderData.shippingInfo.phone,
            orderData.shippingInfo.address,
            orderData.shippingInfo.city,
            orderData.shippingInfo.province
          ]
        );
        
        const orderId = orderResult.insertId;
        
        // Create order items with product information
        for (const item of orderData.items) {
          await insertOrderItem(orderId, item);
        }
      }
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CONFIRM PAYMENT (Webhook callback)
// ==========================================

router.post('/confirm/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;
    
    await pool.execute(
      'UPDATE payments SET status = ?, completed_at = NOW() WHERE transaction_id = ?',
      [status, transactionId]
    );
    
    res.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

