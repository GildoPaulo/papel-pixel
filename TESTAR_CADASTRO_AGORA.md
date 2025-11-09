# ✅ TESTAR CADASTRO AGORA

## 🎯 O QUE FOI CORRIGIDO

1. ✅ Adicionei **timeout de 15 segundos** - Não vai mais ficar travado
2. ✅ Mensagens de erro mais claras
3. ✅ Mostra erro se conexão não funcionar

---

## 📋 O QUE FAZER AGORA (Siga na Ordem!)

### PASSO 1: Deletar Usuário Antigo no Supabase

1. Abra: **https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/sql/new**
2. Cole este código:

```sql
DELETE FROM auth.users WHERE email = 'teste@admin.com';
DELETE FROM public.users WHERE email = 'teste@admin.com';
```

3. Clique em **RUN** ▶
4. Deve mostrar: "Success"

---

### PASSO 2: Verificar Configurações do Supabase (IMPORTANTE!)

1. Abra: **https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/auth/providers**
2. Clique em **Email** (primeiro item)
3. **Configure assim:**
   - ✅ **"Enable email provider"** = **ON**
   - ❌ **"Confirm email"** = **OFF** (desligado)
4. Clique em **Save**

---

### PASSO 3: Abrir o App

Se o app não estiver rodando, abra um terminal e execute:

```bash
cd C:\Users\Gildo Paulo Correia\Documents\pixel
npm run dev
```

Abra: **http://localhost:5173/register**

---

### PASSO 4: Tentar Criar Conta

1. Preencha o formulário:
   - **Nome:** `Teste Admin`
   - **Email:** `teste@admin.com`
   - **Senha:** `123456` (ou outra fácil)

2. Clique em **"Criar Conta"**

3. **O que deve acontecer:**
   - O botão muda para "Criando conta..."
   - Aparece mensagem de sucesso
   - Redireciona para a página inicial

4. **Se der erro:**
   - Mostra mensagem de erro específica
   - Não fica travado!

---

### PASSO 5: Fazer Login

1. Vá para: **http://localhost:5173/login**
2. Digite:
   - Email: `teste@admin.com`
   - Senha: `123456`
3. Clique em **"Entrar"**
4. ✅ DEVE FUNCIONAR!

---

## ⚠️ Se AINDA Não Funcionar

### Verificar Console do Navegador

1. Pressione **F12** (abrir DevTools)
2. Vá na aba **Console**
3. Veja se há erros em vermelho
4. Me envie uma screenshot dos erros

### Verificar se Frontend está conectando ao Supabase

Execute no console do navegador (F12):

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_KEY);
```

Deve mostrar a URL e KEY do Supabase.

---

## 📝 CHECKLIST

- [ ] Usuário antigo foi deletado
- [ ] "Confirm email" está desativado no Supabase
- [ ] Frontend está rodando
- [ ] Tentei criar conta
- [ ] Funcionou! ✅

---

## 🎉 Esperado

Após clicar em "Criar conta", deve aparecer:
- ✅ Mensagem de sucesso
- ✅ Redirecionar para home
- ✅ Conseguir fazer login

**OU** (se houver erro):
- ❌ Mensagem de erro específica
- ❌ Botão volta para "Criar Conta"
- ❌ Pode tentar novamente

**NÃO deve:**
- ❌ Ficar travado em "Criando conta..."
- ❌ Não mostrar nada

---

## 🚀 Pronto!

Agora teste criar a conta novamente!

