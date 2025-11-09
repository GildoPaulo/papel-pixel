const pool = require('../config/database');

// Buscar todos os pedidos (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await pool.execute(query, params);

    // Buscar itens de cada pedido
    for (let order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, p.name as product_name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Buscar pedido por ID
exports.getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = orders[0];

    // Buscar itens do pedido
    const [items] = await pool.execute(
      `SELECT oi.*, p.name as product_name, p.image, p.category 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );
    order.items = items;

    // Buscar informações de pagamento se existir
    if (order.payment_id) {
      const [payments] = await pool.execute(
        'SELECT * FROM payments WHERE id = ?',
        [order.payment_id]
      );
      order.payment = payments[0];
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Buscar pedidos do usuário
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Buscar itens de cada pedido
    for (let order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, p.name as product_name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Criar pedido
exports.createOrder = async (req, res) => {
  try {
    const { items, total, shippingInfo, paymentMethod, paymentId } = req.body;
    const userId = req.user?.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Pedido deve ter pelo menos um item' });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ error: 'Total inválido' });
    }

    // Inserir pedido
    const [result] = await pool.execute(
      `INSERT INTO orders (user_id, total, payment_method, payment_id, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_province, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        total,
        paymentMethod,
        paymentId || null,
        shippingInfo.name,
        shippingInfo.email,
        shippingInfo.phone,
        shippingInfo.address,
        shippingInfo.city,
        shippingInfo.province
      ]
    );

    const orderId = result.insertId;

    // Inserir itens do pedido e atualizar estoque
    for (const item of items) {
      await pool.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.price]
      );

      // Atualizar estoque
      await pool.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    // Buscar pedido completo
    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = orders[0];

    res.status(201).json({ 
      id: orderId, 
      order,
      message: 'Pedido criado com sucesso' 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Atualizar status do pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Status do pedido atualizado com sucesso' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Cancelar pedido
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o pedido existe e pode ser cancelado
    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const order = orders[0];

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ error: 'Pedido não pode ser cancelado' });
    }

    // Atualizar estoque dos produtos
    const [items] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [id]
    );

    for (const item of items) {
      await pool.execute(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Cancelar pedido
    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelled', id]
    );

    res.json({ message: 'Pedido cancelado com sucesso' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: error.message });
  }
};

