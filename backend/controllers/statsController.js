const pool = require('../config/database');

// Dashboard - estatísticas gerais
exports.getDashboardStats = async (req, res) => {
  try {
    // Vendas totais
    const [totalSales] = await pool.execute(
      'SELECT SUM(total) as total FROM orders WHERE status = "delivered"'
    );

    // Total de pedidos
    const [totalOrders] = await pool.execute(
      'SELECT COUNT(*) as total FROM orders'
    );

    // Pedidos do mês
    const [monthlyOrders] = await pool.execute(
      'SELECT COUNT(*) as total FROM orders WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())'
    );

    // Clientes cadastrados
    const [totalCustomers] = await pool.execute(
      'SELECT COUNT(*) as total FROM users WHERE role = "user"'
    );

    // Produtos cadastrados
    const [totalProducts] = await pool.execute(
      'SELECT COUNT(*) as total FROM products'
    );

    // Produtos em estoque baixo
    const [lowStock] = await pool.execute(
      'SELECT COUNT(*) as total FROM products WHERE stock < 10'
    );

    // Últimos pedidos
    const [recentOrders] = await pool.execute(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 10'
    );

    // Produtos mais vendidos
    const [topProducts] = await pool.execute(
      `SELECT p.*, SUM(oi.quantity) as total_sold
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status = 'delivered'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 10`
    );

    res.json({
      sales: {
        total: totalSales[0].total || 0,
        thisMonth: monthlyOrders[0].total || 0
      },
      orders: {
        total: totalOrders[0].total || 0,
        thisMonth: monthlyOrders[0].total || 0,
        recent: recentOrders
      },
      products: {
        total: totalProducts[0].total || 0,
        lowStock: lowStock[0].total || 0
      },
      customers: {
        total: totalCustomers[0].total || 0
      },
      topProducts
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Estatísticas de vendas por período
exports.getSalesStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFormat, dateRange;
    
    switch(period) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        dateRange = 30;
        break;
      case 'week':
        dateFormat = '%Y - Semana %u';
        dateRange = 12;
        break;
      case 'month':
        dateFormat = '%Y-%m';
        dateRange = 12;
        break;
      case 'year':
        dateFormat = '%Y';
        dateRange = 5;
        break;
      default:
        dateFormat = '%Y-%m';
        dateRange = 12;
    }

    const [stats] = await pool.execute(
      `SELECT 
         DATE_FORMAT(created_at, ?) as period,
         COUNT(*) as count,
         SUM(total) as total
       FROM orders
       WHERE status = 'delivered'
       GROUP BY DATE_FORMAT(created_at, ?)
       ORDER BY period DESC
       LIMIT ?`,
      [dateFormat, dateFormat, dateRange]
    );

    res.json(stats);
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Estatísticas de produtos
exports.getProductsStats = async (req, res) => {
  try {
    // Produtos por categoria
    const [byCategory] = await pool.execute(
      'SELECT category, COUNT(*) as count, SUM(stock) as total_stock FROM products GROUP BY category'
    );

    // Produtos mais vistos
    const [mostViewed] = await pool.execute(
      'SELECT * FROM products ORDER BY views DESC LIMIT 10'
    );

    // Produtos em promoção
    const [onSale] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE isPromotion = true'
    );

    res.json({
      byCategory,
      mostViewed,
      onSale: onSale[0].count
    });
  } catch (error) {
    console.error('Error fetching products stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Estatísticas de clientes
exports.getCustomersStats = async (req, res) => {
  try {
    // Clientes ativos (que fizeram pedido nos últimos 30 dias)
    const [activeCustomers] = await pool.execute(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM orders 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    // Novos clientes este mês
    const [newCustomers] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())'
    );

    // Clientes por categoria de compra
    const [byOrderTotal] = await pool.execute(
      `SELECT 
         CASE 
           WHEN SUM(o.total) >= 5000 THEN 'VIP'
           WHEN SUM(o.total) >= 2000 THEN 'Frequent'
           ELSE 'Regular'
         END as category,
         COUNT(DISTINCT u.id) as count
       FROM users u
       LEFT JOIN orders o ON u.id = o.user_id
       WHERE u.role = 'user'
       GROUP BY category`
    );

    res.json({
      active: activeCustomers[0].count,
      newThisMonth: newCustomers[0].count,
      byCategory: byOrderTotal
    });
  } catch (error) {
    console.error('Error fetching customers stats:', error);
    res.status(500).json({ error: error.message });
  }
};

