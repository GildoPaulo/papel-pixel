# 🔐 RESOLVER LOGIN - PASSO A PASSO

## ⚠️ Problema
Usuário existe em `auth.users` mas **NÃO** em `public.users`, por isso o login falha!

## ✅ SOLUÇÃO IMEDIATA (2 minutos)

### 1. Acesse o SQL Editor do Supabase

Abra no navegador:
```
https://app.supabase.com/project/leqyvitngubadvsyfzya/editor
```

### 2. Execute Este SQL

**COPIE E COLE TUDO NO EDITOR:**

```sql
-- Criar usuário do Gildo na tabela users
INSERT INTO public.users (id, name, email, role)
VALUES (
  '3b784005-f25f-42d2-ab8e-e084c9952166',  -- UID do seu usuário
  'Gildo Paulo Victor',
  'gildopaulocorreia84@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name, 
  email = EXCLUDED.email,
  role = 'admin';

-- Verificar se foi criado
SELECT id, name, email, role FROM users WHERE email = 'gildopaulocorreia84@gmail.com';
```

### 3. Clique em "Run" (F5)

Você deve ver:
```
id                                   | name              | email                          | role
3b784005-f25f-42d2-ab8e-e084c9952166| Gildo Paulo Victor| gildopaulocorreia84@gmail.com | admin
```

### 4. Limpar Cache do Navegador

Abra o console (F12) e execute:

```javascript
localStorage.clear();
location.reload();
```

Ou:
1. Feche o navegador completamente
2. Abra novamente

### 5. Testar Login

1. Acesse a aplicação
2. Vá em **Login**
3. Digite:
   - Email: `gildopaulocorreia84@gmail.com`
   - Senha: sua senha
4. ✅ **Deve funcionar agora!**

## 🔍 Se AINDA Não Funcionar

### Verificar qual o UID correto

Execute este SQL para ver todos os usuários:

```sql
-- Ver todos os usuários no auth
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as name,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

Depois copie o **ID correto** e execute:

```sql
-- Criar na tabela users com o ID correto
INSERT INTO public.users (id, name, email, role)
VALUES (
  'COLE_O_ID_AQUI',
  'Nome do Usuário',
  'email@exemplo.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = 'admin';
```

## ✅ Checklist de Teste

- [ ] Executei o SQL no Supabase
- [ ] Vi o resultado mostrando o usuário criado
- [ ] Limpei o cache do navegador
- [ ] Fechei e abri o navegador
- [ ] Tentei fazer login
- [ ] Funcionou! 🎉

## 📞 Ainda com Problema?

Execute este SQL de diagnóstico:

```sql
-- Verificar se usuário existe em auth.users
SELECT id, email FROM auth.users WHERE email = 'gildopaulocorreia84@gmail.com';

-- Verificar se usuário existe em public.users
SELECT id, email, role FROM public.users WHERE email = 'gildopaulocorreia84@gmail.com';

-- Ver política RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'users';
```

Envie o resultado dessas queries para eu ver o problema.

