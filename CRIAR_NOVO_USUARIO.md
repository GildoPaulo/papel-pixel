# Criar Novo Usuário e Tornar Admin

## Criar nova conta no App

1. **Não faça login** (ou faça logout primeiro)
2. Clique em **"Criar conta"**
3. Preencha:
   - Nome: Seu Nome
   - Email: `seu@email.com` (use outro email se quiser)
   - Senha: `123456` (ou outra senha que você lembrará)
4. Clique em **"Criar conta"**
5. Efetue login

## Tornar Admin

Execute este SQL no Supabase (substitua o email):

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu@email.com';
```

## Pronto!

Agora você pode:
- ✅ Acessar "Painel Admin" no menu
- ✅ Adicionar produtos
- ✅ Gerenciar a loja










