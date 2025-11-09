-- Criar usuário para Gildo Paulo na tabela users
-- Execute no SQL Editor do Supabase

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

-- Verificar se foi criado
SELECT * FROM users WHERE email = 'gildopaulovictor@gmail.com';

-- Verificar se o usuário pode acessar a tabela
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  au.confirmed_at,
  au.last_sign_in_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'gildopaulovictor@gmail.com';

