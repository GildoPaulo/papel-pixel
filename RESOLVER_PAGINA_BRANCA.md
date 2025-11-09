# 🔧 RESOLVER PÁGINA BRANCA

## 🎯 O PROBLEMA

Página aparece em branco com `[]` ao acessar http://localhost:8080

---

## ⚠️ CAUSA

O arquivo `.env` está com o formato **REACT_APP_** mas você está usando **Vite**, que usa **VITE_**.

---

## ✅ SOLUÇÃO

### PASSO 1: Criar/Atualizar `.env`

Crie o arquivo `.env` na **raiz do projeto** (mesmo nível que `package.json`):

```env
# Supabase
VITE_SUPABASE_URL=https://leqyvitngubadvsyfzya.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlcXl2aXRuZ3ViYWR2c3lmenlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1Nzc2MTksImV4cCI6MjA3NzE1MzYxOX0.eLs15AWrJCjQK-iTnifRG6EoVQ-1KRTEdCx2M0Bpu7Y

# Backend API (MySQL)
VITE_API_URL=http://localhost:3001/api
```

**IMPORTANTE:** Prefira **VITE_** em vez de **REACT_APP_**

---

### PASSO 2: Verificar Nome do Arquivo

Certifique-se de que o arquivo se chama exatamente `.env` (não `.env.local`, `.env.development`, etc)

---

### PASSO 3: Parar e Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C)

# Reinicie
npm run dev
```

**OU se usar Vite diretamente:**

```bash
npm run dev -- --host
```

---

### PASSO 4: Verificar Console do Navegador

Pressione **F12** → **Console**

Procure por erros em vermelho.

---

### PASSO 5: Limpar Cache

No console do navegador (F12), execute:

```javascript
localStorage.clear();
location.reload();
```

---

## 🔍 SE AINDA NÃO FUNCIONAR

### Verificar se Frontend Está Rodando

```bash
# Terminal 1 - Frontend
npm run dev

# Deve mostrar: VITE ready in XXX ms
```

### Verificar se Backend Está Rodando

```bash
# Terminal 2 - Backend
cd backend
npm start

# Deve mostrar: Server running on http://localhost:3001
```

---

## 🧪 TESTAR

1. Abra: http://localhost:8080
2. Deve mostrar a página inicial
3. ✅ Se aparecer "Papel & Pixel", funcionou!

---

## ⚙️ VERIFICAÇÃO RÁPIDA

Execute no console do navegador (F12):

```javascript
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_KEY:', import.meta.env.VITE_SUPABASE_KEY ? 'Definida' : 'NÃO DEFINIDA');
```

Deve mostrar:
- URL: `https://leqyvitngubadvsyfzya.supabase.co`
- Key: `Definida`

---

## 🎯 SE PÁGINA AINDA ESTIVER BRANCA

Pode ser erro JavaScript. Veja o **Console** (F12) e me envie a mensagem de erro.

Possíveis causas:
- Erro de sintaxe
- Import/export incorreto
- Dependência faltando
- React não encontrando componentes

---

## 📝 RESUMO

1. ✅ Arquivo `.env` criado com VITE_ (não REACT_APP_)
2. ✅ Servidor parado e reiniciado
3. ✅ Cache limpo
4. ✅ Console verificado

**Faça isso e deve funcionar!** 🚀

