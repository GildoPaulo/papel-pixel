const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'papel_pixel'
  });

  try {
    // Adicionar tipo
    try {
      await pool.query(`ALTER TABLE products ADD COLUMN tipo ENUM('fisico','digital') DEFAULT 'fisico'`);
      console.log('✅ Campo tipo adicionado');
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Campo tipo já existe');
      } else {
        throw e;
      }
    }

    // Adicionar arquivo_digital
    try {
      await pool.query('ALTER TABLE products ADD COLUMN arquivo_digital VARCHAR(1024) NULL');
      console.log('✅ Campo arquivo_digital adicionado');
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Campo arquivo_digital já existe');
      } else {
        throw e;
      }
    }

    // Adicionar gratuito
    try {
      await pool.query('ALTER TABLE products ADD COLUMN gratuito TINYINT(1) DEFAULT 0');
      console.log('✅ Campo gratuito adicionado');
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Campo gratuito já existe');
      } else {
        throw e;
      }
    }

    // Criar índices
    try {
      await pool.query('CREATE INDEX IF NOT EXISTS idx_products_tipo ON products(tipo)');
      console.log('✅ Índice tipo criado');
    } catch(e) {
      console.log('⚠️  Índice tipo:', e.code);
    }

    try {
      await pool.query('CREATE INDEX idx_products_gratuito ON products(gratuito)');
      console.log('✅ Índice gratuito criado');
    } catch(e) {
      console.log('⚠️  Índice gratuito:', e.code);
    }

    // Atualizar produtos existentes
    try {
      await pool.query(`UPDATE products SET tipo = 'digital' WHERE isBook = 1 AND book_type = 'digital'`);
      console.log('✅ Produtos digitais atualizados');
    } catch(e) {
      console.log('⚠️  Update:', e.message);
    }

    try {
      await pool.query('UPDATE products SET gratuito = 1 WHERE isBook = 1 AND access_type = "free"');
      console.log('✅ Produtos gratuitos atualizados');
    } catch(e) {
      console.log('⚠️  Update:', e.message);
    }

    try {
      await pool.query('UPDATE products SET arquivo_digital = pdf_url WHERE pdf_url IS NOT NULL AND arquivo_digital IS NULL');
      console.log('✅ Arquivos digitais copiados');
    } catch(e) {
      console.log('⚠️  Update:', e.message);
    }

    console.log('\n✅ Migration concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();



