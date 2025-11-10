-- ============================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS
-- Railway MySQL Setup
-- ============================================

-- 1️⃣ TABELA DE USUÁRIOS (PRIMEIRO - outras tabelas dependem dela)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  phone VARCHAR(20),
  status ENUM('active', 'blocked') DEFAULT 'active',
  blocked_at DATETIME,
  blocked_reason TEXT,
  block_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2️⃣ TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category ENUM('livros', 'cadernos', 'canetas', 'acessorios', 'papelaria', 'arte', 'escritorio') NOT NULL,
  image VARCHAR(500),
  stock INT DEFAULT 0,
  book_file VARCHAR(500),
  is_digital BOOLEAN DEFAULT FALSE,
  author VARCHAR(255),
  publisher VARCHAR(255),
  publication_year INT,
  isbn VARCHAR(20),
  pages INT,
  language VARCHAR(50) DEFAULT 'Português',
  format ENUM('Capa dura', 'Brochura', 'Digital', 'Outro'),
  dimensions VARCHAR(100),
  brand VARCHAR(255),
  color VARCHAR(100),
  material VARCHAR(100),
  size VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3️⃣ TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method ENUM('credit_card', 'debit_card', 'pix', 'boleto', 'paypal', 'm-pesa', 'cash_on_delivery') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  shipping_address TEXT,
  tracking_code VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4️⃣ TABELA DE ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image VARCHAR(500),
  quantity INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 5️⃣ TABELA DE CUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed', 'free_shipping') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  expires_at DATE,
  valid_until DATE,
  usage_limit INT,
  max_uses INT,
  times_used INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  applicable_categories VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6️⃣ TABELA DE CARRINHOS ABANDONADOS
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_id VARCHAR(255),
  email VARCHAR(255),
  cart_data JSON NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('abandoned', 'recovered', 'expired') DEFAULT 'abandoned',
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at DATETIME,
  recovered_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- 7️⃣ TABELA DE NEWSLETTER
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- 8️⃣ TABELA DE CAMPANHAS DE MARKETING
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  sent_to INT DEFAULT 0,
  opened INT DEFAULT 0,
  clicked INT DEFAULT 0,
  created_by INT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 9️⃣ TABELA DE AVALIAÇÕES
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 🔟 TABELA DE DEVOLUÇÕES
CREATE TABLE IF NOT EXISTS returns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  user_id INT,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 1️⃣1️⃣ TABELA DE NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order', 'promotion', 'system', 'cart') DEFAULT 'system',
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 1️⃣2️⃣ TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  payment_method ENUM('credit_card', 'debit_card', 'pix', 'boleto', 'paypal', 'm-pesa', 'cash_on_delivery') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 1️⃣3️⃣ TABELA DE EXPERIMENTOS A/B
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('percentage', 'free_shipping') NOT NULL,
  value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  label VARCHAR(255) NOT NULL,
  emails_sent INT DEFAULT 0,
  coupons_used INT DEFAULT 0,
  conversions INT DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 1️⃣4️⃣ TABELA DE RASTREAMENTO A/B
CREATE TABLE IF NOT EXISTS ab_test_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  variant_id INT NOT NULL,
  cart_id INT,
  coupon_code VARCHAR(50),
  event_type ENUM('email_sent', 'coupon_used', 'conversion') NOT NULL,
  event_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (cart_id) REFERENCES abandoned_carts(id) ON DELETE SET NULL
);

-- 1️⃣5️⃣ TABELA DE FAVORITOS
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, product_id)
);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir variantes de teste A/B
INSERT INTO ab_test_variants (name, type, value, label, is_active) VALUES
  ('Variant A - 10%', 'percentage', 10.00, '10% de desconto', TRUE),
  ('Variant B - 15%', 'percentage', 15.00, '15% de desconto', TRUE),
  ('Variant C - Frete Grátis', 'free_shipping', 0.00, 'Frete Grátis', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices já criados acima, mas garantindo...
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status ON abandoned_carts(status);

-- ============================================
-- FIM DO SCRIPT
-- ============================================

