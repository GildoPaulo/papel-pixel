-- ============================================
-- RESOLVER LOGIN - VERIFICAR EMAIL DO USUÁRIO
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. VERIFICAR QUAL USUÁRIO NÃO ESTÁ VERIFICADO
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'teste@admin.com';

-- 2. MANUALMENTE CONFIRMAR O EMAIL DO USUÁRIO
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'teste@admin.com';

-- 3. VERIFICAR SE FOI CONFIRMADO
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'teste@admin.com';

-- 4. MENSAGEM FINAL
SELECT '✅ USUÁRIO VERIFICADO! Pode fazer login agora!' as status;

