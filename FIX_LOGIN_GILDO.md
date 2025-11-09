# 🔧 Correção de Login - Usuário Gildo

## ⚠️ Problema
O usuário existe em `auth.users` mas **NÃO** existe na tabela `users`, por isso o login falha.

**Dados do usuário:**
- ID: `652d8dcf-24e5-4e5d-a153-cd2fcbe20450`
- Email: `gildopaulovictor@gmail.com`
- Email confirmado: ✅ Sim
- Mas **não existe na tabela `public.users`**

## ✅ Solução Rápida

### Passo 1: Acesse o SQL Editor do Supabase

1. Vá para: https://app.supabase.com/project/leqyvitngubadvsyfzya
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New query**

### Passo 2: Execute este SQL

Copie e cole este SQL no editor:

```sql
-- 1. Remover políticas RLS problemáticas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Inserir o usuário do Gildo
INSERT INTO public.users (id, name, email, role)
VALUES (
  '652d8dcf-24e5-4e5d-a153-cd2fcbe20450',
  'Gildo Paulo',
  'gildopaulovictor@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = 'admin';

-- 3. Recriar políticas corretas
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for own data" ON users;
CREATE POLICY "Enable update for own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 4. Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Criar função para auto-criar usuários futuros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Verificar se funcionou
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  au.confirmed_at IS NOT NULL as verified
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'gildopaulovictor@gmail.com';
```

### Passo 3: Clique em "Run" (ou F5)

### Passo 4: Verificar resultado

Você deve ver algo como:
```
id                                   | name        | email                        | role  | verified
652d8dcf-24e5-4e5d-a153-cd2fcbe20450| Gildo Paulo | gildopaulovictor@gmail.com  | admin | t
```

### Passo 5: Limpar cache e testar

No navegador (F12 > Console), execute:

```javascript
localStorage.clear();
location.reload();
```

Ou simplesmente:
1. Feche o navegador
2. Abra novamente
3. Tente fazer login

## 🧪 Testar Login

1. Acesse a aplicação
2. Vá em "Login"
3. Digite:
   - Email: `gildopaulovictor@gmail.com`
   - Senha: sua senha
4. Deve funcionar agora! ✅

## 📋 Checklist

- [ ] Executei o SQL no Supabase
- [ ] Vi o resultado com o usuário criado
- [ ] Limpei o cache do navegador
- [ ] Tentei fazer login
- [ ] Funcionou! 🎉

## 🔍 Se ainda não funcionar

### Verificar se o usuário foi criado

Execute no SQL Editor:

```sql
SELECT * FROM public.users WHERE email = 'gildopaulovictor@gmail.com';
```

Se retornar vazio, execute novamente o SQL do Passo 2.

### Verificar política RLS

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Se não houver políticas, execute:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Reset da senha (se necessário)

1. Acesse: https://app.supabase.com/project/leqyvitngubadvsyfzya
2. Vá em **Authentication** > **Users**
3. Encontre `gildopaulovictor@gmail.com`
4. Clique em "..." e escolha **Reset password**
5. Envie o email e redefina

## 🎯 Próximos Passos Após Funcionar

1. **Adicione produtos** na página de admin
2. **Verifique** se aparecem em `/products`
3. **Teste a busca** de produtos
4. **Confirme** que tudo está funcionando

---

**Arquivos Criados:**
- `criar_usuario_gildo.sql` - SQL para criar usuário
- `corrigir_politicas_rls.sql` - SQL para corrigir políticas
- `FIX_LOGIN_GILDO.md` - Este arquivo

