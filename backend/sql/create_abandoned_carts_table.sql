-- ================================================
-- TABELA DE CARRINHOS ABANDONADOS
-- ================================================
-- Guarda informações sobre carrinhos que não foram finalizados
-- para envio de emails de recuperação

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,                                  -- ID do usuário (se logado)
  session_id VARCHAR(255),                      -- ID da sessão (se não logado)
  email VARCHAR(255) NOT NULL,                  -- Email para envio da recuperação
  cart_items JSON NOT NULL,                     -- Itens do carrinho em formato JSON
  total DECIMAL(10, 2) NOT NULL,               -- Valor total do carrinho
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Última atividade
  email_sent_count INT DEFAULT 0,              -- Quantos emails já foram enviados
  recovered BOOLEAN DEFAULT false,              -- Se o carrinho foi recuperado
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_last_activity (last_activity),
  INDEX idx_recovered (recovered),
  INDEX idx_email (email),
  INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- TABELA DE LOG DE NOTIFICAÇÕES DE PRODUTOS
-- ================================================
-- Registra quando um produto novo é anunciado aos assinantes

CREATE TABLE IF NOT EXISTS product_notifications_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  notification_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subscribers_notified INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_notification (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

