# 🔧 Corrigir Erro: "Email Já Cadastrado"

## ⚠️ Problema
Ao tentar criar uma conta, aparece erro "E-mail já cadastrado" mesmo que o email não esteja cadastrado.

## ✅ Solução

### Passo 1: Execute o SQL no Supabase

1. Acesse seu projeto Supabase: https://app.supabase.com/project/YOUR_PROJECT
2. Clique em **SQL Editor** no menu lateral
3. Abra o arquivo `FIX_POLITICAS_CADASTRO.sql` que está no seu projeto
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** (ou pressione F5)
7. Você deve ver mensagens como: "ALTER TABLE", "CREATE POLICY", etc.

### Passo 2: Verificar se funcionou

Após executar o SQL, verifique se as políticas foram criadas:

```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'users';
```

Você deve ver 3 políticas:
- `Enable read access for all users` (SELECT)
- `Enable insert for authenticated users` (INSERT)
- `Enable update for own data` (UPDATE)

### Passo 3: Verificar o Trigger

Verifique se o trigger foi criado:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'auth' AND event_object_table = 'users';
```

Você deve ver `on_auth_user_created` configurado.

### Passo 4: Testar Cadastro

1. Abra a aplicação no navegador
2. Vá para "/register"
3. Tente criar uma conta com um email que NÃO existe
4. Deve funcionar agora! ✅

### Passo 5: Se ainda não funcionar

Se ainda aparecer "email já cadastrado", verifique se o email realmente não existe:

```sql
-- Verificar se email existe na tabela auth.users
SELECT id, email, confirmed_at
FROM auth.users
WHERE email = 'SEU_EMAIL@exemplo.com';

-- Verificar se email existe na tabela public.users
SELECT id, email, name, role
FROM public.users
WHERE email = 'SEU_EMAIL@exemplo.com';
```

Se o email existir mas você não lembra da senha:
1. Vá para "/login"
2. Clique em "Esqueci a senha"
3. Digite seu email
4. Siga as instruções no email

## 🔍 Diagnóstico

O problema pode ser causado por:

1. **Políticas RLS incorretas** - O script corrige isso
2. **Trigger não configurado** - O script cria o trigger automaticamente
3. **Email realmente já existe** - Neste caso, use "Esqueci a senha"

## 📋 Checklist

- [ ] Executei o SQL no Supabase
- [ ] Verifiquei que as políticas foram criadas
- [ ] Verifiquei que o trigger existe
- [ ] Tentei criar uma conta nova
- [ ] Funcionou! 🎉

## 🎯 O que foi feito

1. ✅ Código atualizado para mostrar mensagens de erro específicas
2. ✅ Políticas RLS configuradas corretamente
3. ✅ Trigger criado para auto-criar usuários na tabela public.users
4. ✅ Função `handle_new_user` com SECURITY DEFINER

Agora o sistema deve permitir criar novos usuários normalmente!

