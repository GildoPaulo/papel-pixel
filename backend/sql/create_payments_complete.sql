-- Tabela completa de pagamentos com suporte a todos os métodos
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  order_id INT NOT NULL,
  user_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM(
    'paypal', 
    'mpesa', 
    'emola', 
    'mkesh', 
    'card', 
    'bank_transfer', 
    'cash_on_delivery'
  ) NOT NULL,
  status ENUM('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
  gateway_response TEXT NULL, -- Resposta do gateway (JSON)
  receipt_url VARCHAR(500) NULL, -- URL do comprovante (para transferência bancária)
  receipt_uploaded_at TIMESTAMP NULL, -- Quando o comprovante foi enviado
  receipt_verified_by INT NULL, -- ID do admin que verificou
  receipt_verified_at TIMESTAMP NULL, -- Quando foi verificado
  payment_code VARCHAR(100) NULL, -- Código de referência (M-Pesa, etc)
  phone_number VARCHAR(20) NULL, -- Telefone usado no pagamento
  metadata JSON NULL, -- Dados extras em JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL, -- Quando o pagamento foi concluído
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (receipt_verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_payment_method (payment_method),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar coluna payment_status à tabela orders se não existir
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending';

-- Adicionar coluna payment_id para referência ao pagamento
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id INT NULL;
ALTER TABLE orders ADD FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

