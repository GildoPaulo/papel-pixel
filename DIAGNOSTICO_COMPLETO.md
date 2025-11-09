# 🔍 Diagnóstico Completo - Passo a Passo

## 1️⃣ Verificar se Tabela Users Existe

Execute este SQL no Supabase:

```sql
-- Ver se tabela users existe
SELECT * FROM information_schema.tables 
WHERE table_name = 'users' AND table_schema = 'public';
```

**Se retornar vazio:**
```sql
-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 2️⃣ Desabilitar RLS Temporariamente

```sql
-- Desabilitar RLS para testar
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

## 3️⃣ Criar o Usuário

```sql
INSERT INTO public.users (id, name, email, role)
VALUES (
  '3b784005-f25f-42d2-ab8e-e084c9952166',
  'Gildo Paulo Victor',
  'gildopaulocorreia84@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = 'admin';
```

## 4️⃣ Verificar se Foi Criado

```sql
SELECT * FROM users;
```

**Você deve ver seus dados!**

## 5️⃣ Verificar Auth User

```sql
SELECT id, email, confirmed_at FROM auth.users WHERE email = 'gildopaulocorreia84@gmail.com';
```

## 6️⃣ Testar Login no App

1. Feche o navegador completamente
2. Abra novamente
3. Vá para a aplicação
4. Tente fazer login

---

## 📋 Me Envie:

1. **Resultado do passo 1** (existe a tabela?)
2. **Resultado do passo 2** (RLS desabilitado?)
3. **Resultado do passo 3** (inserção deu certo?)
4. **Resultado do passo 4** (o que aparece na consulta?)
5. **Resultado do passo 5** (o que aparece na auth.users?)
6. **Screenshot do erro** (se ainda der erro)

---

## 🆘 Se NADA Funcionar

Execute este SQL completo (copie TUDO):

```sql
-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Desabilitar RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Inserir usuário
INSERT INTO users (id, name, email, role)
VALUES (
  '3b784005-f25f-42d2-ab8e-e084c9952166',
  'Gildo Paulo Victor',
  'gildopaulocorreia84@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = 'admin';

-- 4. Verificar
SELECT * FROM users;
```

**Depois disso, deve funcionar!** ✅









