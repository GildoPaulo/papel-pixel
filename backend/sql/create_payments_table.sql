-- ==========================================
-- TABELA DE PAGAMENTOS
-- ==========================================

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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON payments(created_at);

-- ==========================================
-- ATUALIZAR TABELA ORDERS PARA REFERENCIAR PAYMENTS
-- ==========================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id INT;
ALTER TABLE orders ADD FOREIGN KEY IF NOT EXISTS (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- ==========================================
-- EXEMPLOS DE QUERIES ÚTEIS
-- ==========================================

-- Ver todos os pagamentos
-- SELECT * FROM payments ORDER BY created_at DESC;

-- Ver pagamentos por usuário
-- SELECT * FROM payments WHERE user_id = ?;

-- Ver pagamentos por status
-- SELECT * FROM payments WHERE status = 'completed';

-- Ver estatísticas de pagamento
-- SELECT 
--   payment_method,
--   COUNT(*) as total,
--   SUM(amount) as total_amount
-- FROM payments 
-- WHERE status = 'completed'
-- GROUP BY payment_method;

-- Ver pagamento com detalhes do pedido
-- SELECT 
--   p.*,
--   o.id as order_id,
--   o.total as order_total
-- FROM payments p
-- LEFT JOIN orders o ON p.id = o.payment_id
-- WHERE p.transaction_id = ?;

