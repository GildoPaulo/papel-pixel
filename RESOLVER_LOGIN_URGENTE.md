# 🚨 RESOLVER LOGIN AGORA

## ⚠️ Problema
Erro: "Credenciais inválidas ou erro de conexão"

Email tentado: `gildopaulovictor@gmail.com`  
*(Note que é diferente de `gildopaulocorreia84@gmail.com` que estava nos testes anteriores)*

---

## ✅ SOLUÇÃO IMEDIATA

### Passo 1: Verificar se o usuário existe no Supabase

Acesse: https://app.supabase.com/project/leqyvitngubadvsyfzya

Execute este SQL no **SQL Editor**:

```sql
-- 1. Verificar usuários na auth
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'gildopaulovictor@gmail.com';

-- 2. Verificar usuários na tabela users
SELECT id, email, name, role 
FROM public.users 
WHERE email = 'gildopaulovictor@gmail.com';
```

**Me mostre o resultado!**

---

### Passo 2A: Se o usuário NÃO existe - Criar

**Execute no SQL Editor:**

```sql
-- Primeiro, criar na auth (via interface)
-- Vá em: Authentication > Users > Add user
-- Email: gildopaulovictor@gmail.com
-- Password: Giseveral@01
-- Marque: "Auto Confirm User"
-- Clique: "Create user"

-- Depois, criar na tabela users
INSERT INTO public.users (id, name, email, role)
SELECT 
  id,
  'Gildo Paulo Victor' as name,
  email,
  'admin' as role
FROM auth.users
WHERE email = 'gildopaulovictor@gmail.com'
ON CONFLICT (id) DO UPDATE SET 
  name = 'Gildo Paulo Victor',
  email = EXCLUDED.email,
  role = 'admin';
```

---

### Passo 2B: Se o usuário EXISTE - Resetar senha

**No Dashboard do Supabase:**

1. Vá em **Authentication > Users**
2. Procure por `gildopaulovictor@gmail.com`
3. Clique nos **"..."** ao lado do usuário
4. Escolha **"Reset password"**
5. Verifique o email
6. Crie nova senha: `Giseveral@01`

---

### Passo 3: Limpar cache do navegador

No console do navegador (F12):

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

### Passo 4: Testar login novamente

Use:
- **Email:** `gildopaulovictor@gmail.com`
- **Senha:** `Giseveral@01`

---

## 🔧 Alternativa: Criar via Código

Se não funcionar via interface, vou criar um script para você:

**Execute no terminal:**

```bash
node criar-usuario.js
```

*(Vou criar este arquivo para você)*

---

## 📋 Checklist

- [ ] Verificar se usuário existe (Passo 1)
- [ ] Criar ou resetar senha (Passo 2)
- [ ] Limpar cache (Passo 3)
- [ ] Testar login (Passo 4)

**Me mostre o resultado de cada passo!**

