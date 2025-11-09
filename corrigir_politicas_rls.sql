-- ============================================
-- CORRIGIR POLÍTICAS RLS PARA PERMITIR ACESSO
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Desabilitar RLS temporariamente para corrigir
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON users;

-- 3. Criar políticas corretas

-- Permitir que todos leiam a tabela users (necessário para verificar roles)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT
  USING (true);

-- Permitir inserção apenas para authenticated
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

-- 4. Habilitar RLS novamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Criar trigger para criar usuário automaticamente quando faz signup
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

-- 6. Criar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Agora criar o usuário do Gildo manualmente
INSERT INTO public.users (id, name, email, role)
VALUES (
  '652d8dcf-24e5-4e5d-a153-cd2fcbe20450',
  'Gildo Paulo',
  'gildopaulovictor@gmail.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE 
SET 
  name = EXCLUDED.name, 
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- 8. Verificar
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  au.confirmed_at IS NOT NULL as email_verified
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'gildopaulovictor@gmail.com';

-- ✅ Concluído! Agora o usuário deve conseguir fazer login.

