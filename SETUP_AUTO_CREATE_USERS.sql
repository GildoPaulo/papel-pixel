-- ============================================
-- SCRIPT PARA ATIVAR CRIAÇÃO AUTOMÁTICA DE USUÁRIOS
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Desabilitar RLS na tabela users temporariamente
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir inserção de novos usuários
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
CREATE POLICY "Enable insert for authenticated users only" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Criar política para permitir leitura
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4. Criar política para permitir que usuários atualizem seus próprios dados
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Habilitar RLS novamente
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Criar o usuário existente manualmente (com seus dados)
INSERT INTO users (id, name, email, role)
VALUES (
  '618fed49-6fc4-448f-8b95-e106f4fc1569',
  'Gildo Paulo Correia',
  'gildopaulocorreia84@gmail.com',
  'user'
)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- 7. Verificar se foi criado
SELECT * FROM users;

-- 8. Criar função para criar usuário automaticamente no futuro
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

-- 9. Criar trigger para executar automaticamente quando novo usuário é criado no auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ✅ TUDO CONFIGURADO! Agora os usuários são criados automaticamente.










