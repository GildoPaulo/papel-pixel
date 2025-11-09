# 🔓 RESOLVER LOGIN - SOLUÇÃO DEFINITIVA

## 🎯 O QUE ESTÁ ACONTECENDO
O sistema usa **Supabase** para login (não precisa do backend MySQL rodando).

O problema é que o Supabase está exigindo verificação de email.

---

## ✅ SOLUÇÃO (2 Passos Simples)

### PASSO 1: DELETAR USUÁRIO ATUAL

1. Vá para: **https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/sql/new**
2. Cole este código:
```sql
DELETE FROM auth.users WHERE email = 'teste@admin.com';
DELETE FROM public.users WHERE email = 'teste@admin.com';
```
3. Clique em **RUN** ▶
4. Deve mostrar "Success"

---

### PASSO 2: DESABILITAR VERIFICAÇÃO DE EMAIL

1. Vá para: **https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/auth/providers**
2. Clique em **Email** (primeiro item)
3. Procure: **"Confirm email"**
4. **DESATIVE** (toggle OFF) ❌
5. Clique em **Save**

---

### PASSO 3: CRIAR CONTA NOVA

1. Vá para: **http://localhost:5173/register** (ou porta que estiver usando)
2. Preencha:
   - Nome: `Teste`
   - Email: `teste@admin.com`
   - Senha: `123456`
3. Clique em **Criar conta**
4. ✅ DEVE FUNCIONAR SEM PEDIR PARA VERIFICAR EMAIL!

---

### PASSO 4: FAZER LOGIN

1. Vá para: **http://localhost:5173/login**
2. Digite:
   - Email: `teste@admin.com`
   - Senha: `123456`
3. Clique em **Entrar**
4. ✅ DEVE FUNCIONAR!

---

## ❌ Se AINDA não funcionar

### Verificar se está na porta correta

Execute no terminal da pasta raiz:
```bash
npm run dev
```

Veja qual porta aparece (provavelmente 5173 ou 8080).

Use essa porta para acessar o app.

---

## 🔍 Verificar se Frontend está rodando

O frontend usa Supabase, então você só precisa:

1. Frontend rodando: `npm run dev`
2. **NÃO precisa** do backend MySQL rodando para login!

---

## 📝 IMPORTANTE

- O login usa **Supabase** (não MySQL)
- Backend MySQL é só para produtos/pedidos
- Para login, só precisa do frontend rodando

---

## ✅ Checklist

- [ ] Usuário antigo foi deletado no SQL
- [ ] "Confirm email" foi desativado no Supabase
- [ ] Criou conta nova pelo app
- [ ] Tentou fazer login
- [ ] Funcionou! ✅

