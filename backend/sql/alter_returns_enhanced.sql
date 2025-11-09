-- Atualizar tabela returns para suportar fluxo completo de devoluções
ALTER TABLE returns 
  ADD COLUMN IF NOT EXISTS reason_type VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP NULL;

-- Atualizar status para suportar fluxo completo
-- Status: pending, analyzing, approved, rejected, received, processed, cancelled

