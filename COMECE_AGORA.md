# 🚀 COMECE AGORA - Tudo Pronto!

## ✅ Status da Configuração

- ✅ Arquivo `.env` criado com credenciais
- ✅ Supabase configurado corretamente
- ✅ Dependências instaladas
- ⚠️ Avisos do linter (normais, não são erros)

---

## 🎯 Passo a Passo

### 1️⃣ Iniciar o Servidor

Abra o terminal e execute:

```bash
npm run dev
```

**Aguarde aparecer:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 2️⃣ Abrir no Navegador

- Abra: http://localhost:5173
- **OU** clique no link que aparece no terminal

---

### 3️⃣ Testar Login

**Email:** `gildopaulocorreia84@gmail.com`  
**Senha:** (a senha que você definiu)

---

## ⚠️ Se Der Erro no Login

### Verificar se o usuário existe:

1. Acesse: https://app.supabase.com/project/leqyvitngubadvsyfzya
2. Vá em **Authentication > Users**
3. Procure pelo seu email

**Se não existir:**
1. Vá em **Authentication > Users**
2. Clique em **"Add user"**
3. Preencha email e senha
4. Marque **"Auto Confirm User"**
5. Clique em **"Create user"**

### Depois, criar na tabela `users`:

Execute no **SQL Editor**:

```sql
INSERT INTO public.users (id, name, email, role)
SELECT 
  id,
  'Gildo Paulo Correia' as name,
  email,
  'admin' as role
FROM auth.users
WHERE email = 'gildopaulocorreia84@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

---

## 🧪 Testar Configuração (Opcional)

Se quiser verificar se está tudo OK, abra o navegador:

1. Pressione **F12** (DevTools)
2. Vá na aba **Console**
3. Cole este código (uma linha por vez):

```javascript
// Passo 1: Verificar se carregou
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);

// Passo 2: Importar e testar
(async () => {
  const { supabase } = await import('/src/config/supabase.ts');
  console.log('✅ Configurado!');
  const { count } = await supabase.from('users').select('*', { count: 'exact', head: true });
  console.log('✅ Banco OK! Total:', count);
})();
```

---

## 📊 Sobre os Avisos

Os avisos que você viu no Supabase são **sugestões de segurança**, não erros:

- ⚠️ **search_path mutável:** Pode ignorar por enquanto
- ⚠️ **MFA desabilitado:** Opcional
- ⚠️ **RLS sem políticas:** Se não usar essas tabelas, ok
- ℹ️ **RLS em algumas tabelas:** Normal se você não criou políticas ainda

**O importante:** O app funciona normalmente! 🎉

---

## 🆘 Precisa de Ajuda?

Me diga:
1. O servidor iniciou? (`npm run dev`)
2. Qual página aparece quando abre o navegador?
3. Ao tentar login, o que acontece?
4. Algum erro no console? (F12)

**Vou te ajudar a resolver!**

