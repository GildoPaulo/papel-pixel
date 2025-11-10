-- Tabela de Cupons de Desconto
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Código do cupom (ex: VOLTAESAULA10)',
  type ENUM('percentage', 'fixed', 'free_shipping') NOT NULL DEFAULT 'percentage' COMMENT 'Tipo: percentual, fixo, ou frete grátis',
  value DECIMAL(10,2) NOT NULL COMMENT 'Valor do desconto (10 para 10% ou 100 para 100 MZN)',
  category VARCHAR(50) NULL COMMENT 'Categoria alvo (opcional: Livros, Papelaria, Revistas)',
  product_id INT NULL COMMENT 'Produto específico alvo (opcional)',
  expires_at DATETIME NULL COMMENT 'Data de expiração',
  usage_limit INT NULL COMMENT 'Quantidade máxima de vezes que pode ser usado (NULL = ilimitado)',
  usage_count INT DEFAULT 0 COMMENT 'Quantidade de vezes já usado',
  active BOOLEAN DEFAULT TRUE COMMENT 'Cupom ativo ou inativo',
  min_purchase DECIMAL(10,2) NULL COMMENT 'Valor mínimo de compra para usar o cupom',
  description TEXT NULL COMMENT 'Descrição do cupom',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL COMMENT 'ID do admin que criou',
  INDEX idx_code (code),
  INDEX idx_active (active),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Histórico de Uso de Cupons
CREATE TABLE IF NOT EXISTS coupon_usages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id INT NULL COMMENT 'Usuário que usou (NULL se não logado)',
  order_id INT NULL COMMENT 'Pedido associado',
  email VARCHAR(255) NULL COMMENT 'Email do cliente (se não logado)',
  discount_amount DECIMAL(10,2) NOT NULL COMMENT 'Valor do desconto aplicado',
  order_total DECIMAL(10,2) NOT NULL COMMENT 'Valor total do pedido',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




