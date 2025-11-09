const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initProductionDB() {
  let connection;
  
  try {
    console.log('🚀 Inicializando banco de dados de produção...\n');
    
    // Conectar ao MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Conectado ao MySQL');

    // Lista de arquivos SQL para executar
    const sqlFiles = [
      'schema.sql',
      'create_abandoned_carts_table.sql',
      'fix_coupons_table.sql'
    ];

    // Executar cada arquivo
    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, '..', 'sql', file);
      
      if (fs.existsSync(filePath)) {
        console.log(`\n📄 Executando ${file}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Dividir por statements
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          try {
            await connection.execute(statement);
          } catch (error) {
            // Ignorar erros de "já existe"
            if (!error.message.includes('already exists') && 
                !error.message.includes('Duplicate')) {
              console.log(`   ⚠️  Aviso: ${error.message}`);
            }
          }
        }
        
        console.log(`   ✅ ${file} executado`);
      }
    }

    // Criar usuário admin padrão (se não existir)
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('Admin@2024', 10);
    
    try {
      await connection.execute(
        `INSERT INTO users (name, email, password, role) 
         VALUES (?, ?, ?, ?)`,
        ['Admin', 'admin@papelepixel.com', adminPassword, 'admin']
      );
      console.log('\n✅ Usuário admin criado!');
      console.log('   Email: admin@papelepixel.com');
      console.log('   Senha: Admin@2024');
      console.log('   ⚠️  MUDE A SENHA IMEDIATAMENTE!');
    } catch (error) {
      if (error.message.includes('Duplicate entry')) {
        console.log('\n⏭️  Usuário admin já existe');
      }
    }

    console.log('\n✅ ✅ ✅ BANCO DE DADOS INICIALIZADO! ✅ ✅ ✅\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n💡 Verifique:');
    console.error('   1. Variáveis de ambiente (.env)');
    console.error('   2. MySQL está acessível');
    console.error('   3. Credenciais corretas');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar
initProductionDB();


