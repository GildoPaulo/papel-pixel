-- ============================================
-- RESOLVER LOGIN DEFINITIVO
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- PASSO 1: VERIFICAR STATUS ATUAL
SELECT '📊 STATUS ATUAL DO USUÁRIO' as info;
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'teste@admin.com';

-- PASSO 2: CONFIRMAR EMAIL MANUALMENTE
SELECT '🔧 CONFIRMANDO EMAIL...' as info;
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'teste@admin.com';

-- PASSO 3: GARANTIR QUE TEM SENHA
SELECT '🔑 VERIFICANDO SENHA...' as info;
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'teste@admin.com';

-- PASSO 4: VERIFICAR SE EXISTE NA TABELA PUBLIC.USERS
SELECT '📋 VERIFICANDO TABELA PUBLIC.USERS...' as info;
SELECT 
  id,
  name,
  email,
  role
FROM public.users
WHERE email = 'teste@admin.com';

-- PASSO 5: CRIAR NA TABELA SE NÃO EXISTIR
INSERT INTO public.users (id, name, email, role)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  au.email,
  'user'
FROM auth.users au
WHERE au.email = 'teste@admin.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
  );

-- PASSO 6: VERIFICAR RESULTADO FINAL
SELECT '✅ RESULTADO FINAL' as info;
SELECT 
  'Email confirmado' as status,
  email_confirmed_at IS NOT NULL as email_verified,
  last_sign_in_at IS NOT NULL as has_signed_in
FROM auth.users 
WHERE email = 'teste@admin.com';

-- PASSO 7: MENSAGEM FINAL
SELECT '🎉 TENTE FAZER LOGIN AGORA!' as mensagem;

