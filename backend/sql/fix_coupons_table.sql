-- ================================================
-- CORRIGIR TABELA DE CUPONS
-- ================================================
-- Atualiza a tabela de cupons para o formato correto

-- Dropar tabela antiga se existir (CUIDADO: remove dados)
-- DROP TABLE IF EXISTS coupon_usages;
-- DROP TABLE IF EXISTS coupons;

-- Criar tabela de cupons com estrutura correta
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Código do cupom (ex: BLACKFRIDAY50)',
  type ENUM('percentage', 'fixed', 'free_shipping') NOT NULL DEFAULT 'percentage' COMMENT 'Tipo: percentual, fixo, ou frete grátis',
  value DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT 'Valor do desconto (10 para 10% ou 100 para 100 MZN)',
  category VARCHAR(100) NULL COMMENT 'Categorias aplicáveis (separadas por vírgula)',
  product_id INT NULL COMMENT 'Produto específico alvo (opcional)',
  expires_at DATETIME NULL COMMENT 'Data de expiração',
  valid_until DATE NULL COMMENT 'Data de validade (formato alternativo)',
  usage_limit INT NULL COMMENT 'Quantidade máxima de vezes que pode ser usado (NULL = ilimitado)',
  max_uses INT NULL COMMENT 'Alias para usage_limit',
  usage_count INT DEFAULT 0 COMMENT 'Quantidade de vezes já usado',
  times_used INT DEFAULT 0 COMMENT 'Alias para usage_count',
  active BOOLEAN DEFAULT TRUE COMMENT 'Cupom ativo ou inativo',
  status VARCHAR(20) DEFAULT 'active' COMMENT 'Status: active, inactive',
  min_purchase DECIMAL(10,2) NULL COMMENT 'Valor mínimo de compra para usar o cupom',
  description TEXT NULL COMMENT 'Descrição do cupom',
  applicable_categories TEXT NULL COMMENT 'Categorias onde o cupom pode ser usado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT NULL COMMENT 'ID do admin que criou',
  INDEX idx_code (code),
  INDEX idx_active (active),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at),
  INDEX idx_valid_until (valid_until),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar colunas que podem estar faltando (se tabela já existia)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS valid_until DATE NULL COMMENT 'Data de validade';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_uses INT NULL COMMENT 'Máximo de usos';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS times_used INT DEFAULT 0 COMMENT 'Vezes usado';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' COMMENT 'Status do cupom';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_categories TEXT NULL COMMENT 'Categorias aplicáveis';

-- Atualizar status baseado em active (para compatibilidade)
UPDATE coupons SET status = IF(active = true, 'active', 'inactive') WHERE status IS NULL;

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

SELECT 'Tabela de cupons corrigida/criada!' as status;



