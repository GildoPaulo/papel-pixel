# 🎯 COMO FAZER LOGIN FUNCIONAR

## ⚠️ ATENÇÃO: Siga exatamente os passos na ordem!

---

## PASSO 1: DELETAR USUÁRIO ATUAL

1. Acesse: **https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/sql/new**
2. Cole e execute:

```sql
DELETE FROM auth.users WHERE email = 'teste@admin.com';
DELETE FROM public.users WHERE email = 'teste@admin.com';
```

✅ Pronto! Usuário deletado.

---

## PASSO 2: DESABILITAR VERIFICAÇÃO DE EMAIL

1. Acesse: **https://supabase.com/dashboard/project/leqyvitngubadvsyfzya/auth/providers**
2. Clique em **Email**
3. Procure **"Confirm email"**
4. **DESLIGUE** (deixe OFF) ❌
5. Clique em **Save**

✅ Pronto! Configuração corrigida.

---

## PASSO 3: CRIAR CONTA NOVA

1. Certifique-se que o frontend está rodando:
```bash
npm run dev
```

2. Acesse: **http://localhost:5173/register**
   (ou a porta que aparecer no terminal)

3. Preencha:
   - **Nome:** `Teste`
   - **Email:** `teste@admin.com`
   - **Senha:** `123456` (ou outra fácil)

4. Clique em **"Criar conta"**

✅ Deve criar sem pedir para verificar email!

---

## PASSO 4: FAZER LOGIN

1. Acesse: **http://localhost:5173/login**
2. Digite:
   - **Email:** `teste@admin.com`
   - **Senha:** `123456`
3. Clique em **"Entrar"**

✅ DEVE FUNCIONAR!

---

## 🔍 Se NÃO funcionar

### Verificar porta

Execute:
```bash
npm run dev
```

Veja qual porta aparece (exemplo: `http://localhost:5173`)

Use essa porta!

---

## 📝 LEMBRE-SE

- ✅ Frontend usa Supabase (não precisa de backend MySQL para login)
- ✅ Backend MySQL é só para produtos
- ✅ Login funciona só com frontend rodando

---

## ✅ LISTA DO QUE FAZER

1. Executar SQL para deletar usuário
2. Desabilitar "Confirm email" no Supabase
3. Criar conta nova pelo app
4. Fazer login

🎉 Pronto!

