-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  order_id INT,
  user_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  checkout_request_id VARCHAR(255),
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_checkout_request_id (checkout_request_id),
  INDEX idx_status (status)
);

-- Status possíveis:
-- pending, processing, completed, failed, cancelled



