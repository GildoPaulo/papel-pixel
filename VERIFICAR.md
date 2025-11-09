# 🔍 Como Verificar - 3 Passos Simples

## ✅ Passo 1: Teste no Console do Navegador

1. Abra o app (pressione **F12**)
2. Cole no Console e pressione ENTER:

```javascript
import('/src/config/supabase.ts').then(({ supabase }) => {
  console.log('✅ Supabase configurado!');
  console.log('URL:', supabase.supabaseUrl);
  
  // Testar conexão
  supabase.from('users').select('count').single().then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro:', error.message);
    } else {
      console.log('✅ Banco conectado!');
    }
  });
});
```

**Me mostre o que aparece!**

---

## ✅ Passo 2: Verificar no Dashboard

Acesse: https://app.supabase.com/project/leqyvitngubadvsyfzya

**Execute este SQL:**

```sql
SELECT id, email, role FROM users;
SELECT id, name, price FROM products;
```

**Me mostre o resultado!**

---

## ✅ Passo 3: Verificar Variáveis

No arquivo `src/config/supabase.ts` (linha 3-4), você deve ter:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://leqyvitngubadvsyfzya.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOi...';
```

✅ **Está assim?** Se sim, a configuração está OK!

---

## 🎯 Me Envie:

1. Resultado do Passo 1 (console)
2. Resultado do Passo 2 (SQL)
3. Se tem arquivo `.env` na raiz do projeto

Assim vejo exatamente o que precisa ser ajustado!

