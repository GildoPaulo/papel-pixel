# 🧪 Teste Direto no Console

## PASSO 1: Abrir Console
1. Abra o app
2. Pressione **F12**
3. Vá na aba **Console**

## PASSO 2: Verificar Configuração
Cole e pressione ENTER:

```javascript
// Verificar se supabase está configurado
const { supabase } = await import('/src/config/supabase.ts');
console.log('URL:', supabase.supabaseUrl);
console.log('Key:', supabase.supabaseKey?.substring(0, 30) + '...');
```

## PASSO 3: Tentar Login Manual
Cole e pressione ENTER (substitua SUA_SENHA):

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'gildopaulocorreia84@gmail.com',
  password: 'SUA_SENHA_AQUI'
});

if (error) {
  console.error('❌ ERRO:', error.message);
  console.error('Código:', error.status);
} else {
  console.log('✅ LOGIN OK!', data);
}
```

**Me mostre o erro que aparecer!**

## PASSO 4: Verificar Usuário no Banco
Execute este SQL no Supabase:

```sql
-- Ver usuário
SELECT id, email, role FROM users WHERE email = 'gildopaulocorreia84@gmail.com';

-- Ver na auth.users
SELECT id, email, encrypted_password FROM auth.users WHERE email = 'gildopaulocorreia84@gmail.com';
```

## PASSO 5: Se Der "Invalid password"

### Redefinir Senha via Dashboard:
1. Acesse: https://app.supabase.com/project/leqyvitngubadvsyfzya
2. Vá em **Authentication > Users**
3. Encontre seu usuário
4. Clique nos **"..."** ao lado
5. Escolha **"Reset password"**
6. Verifique o email
7. Crie nova senha

---

## 🎯 Me Mostre:
1. O que aparece no PASSO 2
2. O erro que aparece no PASSO 3
3. O resultado do SQL do PASSO 4

**Assim eu vejo exatamente qual é o problema!**


