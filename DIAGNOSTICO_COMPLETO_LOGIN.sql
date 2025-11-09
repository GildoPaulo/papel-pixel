-- ============================================
-- DIAGNÓSTICO COMPLETO DO PROBLEMA DE LOGIN
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. VERIFICAR STATUS DO USUÁRIO NO AUTH
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at,
  encrypted_password IS NOT NULL as has_password,
  email_change_token_new IS NOT NULL as pending_email_change,
  recovery_sent_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'teste@admin.com';

-- 2. VERIFICAR SE EXISTE NA TABELA PUBLIC.USERS
SELECT 
  id,
  name,
  email,
  role,
  created_at
FROM public.users
WHERE email = 'teste@admin.com';

-- 3. VERIFICAR RLS POLICIES NA TABELA USERS
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- 4. VERIFICAR SE HÁ POLÍTICAS BLOQUEANDO
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

