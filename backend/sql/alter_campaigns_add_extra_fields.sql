-- Adicionar campos extras para campanhas de marketing
-- Permite salvar banner, cupom, CTA e outros dados para reenvio completo

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS coupon_text VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cta_label VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS destination_url VARCHAR(500) DEFAULT NULL;

