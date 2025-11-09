-- ============================================
-- REMOVER TODAS AS POLÍTICAS E CRIAR NOVAS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. DESABILITAR RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        BEGIN
            EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error dropping policy %: %', r.policyname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. HABILITAR RLS NOVAMENTE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. AGUARDAR UM POUCO PARA O RLS ESTABILIZAR
DO $$
BEGIN
    PERFORM pg_sleep(0.5);
END $$;

-- 5. CRIAR POLÍTICAS CORRETAS (SEM IF NOT EXISTS)
-- Remover políticas específicas se existirem
DROP POLICY IF EXISTS "users_read_all" ON users;
DROP POLICY IF EXISTS "users_insert_auth" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;

-- Criar as novas políticas
CREATE POLICY "users_read_all" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "users_insert_auth" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. RECRIAR FUNÇÃO E TRIGGER
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 8. MENSAGEM FINAL
SELECT '✅ SUCESSO! Políticas criadas!' as status;

