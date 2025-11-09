-- Tabela para histórico de movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  order_id INT NULL, -- NULL se for atualização manual
  user_id INT NULL, -- Admin que fez a atualização manual
  type ENUM('sale', 'cancel', 'manual_add', 'manual_remove', 'adjustment', 'low_stock_notification') NOT NULL,
  quantity_change INT NOT NULL, -- Positivo para entrada, negativo para saída
  quantity_before INT NOT NULL,
  quantity_after INT NOT NULL,
  reason VARCHAR(255) NULL, -- Motivo da alteração manual
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_product_id (product_id),
  INDEX idx_order_id (order_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

