const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const { errorHandler, notFound } = require('./middleware/error');
const { securityMiddleware, apiLimiter, authLimiter } = require('./middleware/security');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(...securityMiddleware);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos de upload
app.use('/uploads', express.static('uploads'));

// Rate limiting global
app.use('/api/', apiLimiter);

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Papel & Pixel Backend API is running! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      reviews: '/api/reviews',
      coupons: '/api/coupons',
      stats: '/api/stats',
      subscribers: '/api/subscribers',
      notifications: '/api/notifications'
    }
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const mobilePaymentsRoutes = require('./routes/mobile-payments-real');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const statsRoutes = require('./routes/stats');
const notificationRoutes = require('./routes/notifications');
const simulatePaymentsRoutes = require('./routes/mobile-payments-simulation');
const emailRoutes = require('./routes/email');
const receiptRoutes = require('./routes/receipt');
const returnsRoutes = require('./routes/returns');
const uploadRoutes = require('./routes/upload');

// ==========================================
// ROUTES
// ==========================================

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth/password-reset', require('./routes/password-reset'));
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/mobile-payments', mobilePaymentsRoutes);
app.use('/api/simulate-payment', simulatePaymentsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/upload', uploadRoutes);

// ==========================================
// SUBSCRIBERS ROUTES
// ==========================================

// Get all subscribers
app.get('/api/subscribers', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM subscribers ORDER BY subscribed_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add subscriber
app.post('/api/subscribers', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT * FROM subscribers WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO subscribers (email, name) VALUES (?, ?)',
      [email, name || 'Subscriber']
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Inscrito com sucesso!' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subscriber
app.delete('/api/subscribers/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM subscribers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Inscrito removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`   Papel & Pixel Backend API`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================\n');
});



