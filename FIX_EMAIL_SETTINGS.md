# 📧 Configurar Emails no Supabase

## ❌ Problema
Não está recebendo emails de recuperação de senha.

## ✅ Solução Rápida

### Passo 1: Habilitar Novos Usuários
1. Acesse: **Authentication** → **Sign In / Providers**
2. Encontre a seção **"User Signups"**
3. Ative o toggle: **"Allow new users to sign up"** ✅
4. Clique em **"Save changes"** (botão verde no canto)

### Passo 2: Verificar Configurações de Email
1. No menu lateral, clique em **"Emails"**
2. Verifique as seguintes configurações:
   - **Email Templates**: Estão todos ativados?
   - **SMTP Settings**: Está configurado?
   
### Passo 3: Desabilitar Confirmação de Email (RECOMENDADO)
Para não precisar clicar em links:
1. Em **"User Signups"**
2. Desative: **"Confirm email"** ❌
3. Clique em **"Save changes"**

---

## 🔄 Agora Teste

### Recuperação de Senha
1. No app, clique em **"Esqueci a senha"**
2. Digite seu email
3. Verifique sua caixa de entrada
4. O email deve chegar em alguns segundos

### Novos Usuários
1. Agora pode registrar novos usuários normalmente
2. Sem precisar confirmar email

---

## 📧 Se AINDA não receber emails

### Verificar Spam
- Verifique a pasta de SPAM no Gmail
- Procure por emails de noreply@supabase.co

### Configurar Email Customizado (Opcional)
1. Vá em **Authentication** → **Emails**
2. Configure SMTP customizado (se quiser usar seu próprio email)

---

**🎉 Agora deve funcionar!**










