-- Adiciona campos específicos de LIVROS à tabela products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS isBook TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS book_title VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS book_author VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS publisher VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS publication_year INT NULL,
  ADD COLUMN IF NOT EXISTS book_type ENUM('physical','digital') NULL,
  ADD COLUMN IF NOT EXISTS access_type ENUM('free','paid') NULL,
  ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(1024) NULL;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_products_isBook ON products(isBook);
CREATE INDEX IF NOT EXISTS idx_products_book_type ON products(book_type);

