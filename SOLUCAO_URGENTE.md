# 🚨 SOLUÇÃO URGENTE: Invalid API Key

## O Problema

Você está recebendo: `Invalid API key`

Isso significa que a API key no código está incorreta.

## ✅ Solução Rápida (5 minutos)

### 1. Acesse o Dashboard do Supabase

Abra no seu navegador:
```
https://app.supabase.com/project/afgazlzpjqhumfbcxnea
```

### 2. Obtenha a API Key Correta

1. No menu esquerdo, clique em **Settings** (⚙️)
2. Clique em **API**
3. Procure por **anon/public key**
4. Copie a chave completa (ela começa com `eyJ...`)

### 3. Atualize o Código

Abra o arquivo: `src/config/supabase.ts`

Na linha 7, você verá algo como:
```typescript
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnemFsenBqcWh1bWZiY3huZWEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MTU4ODg4OCwiZXhwIjoyMDY3MTY0ODg4fQ.u4bPJJVWYKCFQVcZJTV5lW7c7YjzYiC8Z3RdQfB-pgw';
```

**Substitua** o conteúdo após `||` pela sua chave real do dashboard.

### 4. Recarregue o Navegador

1. Pressione **Ctrl+Shift+R** (ou **Cmd+Shift+R** no Mac)
2. Isso faz um hard reload limpo

### 5. Teste o Login

Tente fazer login novamente.

---

## 📋 Checklist

- [ ] Acessei o dashboard do Supabase
- [ ] Copiei a chave anon/public correta
- [ ] Atualizei o arquivo `src/config/supabase.ts`
- [ ] Salvei o arquivo
- [ ] Recarreguei o navegador com Ctrl+Shift+R
- [ ] Testei o login

---

## 🔗 Links Úteis

- Dashboard: https://app.supabase.com/project/afgazlzpjqhumfbcxnea
- Documentação: https://supabase.com/docs/guides/auth

---

## ❓ Se Ainda Não Funcionar

1. **Verifique se o projeto está ativo** no dashboard
2. **Verifique se copiou a chave correta** (deve começar com `eyJ...`)
3. **Limpe o cache**: Abra o console (F12) e execute:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

---

**Nota**: Nunca compartilhe sua `service_role` key publicamente. Use apenas a `anon` key no frontend.

