# 📊 CRA vs Vite - Qual Você Está Usando?

## ❌ O Que o Vídeo Mostra (Create React App)

```javascript
// supabaseClient.js (CRA)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)
export default supabase
```

**Variáveis de ambiente:**
- `.env` → `REACT_APP_SUPABASE_URL=...`
- `.env` → `REACT_APP_ANON_KEY=...`

## ✅ O Que SEU Projeto Tem (Vite - Correto!)

```typescript
// src/config/supabase.ts (Vite)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://...'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJ...'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { /* configurações corretas */ }
});
```

**Variáveis de ambiente:**
- `.env` → `VITE_SUPABASE_URL=...`
- `.env` → `VITE_SUPABASE_KEY=...`

## 🔍 Como Saber Qual Está Usando?

Olhe seu `package.json`:

```json
{
  "name": "vite_react_shadcn_ts",  ← Diz "vite"!
  "scripts": {
    "dev": "vite",                 ← Diz "vite"!
  }
}
```

**SEU PROJETO É VITE!** ✅

## 🎯 Conclusão

❌ **NÃO** copie o código do vídeo (é de CRA)  
✅ **USE** o código que já tem (está correto para Vite)  
⚠️ **Execute o SQL** para criar o usuário no banco  

## 📝 O Real Problema

O erro "Credenciais inválidas" **NÃO** é por causa do código!

É porque:
- ✅ Usuário existe em `auth.users` 
- ❌ Usuário **NÃO** existe em `public.users`

**Execute o SQL:** `FAZER_ISSO_AGORA.md` 🔐

