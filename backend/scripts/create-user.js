const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

async function createUser() {
  const name = 'Gildo Paulo Victor';
  const email = 'gildopaulovictor@gmail.com';
  const password = '123456';
  const role = 'admin';

  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Inserir usuário
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    console.log('✅ Usuário criado com sucesso!');
    console.log('Email:', email);
    console.log('Senha:', password);
    console.log('Role:', role);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️ Usuário já existe');
      console.log('Email:', email);
      console.log('Tente fazer login com este email');
    } else {
      console.error('❌ Erro:', error.message);
    }
    process.exit(1);
  }
}

createUser();

