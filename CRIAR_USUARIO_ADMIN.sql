-- ============================================
-- CRIAR USUÁRIO ADMINISTRADOR
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Criar usuário admin na tabela users
INSERT INTO users (id, name, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',  -- ID fictício para admin
  'Administrador',
  'admin@papelpixel.co.mz',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 2. Verificar se foi criado
SELECT * FROM users WHERE email = 'admin@papelpixel.co.mz';

-- 3. Criar seu usuário normal também
INSERT INTO users (id, name, email, role)
VALUES (
  '618fed49-6fc4-448f-8b95-e106f4fc1569',
  'Gildo Paulo Correia',
  'gildopaulocorreia84@gmail.com',
  'user'
)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- 4. Listar todos os usuários
SELECT id, name, email, role FROM users ORDER BY email;










