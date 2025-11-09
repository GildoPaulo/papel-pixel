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

// GET /api/stats - Estatísticas gerais
router.get('/', async (req, res) => {
  try {
    // Total de produtos
    const [productCount] = await pool.execute('SELECT COUNT(*) as count FROM products');
    
    // Total de pedidos
    const [orderCount] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    
    // Total de usuários
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    // Produtos em promoção
    const [promoCount] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE isPromotion = 1');
    
    // Estoque baixo (< 10)
    const [lowStockCount] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE stock < 10');
    
    // Valor total em estoque
    const [stockValue] = await pool.execute(`
      SELECT SUM(price * stock) as value FROM products
    `);
    
    // Vendas do mês
    const [monthSales] = await pool.execute(`
      SELECT SUM(total) as total FROM orders 
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
      AND status != 'cancelled'
    `);
    
    // Pedidos pendentes
    const [pendingOrders] = await pool.execute(`
      SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
    `);
    
    res.json({
      products: {
        total: productCount[0].count,
        inPromotion: promoCount[0].count,
        lowStock: lowStockCount[0].count,
        stockValue: stockValue[0].value || 0
      },
      orders: {
        total: orderCount[0].count,
        pending: pendingOrders[0].count
      },
      users: {
        total: userCount[0].count
      },
      sales: {
        thisMonth: monthSales[0].total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/stats/products - Estatísticas de produtos
router.get('/products', async (req, res) => {
  try {
    // Produtos mais vendidos (simulado por mais estoque reduzido)
    const [bestSellers] = await pool.execute(`
      SELECT p.*, 
        (SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.product_id = p.id) as sold
      FROM products p
      ORDER BY sold DESC
      LIMIT 10
    `);
    
    res.json(bestSellers);
  } catch (error) {
    console.error('Error fetching products stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de produtos' });
  }
});

module.exports = router;
