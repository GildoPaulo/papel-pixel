# ✅ SOLUÇÃO SIMPLES PARA LOGIN

## 🎯 O Que Fazer (Siga na Ordem)

### 1️⃣ DELETAR USUÁRIO ATUAL

**No Supabase SQL Editor:**
```
DELETE FROM auth.users WHERE email = 'teste@admin.com';
DELETE FROM public.users WHERE email = 'teste@admin.com';
```
Clique em RUN ✅

---

### 2️⃣ VERIFICAR CONFIGURAÇÕES DO SUPABASE

Vá para: https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/auth/providers

**Clique em "Email"** (primeiro item)

**Desative estas opções:**
- ❌ **Confirm email** (deixe desligado)
- ❌ **Enable email confirmations** (se existir, desligue)

**Certifique-se que está ATIVO:**
- ✅ **Enable email provider** (deve estar ligado)

**Clique em "Save"** (botão verde)

---

### 3️⃣ CRIAR USUÁRIO NOVO

1. Vá para: http://localhost:8080/register
2. Preencha:
   - Nome: `Teste Admin`
   - Email: `teste@admin.com`
   - Senha: `123456` (ou outra fácil de lembrar)
3. Clique em **"Criar conta"**
4. ✅ Não deve pedir para verificar email!

---

### 4️⃣ FAZER LOGIN

1. Vá para: http://localhost:8080/login
2. Digite:
   - Email: `teste@admin.com`
   - Senha: `123456` (ou a senha que você definiu)
3. Clique em **"Entrar"**
4. ✅ DEVE FUNCIONAR!

---

## 🔍 Se Ainda Não Funcionar

### Verificar se Frontend está rodando
```bash
cd C:\Users\Gildo Paulo Correia\Documents\pixel
npm run dev
```

### Verificar se Backend está rodando
```bash
cd backend
npm start
```

---

## 📱 Informações Importantes

**Senha que você deve usar:** A senha que você definir no passo 3!

**Não use "Esqueci a senha"** porque está desabilitado.

**Apenas crie a conta nova** e faça login!

