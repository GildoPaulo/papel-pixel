// 🧪 Script de Verificação do Supabase
// Copie e cole este código no Console do navegador (F12)

console.log('🔍 Iniciando verificação do Supabase...\n');

// Verificar variáveis de ambiente
console.log('📋 Variáveis de Ambiente:');
console.log('  VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || '❌ NÃO DEFINIDA');
console.log('  VITE_SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_KEY ? import.meta.env.VITE_SUPABASE_KEY.substring(0, 30) + '...' : '❌ NÃO DEFINIDA');
console.log('');

// Verificar configuração do Supabase
try {
  const { supabase } = await import('/src/config/supabase.ts');
  console.log('✅ Cliente Supabase importado com sucesso');
  console.log('  URL:', supabase.supabaseUrl);
  console.log('  Key:', supabase.supabaseKey?.substring(0, 30) + '...');
  console.log('');
  
  // Verificar sessão atual
  console.log('🔐 Verificando sessão atual...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('❌ Erro ao verificar sessão:', sessionError.message);
  } else {
    console.log('  Usuário logado:', session ? '✅ SIM' : '❌ NÃO');
    if (session) {
      console.log('  Email:', session.user.email);
      console.log('  UID:', session.user.id);
    }
  }
  console.log('');
  
  // Verificar usuários no banco
  console.log('👥 Verificando usuários no banco...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(5);
    
  if (usersError) {
    console.error('❌ Erro ao buscar usuários:', usersError.message);
  } else {
    console.log(`  Encontrados ${users.length} usuário(s):`);
    users.forEach(user => {
      console.log(`    - ${user.email} (${user.role})`);
    });
  }
  console.log('');
  
  // Verificar produtos no banco
  console.log('🛍️ Verificando produtos no banco...');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .limit(5);
    
  if (productsError) {
    console.error('❌ Erro ao buscar produtos:', productsError.message);
  } else {
    console.log(`  Encontrados ${products.length} produto(s):`);
    products.forEach(product => {
      console.log(`    - ${product.name} (R$ ${product.price})`);
    });
  }
  
  console.log('\n✅ Verificação completa!');
  
} catch (error) {
  console.error('❌ ERRO CRÍTICO:', error);
  console.error('Detalhes:', error.message);
}

