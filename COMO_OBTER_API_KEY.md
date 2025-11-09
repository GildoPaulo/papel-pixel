# 🔑 Como Obter as Credenciais do Supabase

## ⚠️ Problema Atual

Você está recebendo o erro: `Invalid API key`

Isso acontece porque a API key no código está incorreta ou expirada.

## ✅ Solução: Obter as Credenciais Corretas

### Passo 1: Acessar o Dashboard do Supabase

1. Vá para: https://app.supabase.com
2. Faça login com sua conta
3. Selecione o projeto: `afgazlzpjqhumfbcxnea`

### Passo 2: Copiar as Credenciais

1. No menu lateral, clique em **Settings** (Configurações)
2. Clique em **API**
3. Copie as seguintes informações:

#### Project URL
```
https://afgazlzpjqhumfbcxnea.supabase.co
```

#### anon/public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(Esta é a chave que começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

⚠️ **IMPORTANTE**: Use a chave **anon key** (não a service_role key)

### Passo 3: Atualizar o Código

Substitua a linha 7 do arquivo `src/config/supabase.ts`:

**ANTES:**
```typescript
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnemFsenBqcWh1bWZiY3huZWEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MTU4ODg4OCwiZXhwIjoyMDY3MTY0ODg4fQ.u4bPJJVWYKCFQVcZJTV5lW7c7YjzYiC8Z3RdQfB-pgw';
```

**DEPOIS (substitua com sua chave real):**
```typescript
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'SUA_CHAVE_AQUI';
```

### Passo 4: Recarregar a Aplicação

1. Salve o arquivo
2. Recarregue o navegador (Ctrl+Shift+R ou F5)
3. Tente fazer login novamente

## 📸 Visual do Dashboard

Quando você acessar Settings > API, verá algo assim:

```
API Settings
├── Project URL: https://xxxxxxxxxxxxx.supabase.co
├── anon/public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (copie esta!)
└── service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (NÃO copie esta!)
```

## 🔍 Alternativa: Usar Variáveis de Ambiente

Se preferir não hardcodar no código, crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://afgazlzpjqhumfbcxnea.supabase.co
VITE_SUPABASE_KEY=sua-anon-key-aqui
```

## ⚠️ Possíveis Problemas

### 1. Projeto Suspenso

Se o projeto Supabase estiver suspenso (paused):
- Acesse: https://app.supabase.com/project/afgazlzpjqhumfbcxnea
- Clique em "Resume" ou "Reactivate"

### 2. API Key Expirada

Se a chave expirou, você precisa:
- Gerar uma nova chave no dashboard
- Atualizar o código

### 3. Políticas RLS Ajustadas

Verifique se as políticas RLS (Row Level Security) estão ajustadas corretamente para permitir acesso.

## 📞 Precisa de Ajuda?

Se o problema persistir:
1. Verifique o projeto no dashboard
2. Confirme que o projeto está ativo
3. Verifique os logs em Settings > Logs
4. Consulte a documentação: https://supabase.com/docs

