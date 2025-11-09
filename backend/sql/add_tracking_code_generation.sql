-- Adicionar campo para código de rastreamento interno único
ALTER TABLE orders ADD COLUMN internal_tracking_code VARCHAR(50) NULL UNIQUE;

-- Criar índice para busca rápida
CREATE INDEX idx_internal_tracking_code ON orders(internal_tracking_code);

-- Comentário
-- internal_tracking_code: Código interno único de rastreamento (ex: PX-20251101-ABC123)

