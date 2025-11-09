// 🧪 TESTE SUPER SIMPLES
// Cole no console do navegador

// Método 1: Verificar configuração básica
console.log('URL:', import.meta.env.VITE_SUPABASE_URL || 'Hardcoded fallback');
console.log('Key definida?', !!import.meta.env.VITE_SUPABASE_KEY);

// Método 2: Importar e usar diretamente
const mod = await import('/src/config/supabase.ts');
const { supabase } = mod;

console.log('✅ Supabase OK!');
console.log('URL:', supabase.supabaseUrl);

// Testar conexão
const { count, error } = await supabase
  .from('users')
  .select('*', { count: 'exact', head: true });

if (error) {
  console.error('❌ Erro:', error.message);
} else {
  console.log('✅ Banco conectado! Total:', count || 0);
}

// Retornar o objeto para usar depois
window.supabase = supabase;
console.log('\n💡 Agora você pode usar: window.supabase');

