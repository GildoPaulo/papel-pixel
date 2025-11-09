# 🚨 URGENTE: Execute este SQL AGORA

## ⚠️ Problema
O cadastro está travando. Precisamos configurar o Supabase corretamente.

## ✅ SOLUÇÃO RÁPIDA

### Passo 1: Abrir Supabase SQL Editor

1. Vá para: https://app.supabase.com
2. Faça login na sua conta
3. Selecione seu projeto
4. No menu ESQUERDO, clique em **"SQL Editor"**
5. Clique no botão **"New query"**

### Passo 2: Copiar o SQL abaixo

Copie TODO este código SQL:

```sql
-- ============================================
-- CORRIGIR POLÍTICAS PARA PERMITIR CADASTRO DE USUÁRIOS
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON users;
DROP POLICY IF EXISTS "Allow users to view own data" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Allow users to insert" ON users;

-- 3. CRIAR POLÍTICAS CORRETAS

-- Permitir que todos leiam (para verificar email)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT
  USING (true);

-- Permitir inserção (para o trigger criar usuários)
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir update apenas para o próprio usuário
CREATE POLICY "Enable update for own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. HABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. CRIAR FUNÇÃO PARA CRIAR USUÁRIOS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$ LANGUAGE plpgsql;

-- 6. CRIAR TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. VERIFICAR SE FUNCIONOU
SELECT 'Políticas criadas com sucesso!' as status;
```

### Passo 3: Colar e Executar

1. Cole o SQL acima no editor
2. Clique no botão **"Run"** ou pressione **F5**
3. Aguarde alguns segundos
4. Você deve ver: "Políticas criadas com sucesso!"

### Passo 4: Limpar Cache do Navegador

Abra o Console do Navegador (F12) e execute:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Ou simplesmente:
1. Pressione **Ctrl + Shift + Delete**
2. Selecione "Cookies" e "Cached images"
3. Clique em "Clear data"
4. Recarregue a página (F5)

### Passo 5: Testar Cadastro

1. Vá para a página de registro
2. Tente criar uma conta NOVA
3. Use um email DIFERENTE (ex: teste123@gmail.com)
4. Deve funcionar agora! ✅

## 🔍 Se ainda não funcionar

### Verificar no Console do Navegador (F12)

Abra a aba "Console" e veja se há erros. Deve aparecer:
- `Starting registration for: teste@gmail.com`
- `SignUp response: {...}`
- `User created successfully: xxx-xxx-xxx`

Se aparecer erro, me diga qual é a mensagem!

## 📋 Checklist

- [ ] Abri o SQL Editor no Supabase
- [ ] Colei e executei o SQL
- [ ] Vi a mensagem "Políticas criadas com sucesso!"
- [ ] Limpei o cache do navegador
- [ ] Tentei criar uma conta NOVA
- [ ] Funcionou! 🎉

