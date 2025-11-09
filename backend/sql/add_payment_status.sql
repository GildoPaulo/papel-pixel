-- Adicionar coluna payment_status à tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending';

