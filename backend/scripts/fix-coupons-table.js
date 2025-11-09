const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixCouponsTable() {
  let connection;
  
  try {
    console.log('🔧 Corrigindo tabela de cupons...\n');
    
    // Criar conexão
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'papel_pixel',
    });

    console.log('✅ Conectado ao MySQL');

    // Verificar se tabela existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'coupons'"
    );

    if (tables.length === 0) {
      console.log('📝 Tabela coupons não existe. Criando...');
    } else {
      console.log('📝 Tabela coupons existe. Verificando estrutura...');
    }

    // Criar/atualizar tabela
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        type ENUM('percentage', 'fixed', 'free_shipping') NOT NULL DEFAULT 'percentage',
        value DECIMAL(10,2) NOT NULL DEFAULT 0,
        category VARCHAR(100) NULL,
        min_purchase DECIMAL(10,2) NULL,
        valid_until DATE NULL,
        max_uses INT NULL,
        times_used INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        applicable_categories TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabela coupons criada/atualizada');

    // Tentar adicionar colunas que podem estar faltando (ignorar erros se já existirem)
    const columnsToAdd = [
      { name: 'valid_until', sql: 'ALTER TABLE coupons ADD COLUMN valid_until DATE NULL' },
      { name: 'max_uses', sql: 'ALTER TABLE coupons ADD COLUMN max_uses INT NULL' },
      { name: 'times_used', sql: 'ALTER TABLE coupons ADD COLUMN times_used INT DEFAULT 0' },
      { name: 'status', sql: 'ALTER TABLE coupons ADD COLUMN status VARCHAR(20) DEFAULT "active"' },
      { name: 'applicable_categories', sql: 'ALTER TABLE coupons ADD COLUMN applicable_categories TEXT NULL' },
    ];

    for (const col of columnsToAdd) {
      try {
        await connection.execute(col.sql);
        console.log(`✅ Coluna ${col.name} adicionada`);
      } catch (error) {
        if (error.message.includes('Duplicate column')) {
          console.log(`⏭️  Coluna ${col.name} já existe`);
        } else {
          console.log(`⚠️  Aviso ao adicionar ${col.name}:`, error.message);
        }
      }
    }

    // Criar tabela de histórico de uso
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coupon_usages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        coupon_id INT NOT NULL,
        user_id INT NULL,
        order_id INT NULL,
        email VARCHAR(255) NULL,
        discount_amount DECIMAL(10,2) NOT NULL,
        order_total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
        INDEX idx_coupon_id (coupon_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabela coupon_usages criada/atualizada');

    // Ver estrutura final
    const [columns] = await connection.execute('DESCRIBE coupons');
    console.log('\n📊 Estrutura da tabela coupons:');
    console.table(columns.map(c => ({ 
      Field: c.Field, 
      Type: c.Type, 
      Null: c.Null,
      Key: c.Key,
      Default: c.Default
    })));

    // Contar cupons
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM coupons');
    console.log(`\n📈 Total de cupons cadastrados: ${count[0].total}`);

    console.log('\n✅ ✅ ✅ TABELA CORRIGIDA COM SUCESSO! ✅ ✅ ✅');
    console.log('\n💡 Agora tente criar o cupom novamente no Admin!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n💡 Verifique se:');
    console.error('   1. MySQL está rodando');
    console.error('   2. Banco "papel_pixel" existe');
    console.error('   3. Credenciais no .env estão corretas');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar
fixCouponsTable();



