# 📱 INSTRUÇÕES PASSO A PASSO

## 🎯 ATENÇÃO: Siga cada passo exatamente como indicado!

---

## PASSO 1: Deletar Usuário Antigo

### 1.1. Acessar SQL Editor
Vá para: https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/sql/new

### 1.2. Cole Este Código:
```sql
DELETE FROM auth.users WHERE email = 'teste@admin.com';
DELETE FROM public.users WHERE email = 'teste@admin.com';
```

### 1.3. Executar
- Clique no botão **RUN** ▶
- Deve aparecer: "Success. No rows returned"

---

## PASSO 2: Corrigir Configurações do Supabase

### 2.1. Acessar Providers
Vá para: https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/auth/providers

### 2.2. Clicar em Email
- Clique no primeiro item: **Email**

### 2.3. Configurar Opções

**Encontre estas opções e configure:**

| Opção | Valor |
|-------|-------|
| Enable email provider | ✅ **ON** (ligado) |
| Confirm email | ❌ **OFF** (desligado) |
| Secure email change | Deixe como está |

### 2.4. Salvar
- Role até o final da página
- Clique no botão **Save** (verde)

---

## PASSO 3: Criar Conta Nova

### 3.1. Abrir App
Vá para: http://localhost:8080/register

### 3.2. Preencher Formulário
- **Nome:** `Teste Admin`
- **Email:** `teste@admin.com`
- **Senha:** `123456` (ou outra fácil)

### 3.3. Criar Conta
- Clique em **"Criar conta"**
- ✅ Não deve pedir para verificar email!

---

## PASSO 4: Fazer Login

### 4.1. Ir para Login
Vá para: http://localhost:8080/login

### 4.2. Preencher Credenciais
- **Email:** `teste@admin.com`
- **Senha:** `123456` (ou a senha que você definiu)

### 4.3. Entrar
- Clique em **"Entrar"**
- ✅ DEVE FUNCIONAR!

---

## ❌ Se NÃO Funcionar

### Verificar Servidor
Certifique-se que o servidor está rodando:

```bash
# No terminal, na pasta do projeto
npm run dev
```

### Verificar URL
O app deve abrir em: http://localhost:8080

---

## 🎉 Sucesso!

Se você conseguiu fazer login, está tudo funcionando! 🎉

