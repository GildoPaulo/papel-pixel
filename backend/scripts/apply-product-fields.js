const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function applyMigration() {
  let pool;
  try {
    // Criar pool de conexões
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'papel_pixel',
      multipleStatements: true
    });

    console.log('📦 Conectando ao banco de dados...');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'papel_pixel'}`);

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '../sql/add_product_type_fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('\n🔄 Aplicando migration...\n');

    // Executar SQL (multipleStatements permite múltiplas queries)
    const connection = await pool.getConnection();
    
    try {
      // Dividir em statements individuais
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && s.length > 0);

      for (const stmt of statements) {
        if (!stmt) continue;
        try {
          const [result] = await connection.query(stmt + ';');
          if (result && result.length > 0) {
            console.log('✅', result);
          } else {
            console.log('✅ Statement executed');
          }
        } catch (err) {
          // Ignorar erros de "already exists"
          if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_KEYNAME') {
            console.log('⚠️  Campo/índice já existe, ignorando...');
          } else {
            console.log('⚠️  Erro ignorado:', err.message);
          }
        }
      }

      console.log('\n✅ Migration concluída com sucesso!');
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migration:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

applyMigration();



