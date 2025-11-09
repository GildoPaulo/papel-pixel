const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function setup() {
  let connection;
  
  try {
    console.log('🔧 Starting database setup...\n');
    
    // Create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database
    const dbName = process.env.DB_NAME || 'papel_pixel';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created or already exists`);
    
    // Switch to database
    await connection.execute(`USE \`${dbName}\``);
    
    // Read and execute SQL schema
    const sql = fs.readFileSync(__dirname + '/../sql/schema.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ All tables created successfully\n');
    
    // Insert sample data
    await connection.execute(`
      INSERT IGNORE INTO products (id, name, category, price, originalPrice, description, image, stock, isPromotion, isFeatured)
      VALUES 
      (1, 'Caderno Executivo Premium A5', 'Papelaria', 350.00, 450.00, 'Caderno de alta qualidade com capa dura', '/category-stationery.jpg', 50, true, true),
      (2, 'Box Harry Potter - Edição Especial', 'Livros', 2800.00, 3500.00, 'Coleção completa dos livros de Harry Potter', '/category-books.jpg', 25, true, false),
      (3, 'Revista Tech Monthly - Ed. Janeiro', 'Revistas', 120.00, null, 'Última edição da revista mensal de tecnologia', '/category-magazines.jpg', 100, false, false)
    `);
    
    console.log('✅ Sample data inserted\n');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update .env file with your database credentials');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:3001');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setup();












