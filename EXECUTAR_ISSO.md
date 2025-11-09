# ⚠️ VOCÊ PRECISA FAZER ISSO AGORA!

## 🚨 O Problema
Você está recebendo **"Credenciais inválidas"** porque o usuário existe em `auth.users` mas **NÃO** em `public.users`.

## ✅ SOLUÇÃO (2 minutos)

### 📍 PASSO 1: Abrir SQL Editor
1. Abra: https://app.supabase.com/project/leqyvitngubadvsyfzya/editor
2. Ou entre em **SQL Editor** no menu lateral

### 📍 PASSO 2: Colar Este SQL
```sql
-- Criar usuário do Gildo
INSERT INTO public.users (id, name, email, role)
VALUES (
  '3b784005-f25f-42d2-ab8e-e084c9952166',
  'Gildo Paulo Victor',
  'gildopaulocorreia84@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = 'admin';

-- Verificar se foi criado
SELECT id, name, email, role FROM users WHERE email = 'gildopaulocorreia84@gmail.com';
```

### 📍 PASSO 3: Executar
Clique em **"Run"** ou pressione **F5**

### 📍 PASSO 4: Ver Resultado
Deve aparecer uma linha com seus dados.

### 📍 PASSO 5: Limpar Cache
No navegador onde está o erro:
1. Pressione **Ctrl+Shift+Delete**
2. Marque **"Cache"**
3. Clique em **"Limpar dados"**

OU no console (F12):

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 📍 PASSO 6: Fazer Login
1. Vá para a página de login
2. Digite: `gildopaulocorreia84@gmail.com`
3. Digite sua senha
4. ✅ **DEVE FUNCIONAR AGORA!**

---

## 📸 Screenshots do Que Você Precisa Ver

**No Supabase:**
```
id                                   | name              | email
3b784005-f25f-42d2-ab8e-e084c9952166| Gildo Paulo Victor| gildopaulocorreia84@gmail.com
```

**No Login:**
- Não deve mais mostrar "Credenciais inválidas"
- Deve fazer login com sucesso
- Deve redirecionar para a home

---

## ❓ Se Ainda Não Funcionar

Envie:
1. Screenshot do resultado do SQL
2. Screenshot do erro que aparece
3. Screenshot do console (F12)

**MAS EXECUTE O SQL PRIMEIRO!** Sem isso, nada vai funcionar.









