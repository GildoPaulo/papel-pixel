-- Migration: Adicionar campos de tipo de produto (digital/físico)
-- Executar este arquivo para adicionar suporte completo a produtos digitais e físicos

-- Verificar se os campos já existem antes de adicionar
-- Se não existirem, serão criados. Se existirem, o comando falhará silenciosamente

-- Adicionar campo 'tipo' se não existir
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'products' 
  AND COLUMN_NAME = 'tipo');

SET @sql = IF(@exist = 0, 
  'ALTER TABLE products ADD COLUMN tipo ENUM(''fisico'',''digital'') DEFAULT ''fisico'' AFTER stock',
  'SELECT "Campo tipo já existe" as msg'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar campo 'arquivo_digital' se não existir
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'products' 
  AND COLUMN_NAME = 'arquivo_digital');

SET @sql = IF(@exist = 0, 
  'ALTER TABLE products ADD COLUMN arquivo_digital VARCHAR(1024) NULL AFTER pdf_url',
  'SELECT "Campo arquivo_digital já existe" as msg'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar campo 'gratuito' se não existir
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'products' 
  AND COLUMN_NAME = 'gratuito');

SET @sql = IF(@exist = 0, 
  'ALTER TABLE products ADD COLUMN gratuito TINYINT(1) DEFAULT 0 AFTER arquivo_digital',
  'SELECT "Campo gratuito já existe" as msg'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Criar índices úteis
CREATE INDEX IF NOT EXISTS idx_products_tipo ON products(tipo);
CREATE INDEX IF NOT EXISTS idx_products_gratuito ON products(gratuito);

-- Comentários nas colunas
ALTER TABLE products 
  MODIFY COLUMN tipo ENUM('fisico','digital') DEFAULT 'fisico' COMMENT 'Tipo do produto: físico ou digital',
  MODIFY COLUMN arquivo_digital VARCHAR(1024) NULL COMMENT 'URL ou caminho do arquivo digital',
  MODIFY COLUMN gratuito TINYINT(1) DEFAULT 0 COMMENT 'Se o produto digital é gratuito (1) ou pago (0)';

-- Atualizar produtos existentes baseado em campos antigos
-- Se é livro digital, marcar como digital
UPDATE products 
SET tipo = 'digital' 
WHERE isBook = 1 AND book_type = 'digital';

-- Se é gratuito baseado no access_type, marcar como gratuito
UPDATE products 
SET gratuito = 1 
WHERE isBook = 1 AND access_type = 'free';

-- Se tem pdf_url, copiar para arquivo_digital
UPDATE products 
SET arquivo_digital = pdf_url 
WHERE pdf_url IS NOT NULL AND arquivo_digital IS NULL;

-- Mensagem de sucesso
SELECT 'Migration concluída: Campos tipo, arquivo_digital e gratuito adicionados' as resultado;



