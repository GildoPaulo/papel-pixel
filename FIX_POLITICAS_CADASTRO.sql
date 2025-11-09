-- ============================================
-- CORRIGIR POLÍTICAS PARA PERMITIR CADASTRO DE USUÁRIOS
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA CORRIGIR
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

-- 3. CRIAR POLÍTICAS CORRETAS PARA PERMITIR CADASTRO

-- Permitir que todos leiam a tabela users (necessário para verificar se email existe)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT
  USING (true);

-- Permitir inserção para authenticated users (triggers funcionam com authenticated)
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

-- 4. HABILITAR RLS NOVAMENTE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR SE O TRIGGER JÁ EXISTE
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'auth' AND event_object_table = 'users';

-- 6. CRIAR OU SUBSTITUIR A FUNÇÃO PARA CRIAR USUÁRIOS AUTOMATICAMENTE
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

-- 7. REMOVER TRIGGER ANTIGO (SE EXISTIR)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 8. CRIAR O TRIGGER NOVO
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. VERIFICAR AS POLÍTICAS CRIADAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 10. TESTAR: VERIFICAR USUÁRIOS NA TABELA
SELECT id, name, email, role, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- ✅ TUDO CONFIGURADO! Agora tente criar um novo usuário.
-- O trigger criará automaticamente a entrada na tabela public.users quando você fizer signup.

