const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
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

// GET /api/users - Listar todos os usuários/clientes
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    // Para cada usuário, buscar pedidos
    for (let user of users) {
      const [orders] = await pool.execute(`
        SELECT id, total, status, created_at 
        FROM orders 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `, [user.id]);
      
      user.orders = orders;
      user.totalOrders = orders.length;
      user.totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// GET /api/users/:id - Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT id, name, email, role, created_at 
      FROM users WHERE id = ?
    `, [req.params.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    const user = users[0];
    
    // Buscar pedidos do cliente
    const [orders] = await pool.execute(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o 
      WHERE o.user_id = ? 
      ORDER BY o.created_at DESC
    `, [user.id]);
    
    user.orders = orders;
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

module.exports = router;



