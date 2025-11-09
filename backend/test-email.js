// Script para testar envio de email
require('dotenv').config();
const { sendEmail, emailTemplates } = require('./config/email');

async function testEmail() {
  console.log('🧪 Testando envio de email...\n');
  
  console.log('📋 Configuração:');
  console.log('   Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
  console.log('   Port:', process.env.EMAIL_PORT || 587);
  console.log('   User:', process.env.EMAIL_USER || '(não configurado)');
  console.log('   Pass:', process.env.EMAIL_PASS ? '***' : '(não configurado)');
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Erro: EMAIL_USER ou EMAIL_PASS não configurados no .env');
    console.log('\n💡 Adicione no arquivo backend/.env:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=gildopaulovictor@gmail.com');
    console.log('   EMAIL_PASS=sua_senha_app_aqui');
    return;
  }
  
  try {
    const testEmail = process.env.TEST_EMAIL || 'gildopaulovictor@gmail.com';
    console.log(`📧 Enviando email de teste para: ${testEmail}...`);
    
    const result = await sendEmail(
      testEmail,
      emailTemplates.orderConfirmation,
      {
        id: 999,
        total: 550.00,
        status: 'confirmed'
      }
    );
    
    if (result.success) {
      console.log('✅ Email enviado com sucesso!');
      console.log('   Message ID:', result.messageId);
      console.log('\n📬 Verifique sua caixa de entrada (e spam/lixo eletrônico)');
    } else {
      console.error('❌ Erro ao enviar email:', result.error);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Problemas comuns:');
      console.log('   1. Verifique se está usando "Senha de App" do Gmail');
      console.log('   2. Certifique-se de que "Acesso a apps menos seguros" está ativado');
      console.log('   3. Se usar 2FA, precisa criar uma "Senha de App" específica');
    }
  }
}

testEmail().then(() => {
  console.log('\n✨ Teste concluído!');
  process.exit(0);
}).catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});

