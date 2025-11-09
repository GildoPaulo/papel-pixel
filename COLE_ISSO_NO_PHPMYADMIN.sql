-- =============================================
-- COLE ESTE TEXTO NO PHPMYADMIN
-- =============================================
-- 1. Selecione o banco "papel_pixel" na esquerda
-- 2. Clique na aba "SQL" 
-- 3. Cole TUDO abaixo e clique em "Executar"
-- =============================================

-- Adicionar views aos produtos (se ainda não existir)
ALTER TABLE products ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;
ALTER TABLE products ADD INDEX IF NOT EXISTS idx_views (views);

-- Adicionar status aos pedidos (se ainda não existir)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending';
ALTER TABLE orders ADD INDEX IF NOT EXISTS idx_status (status);

-- Adicionar payment_id aos pedidos (se ainda não existir)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id INT;

-- Criar tabela de pagamentos (se ainda não existir)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  user_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'confirmed') DEFAULT 'pending',
  order_data JSON,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Criar tabela de avaliações (se ainda não existir)
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id),
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id)
);

-- Criar tabela de cupons (se ainda não existir)
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) DEFAULT NULL,
  max_discount DECIMAL(10, 2) DEFAULT NULL,
  expires_at DATETIME DEFAULT NULL,
  usage_limit INT DEFAULT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (active)
);

-- Criar tabela de uso de cupons (se ainda não existir)
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_user_id (user_id)
);

-- Criar tabela de carrinho (se ainda não existir)
CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id),
  INDEX idx_user_id (user_id)
);

-- Criar tabela de notificações (se ainda não existir)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSON DEFAULT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_read (is_read)
);

-- Criar usuário admin (se ainda não existir)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@papelpixel.co.mz', '$2a$10$YourHashHere', 'admin');

