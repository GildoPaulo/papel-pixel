const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('🔐 Teste de Token JWT\n');

// Verificar JWT_SECRET
const secret = process.env.JWT_SECRET || 'seu_secret_key';
console.log('1. JWT_SECRET configurado:', secret ? '✅ SIM' : '❌ NÃO');
console.log('   Valor:', secret.substring(0, 10) + '...\n');

// Criar um token de teste
const testToken = jwt.sign(
  { id: 1, email: 'admin@test.com', role: 'admin' },
  secret,
  { expiresIn: '7d' }
);

console.log('2. Token gerado com sucesso: ✅');
console.log('   Token:', testToken.substring(0, 50) + '...\n');

// Tentar verificar o token
try {
  const decoded = jwt.verify(testToken, secret);
  console.log('3. Token verificado com sucesso: ✅');
  console.log('   Decoded:', decoded, '\n');
} catch (error) {
  console.log('3. Erro ao verificar token: ❌');
  console.log('   Erro:', error.message, '\n');
}

// Teste com token do localStorage (se fornecido)
const testUserToken = process.argv[2];
if (testUserToken) {
  console.log('4. Testando token fornecido...');
  try {
    const decoded = jwt.verify(testUserToken, secret);
    console.log('   ✅ Token válido!');
    console.log('   Dados:', decoded);
  } catch (error) {
    console.log('   ❌ Token inválido!');
    console.log('   Erro:', error.message);
    console.log('\n   💡 Solução: Faça logout e login novamente');
  }
} else {
  console.log('4. Para testar seu token:');
  console.log('   node test-token.js "SEU_TOKEN_AQUI"');
}



