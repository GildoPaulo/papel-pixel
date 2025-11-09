# 🚨 FAZER ISSO AGORA - 3 PASSOS

Você está vendo o erro **"Credenciais inválidas"** porque o usuário não existe na tabela `users`.

## ⏱️ RESOLVER EM 2 MINUTOS

### 📍 PASSO 1: Copiar Este SQL

```sql
INSERT INTO public.users (id, name, email, role)
VALUES (
  '3b784005-f25f-42d2-ab8e-e084c9952166',
  'Gildo Paulo Victor',
  'gildopaulocorreia84@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, role = 'admin';

SELECT * FROM users WHERE email = 'gildopaulocorreia84@gmail.com';
```

### 📍 PASSO 2: Colar no Supabase

1. Abra: https://app.supabase.com/project/leqyvitngubadvsyfzya/editor
2. Cole o SQL acima
3. Clique em **RUN** (ou pressione F5)
4. Você deve ver uma linha com seus dados

### 📍 PASSO 3: Limpar Cache

No navegador onde está o erro de login:

**Pressione F12** (abre console)

**Cole e pressione ENTER:**

```javascript
localStorage.clear(); location.reload();
```

### 📍 PASSO 4: Tentar Login Novamente

1. **Email:** `gildopaulocorreia84@gmail.com`
2. **Senha:** sua senha
3. Clique em **Entrar**
4. ✅ **DEVE FUNCIONAR AGORA!**

---

## ❓ Se Ainda Não Funcionar

### A. Ver qual UID está usando

Execute este SQL:

```sql
SELECT id, email FROM auth.users WHERE email LIKE '%gildo%';
```

Depois copie o ID que aparece e use na query do PASSO 1.

### B. Resetar Senha

1. Clique em **"Esqueci a senha"** na página de login
2. Digite seu email
3. Verifique o email enviado
4. Crie nova senha

---

## ✅ Após Funcionar

Quando conseguir fazer login:
1. ✅ Implementar sistema de fotos
2. ✅ Adicionar produtos com múltiplas fotos
3. ✅ Testar todo o sistema

**MAS PRIMEIRO RESOLVA O LOGIN!** 🔐

