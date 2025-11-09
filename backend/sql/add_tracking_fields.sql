-- Adicionar campos de rastreamento na tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(100) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url VARCHAR(500) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP NULL;

-- Comentários
-- tracking_code: Código de rastreamento da transportadora (ex: BR123456789CD)
-- tracking_url: URL da transportadora para rastreamento (ex: https://correios.com/rastreamento/BR123456789CD)
-- shipped_at: Data e hora que o pedido foi enviado

