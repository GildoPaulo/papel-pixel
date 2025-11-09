const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config();

// Criar pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'papel_pixel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Gerar código único de rastreamento (PX-AAAAMMDD-XXXXXX)
const generateTrackingCode = () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PX-${dateStr}-${randomStr}`;
};

// GET /api/orders - Listar todos os pedidos
router.get('/', async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT o.*, o.internal_tracking_code as tracking_code, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

    // Buscar itens de cada pedido
    for (let order of orders) {
      const [items] = await pool.execute(`
        SELECT * FROM order_items WHERE order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// GET /api/orders/:id - Buscar pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT o.*, o.internal_tracking_code as tracking_code, u.name as customer_name, u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [req.params.id]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = orders[0];

    // Buscar itens do pedido
    const [items] = await pool.execute(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [order.id]);

    order.items = items;
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// GET /api/orders/user/:userId - Buscar pedidos de um usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `, [req.params.userId]);

    // Buscar itens de cada pedido
    for (let order of orders) {
      const [items] = await pool.execute(`
        SELECT * FROM order_items WHERE order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Erro ao buscar pedidos do usuário' });
  }
});

// POST /api/orders - Criar novo pedido
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      total,
      payment_method,
      shipping_address,
      billing_address,
      customer_name,
      customer_email,
      customer_phone,
      notes,
      items
    } = req.body;

    // Validar dados
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Pedido deve ter pelo menos um item' });
    }

    // Criar pedido
    const [result] = await pool.execute(`
      INSERT INTO orders (
        user_id, total, payment_method, shipping_address, billing_address,
        customer_name, customer_email, customer_phone, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      user_id || null,
      total,
      payment_method,
      JSON.stringify(shipping_address),
      JSON.stringify(billing_address),
      customer_name,
      customer_email,
      customer_phone,
      notes
    ]);

    const orderId = result.insertId;

    // Criar itens do pedido e atualizar estoque
    for (const item of items) {
      // Buscar informações completas do produto
      const [products] = await pool.execute(`
        SELECT tipo, arquivo_digital, gratuito FROM products WHERE id = ?
      `, [item.product_id]);
      
      const productInfo = products[0] || { tipo: 'fisico', arquivo_digital: null, gratuito: 0 };
      
      await pool.execute(`
        INSERT INTO order_items (
          order_id, product_id, product_name, product_price, quantity, subtotal,
          product_type, product_arquivo_digital, product_gratuito
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.product_id,
        item.name,
        item.price,
        item.quantity,
        item.price * item.quantity,
        productInfo.tipo || 'fisico',
        productInfo.arquivo_digital || null,
        productInfo.gratuito || 0
      ]);

      // Atualizar estoque APENAS para produtos físicos
      if (!productInfo.tipo || productInfo.tipo === 'fisico') {
        await pool.execute(`
          UPDATE products SET stock = stock - ? WHERE id = ?
        `, [item.quantity, item.product_id]);
      }
    }

    // Buscar pedido completo para retornar
    const [orders] = await pool.execute(`
      SELECT * FROM orders WHERE id = ?
    `, [orderId]);

    const order = orders[0];

    // Buscar itens
    const [itemsResult] = await pool.execute(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [orderId]);

    order.items = itemsResult;

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

// PATCH /api/orders/:id - Atualizar status do pedido
router.patch('/:id', async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    const orderId = req.params.id;

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (payment_status) {
      updates.push('payment_status = ?');
      values.push(payment_status);
    }

    // Se o status mudou para 'shipped', gerar código de rastreamento
    if (status === 'shipped') {
      // Verificar se o pedido já tem código de rastreamento
      const [existingOrders] = await pool.execute(`
        SELECT internal_tracking_code FROM orders WHERE id = ?
      `, [orderId]);
      
      if (existingOrders.length > 0 && !existingOrders[0].internal_tracking_code) {
        // Gerar código único garantindo que não existe
        let trackingCode;
        let attempts = 0;
        do {
          trackingCode = generateTrackingCode();
          const [duplicates] = await pool.execute(`
            SELECT id FROM orders WHERE internal_tracking_code = ?
          `, [trackingCode]);
          
          if (duplicates.length === 0) {
            break; // Código único encontrado
          }
          attempts++;
          
          if (attempts > 10) {
            throw new Error('Não foi possível gerar código de rastreamento único');
          }
        } while (true);
        
        updates.push('internal_tracking_code = ?');
        values.push(trackingCode);
        
        console.log(`✅ Código de rastreamento gerado para pedido ${orderId}: ${trackingCode}`);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    values.push(orderId);

    await pool.execute(`
      UPDATE orders SET ${updates.join(', ')} WHERE id = ?
    `, values);

    // Buscar pedido atualizado
    const [orders] = await pool.execute(`
      SELECT *, internal_tracking_code as tracking_code FROM orders WHERE id = ?
    `, [orderId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = orders[0];

    // Buscar itens
    const [items] = await pool.execute(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [orderId]);

    order.items = items;


    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

// DELETE /api/orders/:id - Cancelar pedido
router.delete('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    // Buscar itens do pedido para restaurar estoque
    const [items] = await pool.execute(`
      SELECT * FROM order_items WHERE order_id = ?
    `, [orderId]);

    // Restaurar estoque de cada produto
    for (const item of items) {
      await pool.execute(`
        UPDATE products SET stock = stock + ? WHERE id = ?
      `, [item.quantity, item.product_id]);
    }

    // Deletar itens e pedido
    await pool.execute(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);
    await pool.execute(`DELETE FROM orders WHERE id = ?`, [orderId]);

    res.json({ message: 'Pedido cancelado com sucesso' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Erro ao cancelar pedido' });
  }
});

module.exports = router;
