// 🧪 Teste Rápido do Supabase
// Execute no console do navegador (F12)

(async () => {
  console.clear();
  console.log('🧪 TESTE DE CONFIGURAÇÃO DO SUPABASE\n');
  
  // 1. Verificar variáveis
  console.log('1️⃣ Verificando variáveis de ambiente...');
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_KEY;
  
  if (!url) {
    console.error('❌ VITE_SUPABASE_URL não definida');
    console.log('💡 Solução: Crie um arquivo .env na raiz com:');
    console.log('   VITE_SUPABASE_URL=https://leqyvitngubadvsyfzya.supabase.co');
    return;
  }
  
  if (!key) {
    console.error('❌ VITE_SUPABASE_KEY não definida');
    console.log('💡 Solução: Crie um arquivo .env na raiz com:');
    console.log('   VITE_SUPABASE_KEY=sua_chave_aqui');
    return;
  }
  
  console.log('   ✅ URL:', url);
  console.log('   ✅ Key:', key.substring(0, 30) + '...');
  
  // 2. Importar Supabase
  console.log('\n2️⃣ Importando cliente Supabase...');
  try {
    const { supabase } = await import('/src/config/supabase.ts');
    console.log('   ✅ Cliente importado');
    console.log('   URL:', supabase.supabaseUrl);
  } catch (error) {
    console.error('   ❌ Erro ao importar:', error.message);
    return;
  }
  
  // 3. Testar conexão
  console.log('\n3️⃣ Testando conexão com banco...');
  try {
    const { supabase } = await import('/src/config/supabase.ts');
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('   ❌ Erro:', error.message);
      console.log('   💡 Verifique se a tabela "users" existe no Supabase');
    } else {
      console.log('   ✅ Conexão OK!');
      console.log('   👥 Total de usuários:', count || 0);
    }
  } catch (error) {
    console.error('   ❌ Erro:', error.message);
  }
  
  // 4. Verificar sessão
  console.log('\n4️⃣ Verificando sessão atual...');
  try {
    const { supabase } = await import('/src/config/supabase.ts');
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('   ✅ Usuário logado:', session.user.email);
    } else {
      console.log('   ℹ️ Nenhum usuário logado');
    }
  } catch (error) {
    console.error('   ❌ Erro:', error.message);
  }
  
  console.log('\n✅ Teste concluído!');
})();

