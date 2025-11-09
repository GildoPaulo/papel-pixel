# 🔧 RESOLVER LOGIN E CADASTRO FINAL

## 🎯 PROBLEMAS IDENTIFICADOS

### 1. Login Continua Falhando
- Erro: "Credenciais inválidas ou erro de conexão"
- Usuários aparecem no banco mas não conseguem fazer login

### 2. Cadastro Fica Parado
- Botão mostra "Criando conta..." e não termina
- Timeout de 20s mas ainda assim trava

---

## ✅ SOLUÇÃO

### ANTES DE TUDO: Configurar o Supabase

Execute estes passos na ordem:

#### 1. Acessar Dashboard do Supabase
https://supabase.com/dashboard/project/leqyvitngubadvsyfzya

#### 2. Desabilitar Verificação de Email
1. Vá em: **Authentication** → **Providers**
2. Clique em **Email**
3. **DESATIVE** ❌: "Confirm email"
4. **DESATIVE** ❌: "Enable email confirmations"
5. Clique em **Save**

#### 3. Verificar URL Configuration
1. Vá em: **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:5173` (ou porta que você está usando)
3. **Redirect URLs:** Adicione `http://localhost:5173/**`
4. Clique em **Save**

---

## 🔧 CORRIGIR USUÁRIOS EXISTENTES

Execute este SQL no Supabase SQL Editor:

```sql
-- Verificar status dos usuários
SELECT 
  email,
  email_confirmed_at,
  encrypted_password IS NOT NULL as tem_senha,
  last_sign_in_at,
  confirmed_at
FROM auth.users 
WHERE email IN ('teste@admin.com', 'admin@papelpixel.co.mz');

-- Confirmar emails
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email IN ('teste@admin.com', 'admin@papelpixel.co.mz')
  AND email_confirmed_at IS NULL;
```

---

## 🧪 TESTAR CADASTRO NOVO

### Passo 1: Limpar Cache
1. Pressione **Ctrl+Shift+R** (recarregar forçado)
2. Ou abra DevTools (F12) → **Application** → **Clear storage**

### Passo 2: Criar Nova Conta
1. Vá para: http://localhost:5173/register
2. Use um email NOVO (nunca usado antes)
3. Preencha: Nome, Email, Senha
4. Clique em **Criar conta**

**O que deve acontecer:**
- ✅ Mostra "Criando conta..."
- ✅ Em 2-3 segundos mostra sucesso OU erro
- ✅ **NÃO fica preso!**

### Passo 3: Fazer Login
1. Vá para: http://localhost:5173/login
2. Use o mesmo email e senha
3. Clique em **Entrar**
4. ✅ Deve funcionar!

---

## 📊 VERIFICAR ERROS NO CONSOLE

Abra DevTools (F12) e veja o console:

### Erro Comum 1: "Failed to fetch"
**Causa:** Supabase não está acessível ou URL incorreta  
**Solução:** Verificar URL no `.env` ou `supabase.ts`

### Erro Comum 2: "Invalid API Key"
**Causa:** Key do Supabase está errada  
**Solução:** Copiar key correta do dashboard

### Erro Comum 3: "User already registered"
**Causa:** Email já está cadastrado  
**Solução:** Usar outro email ou fazer login

---

## 🚨 SE NADA FUNCIONAR

### Deletar Tudo e Começar de Novo

```sql
-- NO SUPABASE SQL EDITOR:
DELETE FROM auth.users;
DELETE FROM public.users;
```

Depois:
1. Configure Supabase (passos acima)
2. Crie conta nova
3. Teste login

---

## ✅ CHECKLIST DE RESOLUÇÃO

- [ ] "Confirm email" está desativado no Supabase
- [ ] "Enable email confirmations" está desativado
- [ ] URL Configuration está correta
- [ ] Executou SQL para confirmar emails
- [ ] Limpou cache do navegador
- [ ] Criou conta nova (email novo)
- [ ] Tentou fazer login

---

## 🎉 DEVE FUNCIONAR AGORA!

Se ainda não funcionar, me envie:
1. Screenshot da mensagem de erro
2. Console do navegador (F12 → Console)
3. Qual email está tentando usar

