-- ============================================
-- RESOLVER LOGIN DEFINITIVAMENTE
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- PASSO 1: DELETAR USUÁRIO PROBLEMÁTICO
DELETE FROM auth.users WHERE email = 'teste@admin.com';
DELETE FROM public.users WHERE email = 'teste@admin.com';

-- PASSO 2: VERIFICAR QUE FOI DELETADO
SELECT 
  'Usuário deletado' as status,
  COUNT(*) as total_usuarios
FROM auth.users 
WHERE email = 'teste@admin.com';

-- PASSO 3: MENSAGEM
SELECT '✅ Agora vá criar o usuário pelo app!' as proximo_passo;

