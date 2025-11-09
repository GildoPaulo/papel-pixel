-- ============================================
-- CORRIGIR TUDO PARA LOGIN FUNCIONAR
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. CONFIRMAR EMAIL DO USUÁRIO
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  updated_at = NOW()
WHERE email = 'teste@admin.com';

-- 2. GARANTIR QUE USUÁRIO EXISTE NA TABELA PUBLIC.USERS
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
  )
ON CONFLICT (id) DO NOTHING;

-- 3. VERIFICAR SE TEM SENHA
SELECT 
  email,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN '✅ TEM SENHA'
    ELSE '❌ SEM SENHA'
  END as status_senha,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ EMAIL CONFIRMADO'
    ELSE '❌ EMAIL NÃO CONFIRMADO'
  END as status_email
FROM auth.users 
WHERE email = 'teste@admin.com';

-- 4. MENSAGEM FINAL
SELECT '🎉 AGORA TENTE FAZER LOGIN!' as mensagem;

