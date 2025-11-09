# 🔍 Como Verificar a Configuração do Supabase

## 📋 Verificação Rápida (5 minutos)

### 1️⃣ Verificar no Console do Navegador

1. Abra o aplicativo no navegador
2. Pressione **F12** para abrir o DevTools
3. Vá na aba **Console**
4. Cole e execute o código abaixo:

```javascript
// Verificar configuração
console.log('🔍 Verificando Supabase...');

// Verificar variáveis de ambiente
console.log('📋 Variáveis de Ambiente:');
console.log('  URL:', import.meta.env.VITE_SUPABASE_URL || '❌ NÃO DEFINIDA');
console.log('  Key:', import.meta.env.VITE_SUPABASE_KEY ? '✅ DEFINIDA' : '❌ NÃO DEFINIDA');
console.log('');

// Importar e verificar Supabase
try {
  const { supabase } = await import('/src/config/supabase.ts');
  console.log('✅ Cliente Supabase OK');
  console.log('  URL:', supabase.supabaseUrl);
  console.log('');
  
  // Testar conexão
  const { data, error } = await supabase.from('users').select('count').single();
  if (error) {
    console.error('❌ Erro de conexão:', error.message);
  } else {
    console.log('✅ Conexão com banco OK');
    console.log('  Total de usuários:', data?.count || 'N/A');
  }
} catch (error) {
  console.error('❌ ERRO:', error.message);
}
```

---

### 2️⃣ Verificar no Código

Abra o arquivo `src/config/supabase.ts` e verifique:

```typescript
// ✅ Deve ter estas variáveis:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xxxxx.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIs...';
```

**O que verificar:**
- [ ] URL começa com `https://`
- [ ] URL termina com `.supabase.co`
- [ ] Key começa com `eyJ`
- [ ] Key tem mais de 100 caracteres

---

### 3️⃣ Verificar no Dashboard do Supabase

Acesse: https://app.supabase.com/project/leqyvitngubadvsyfzya

#### Verificar Configurações:
1. **Settings > API** - Verificar se as credenciais estão corretas
2. **Authentication > Users** - Verificar se seu usuário existe
3. **Database > Tables** - Verificar se as tabelas existem

#### Executar SQL de Verificação:

```sql
-- Verificar usuários
SELECT id, email, role, created_at FROM users;

-- Verificar produtos
SELECT id, name, price, stock FROM products;

-- Verificar autenticação
SELECT id, email, created_at FROM auth.users;
```

---

### 4️⃣ Verificar Arquivo .env

Verifique se existe um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://leqyvitngubadvsyfzya.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcXl2aXRuZ3ViYWR2c3lmenlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1Nzc2MTksImV4cCI6MjA3NzE1MzYxOX0.eLs15AWrJCjQK-iTnifRG6EoVQ-1KRTEdCx2M0Bpu7Y
```

**Se o arquivo não existir, crie-o:**
1. Crie um arquivo chamado `.env` na raiz do projeto
2. Adicione as variáveis acima
3. Reinicie o servidor de desenvolvimento

---

### 5️⃣ Testar Login

No console do navegador, execute:

```javascript
// Importar Supabase
const { supabase } = await import('/src/config/supabase.ts');

// Tentar login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'gildopaulocorreia84@gmail.com',
  password: 'SUA_SENHA'
});

if (error) {
  console.error('❌ Erro de login:', error.message);
} else {
  console.log('✅ Login OK:', data.user.email);
}
```

---

## 🐛 Problemas Comuns

### ❌ "Invalid API key"
**Solução:** Atualize a chave no arquivo `src/config/supabase.ts`

### ❌ "Failed to fetch"
**Solução:** Verifique se o projeto está ativo no dashboard do Supabase

### ❌ "Invalid credentials"
**Solução:** Reset a senha no Dashboard > Authentication > Users

### ❌ "Table 'users' doesn't exist"
**Solução:** Execute o SQL de criação de tabelas no SQL Editor

---

## ✅ Checklist Completo

- [ ] Variáveis de ambiente configuradas
- [ ] Cliente Supabase importa sem erros
- [ ] Conexão com banco funciona
- [ ] Usuário existe no banco
- [ ] Login funciona
- [ ] Produtos carregam corretamente

---

## 📞 Precisa de Ajuda?

Mostre os resultados de cada etapa para diagnóstico completo.

