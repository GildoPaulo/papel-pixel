-- ============================================
-- VERIFICAR EMAIL E RESOLVER LOGIN
-- Cole e execute no Supabase SQL Editor
-- ============================================

UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'teste@admin.com';

-- Verificar se funcionou
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'teste@admin.com';

