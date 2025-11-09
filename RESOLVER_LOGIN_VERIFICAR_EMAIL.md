# 🔓 RESOLVER LOGIN - Verificar Email

## 🎯 Problema
O usuário `teste@admin.com` foi criado mas não consegue fazer login porque o email não foi verificado.

## ✅ Solução 1: Verificar Email Automaticamente (RECOMENDADO)

### Passo 1: Executar SQL no Supabase
1. Acesse: https://supabase.com/dashboard/project/leqyvitngubadvsyfzya
2. Vá em **SQL Editor** (menu lateral)
3. Cole o código do arquivo `RESOLVER_LOGIN_AGORA.sql`
4. Clique em **Run**

### Passo 2: Testar Login
1. Volte para o app: http://localhost:8080/login
2. Email: `teste@admin.com`
3. Senha: (a senha que você usou)
4. Deve funcionar agora! ✅

---

## ✅ Solução 2: Desabilitar Verificação de Email (FUTURO)

Para novos usuários não precisarem verificar email:

### No Dashboard do Supabase:
1. Vá em: **Authentication** → **Providers**
2. Procure por: **Email**
3. Desative: **"Confirm email"** ❌
4. Clique em **Save**

---

## 🔍 Verificar Status Atual

Execute no SQL Editor:

```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'teste@admin.com';
```

Se `email_confirmed_at` estiver vazio, é por isso que não funciona!

---

## ⚡ Solução Rápida - Verificar Manualmente

```sql
UPDATE auth.users
SET 
  email_confirmed_at = NOW()
WHERE email = 'teste@admin.com';
```

✅ Execute isso e depois tente fazer login novamente!

