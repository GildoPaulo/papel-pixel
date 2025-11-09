-- ============================================
-- CORRIGIR TODAS AS POLÍTICAS DO SUPABASE
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. CRIAR POLÍTICAS PERMISSIVAS PARA PRODUCTS
DROP POLICY IF EXISTS "Allow public read" ON products;
DROP POLICY IF EXISTS "Allow authenticated insert" ON products;
DROP POLICY IF EXISTS "Allow authenticated update" ON products;
DROP POLICY IF EXISTS "Allow authenticated delete" ON products;

CREATE POLICY "Allow public read" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- 3. HABILITAR RLS NOVAMENTE
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS PARA USERS
DROP POLICY IF EXISTS "Allow users to view own data" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Allow users to insert" ON users;

CREATE POLICY "Allow users to view own data" ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Allow users to update own data" ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow users to insert" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. VERIFICAR POLÍTICAS CRIADAS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('products', 'users');



