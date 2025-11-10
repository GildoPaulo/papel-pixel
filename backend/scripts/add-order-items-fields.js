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
    // Adicionar campos ao order_items
    const fields = [
      { name: 'product_name', type: 'VARCHAR(255) NULL' },
      { name: 'product_price', type: 'DECIMAL(10, 2) NULL' },
      { name: 'subtotal', type: 'DECIMAL(10, 2) NULL' },
      { name: 'product_type', type: "ENUM('fisico','digital') NULL" },
      { name: 'product_arquivo_digital', type: 'VARCHAR(1024) NULL' },
      { name: 'product_gratuito', type: 'TINYINT(1) NULL' }
    ];

    for (const field of fields) {
      try {
        await pool.query(`ALTER TABLE order_items ADD COLUMN ${field.name} ${field.type}`);
        console.log(`✅ Campo ${field.name} adicionado`);
      } catch(e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Campo ${field.name} já existe`);
        } else {
          throw e;
        }
      }
    }

    console.log('\n✅ Migration order_items concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();




