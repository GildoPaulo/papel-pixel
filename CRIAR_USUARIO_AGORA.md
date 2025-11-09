# 🚀 Criar Usuário FUNCIONAL Agora

## ⚠️ Problema
Os usuários estão na tabela `users` mas NÃO na tabela `auth.users`
Por isso o login falha com "credenciais inválidas".

## ✅ Solução: Criar Usuário NO APP

### Opção 1: Registrar no App (RECOMENDADO)

1. **Vá no aplicativo**
2. **Clique em "Criar conta"**
3. **Preencha:**
   - Nome: `Admin Teste`
   - Email: `admin@teste.com`
   - Senha: `123456`
4. **Clique "Criar conta"**
5. **Faça login** com este usuário

### Opção 2: Criar via Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Users**
3. Clique em **"Add user"**
4. Preencha:
   - Email: `admin@teste.com`
   - Senha: `123456`
   - Auto Confirm User: ✅ (marque)
5. Clique em **"Create user"**

### Tornar Admin

Execute este SQL:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@teste.com';
```

## 🧪 Testar

1. Faça login com: `admin@teste.com` / `123456`
2. Acesse "Painel Admin"
3. Adicione um produto
4. ✅ Deve funcionar!

---

**Importante:** Crie o usuário pelo app ou dashboard do Supabase, NÃO apenas pela tabela users!










