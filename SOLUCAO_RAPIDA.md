# 🚀 Solução Rápida para Login e Admin

## ❌ Problema
- Login fica travando em "Entrando..."
- Supabase envia link de confirmação por email
- Nome não aparece no aplicativo

## ✅ Solução Passo a Passo

### 1. Desabilitar Confirmação de Email no Supabase

1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Policies**
3. Desabilite **"Enable email confirmations"**
4. Ou vá em **Configuration** e desmarque essa opção

### 2. Criar Usuários Manualmente

Execute este SQL no **SQL Editor** do Supabase:

```sql
-- Criar seu usuário normal
INSERT INTO users (id, name, email, role)
VALUES (
  '618fed49-6fc4-448f-8b95-e106f4fc1569',
  'Gildo Paulo Correia',
  'gildopaulocorreia84@gmail.com',
  'user'
)
ON CONFLICT (id) DO NOTHING;

-- Criar usuário ADMIN
INSERT INTO users (id, name, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Administrador Papel & Pixel',
  'admin@papelpixel.co.mz',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Ver usuários criados
SELECT * FROM users;
```

### 3. Limpar Dados Locais do Navegador

Pressione **F12** → Console → Cole e execute:

```javascript
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### 4. Testar Login

1. Recarregue a página (Ctrl + Shift + R)
2. Faça login com: `gildopaulocorreia84@gmail.com` e sua senha
3. O login deve funcionar agora!

---

## 🔐 Acessar Painel Admin

Para acessar o painel admin, você precisa fazer login com o usuário admin criado acima.

### Opção 1: Usar Email Admin
Crie uma conta/faça login com: `admin@papelpixel.co.mz` e defina uma senha.

### Opção 2: Marcar seu Usuário como Admin
Execute no SQL:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'gildopaulocorreia84@gmail.com';
```

Depois faça logout e login novamente.

---

## ✅ Testar

1. Faça logout
2. Faça login
3. Verifique se o nome aparece no menu
4. Acesse "Painel Admin" no menu do usuário

---

## 🎯 Próximos Passos

- [ ] Desabilitar confirmação de email no Supabase
- [ ] Executar SQL para criar usuários
- [ ] Limpar dados do navegador
- [ ] Testar login
- [ ] Acessar painel admin
- [ ] Adicionar produtos!

**Pronto! Agora deve funcionar! 🎉**










