# 🔍 Diagnóstico: "Rota não encontrada" em Produtos

## ⚠️ Problema

Ao editar ou deletar produto, aparece:
- ❌ "Erro ao salvar produto: Rota não encontrada"
- ❌ "Erro ao remover produto: Rota não encontrada"

## 🔎 Checklist de Verificação

### **1. Backend está rodando?**

Abra um terminal e execute:
```bash
cd backend
npm run dev
```

Você deve ver:
```
🚀 ========================================
   Papel & Pixel Backend API
   Server running on http://localhost:3001
   ✅ Database connected successfully
========================================
```

**Se não aparecer isso, o backend NÃO está rodando!**

---

### **2. Verificar URL da API no Frontend**

No navegador, abra o Console (F12 → Console) e digite:
```javascript
import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
```

Deve retornar: `"http://localhost:3001/api"`

---

### **3. Testar Rotas Manualmente**

Abra o navegador e teste:
1. **Listar produtos:** `http://localhost:3001/api/products`
   - Deve retornar JSON com array de produtos

2. **Testar autenticação:**
   - Faça login no site
   - No console: `localStorage.getItem('token')`
   - Deve retornar um token

---

### **4. Verificar Rotas no Backend**

As rotas devem estar nesta ordem no `backend/routes/products.js`:

```javascript
// 1. Rotas específicas PRIMEIRO
router.get('/categories', ...)

// 2. Rota raiz
router.get('/', ...)

// 3. Rotas com autenticação
router.post('/', authenticate, isAdmin, ...)
router.put('/:id', authenticate, isAdmin, ...)
router.delete('/:id', authenticate, isAdmin, ...)

// 4. Rotas com parâmetro por ÚLTIMO
router.get('/:id', ...)
```

---

### **5. Testar Requisição Direta**

No console do navegador (após fazer login):
```javascript
// Pegar token
const token = localStorage.getItem('token');

// Testar PUT (editar)
fetch('http://localhost:3001/api/products/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Teste',
    category: 'Papelaria',
    price: 10,
    stock: 100
  })
}).then(r => r.json()).then(console.log);

// Testar DELETE
fetch('http://localhost:3001/api/products/1', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(console.log);
```

**Se der erro 404, a rota não está registrada!**

---

## 🛠️ Soluções

### **Solução 1: Backend não está rodando**

```bash
# Terminal 1
cd backend
npm run dev
```

**Verifique se aparece:**
```
Server running on http://localhost:3001
Database connected successfully
```

### **Solução 2: CORS ou Porta errada**

Verifique `backend/server.js` linha 16:
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:8080'
```

Verifique `src/config/api.ts`:
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

### **Solução 3: Token inválido**

Faça logout e login novamente.

No console:
```javascript
localStorage.clear();
// Depois faça login de novo
```

---

## 📊 Logs Esperados

**Backend deve mostrar:**
```
📝 [UPDATE PRODUCT] ID: 123
📝 [UPDATE PRODUCT] User: { id: 1, email: 'admin@...', role: 'admin' }
✅ [UPDATE PRODUCT] Produto atualizado: 123
```

Ou:
```
🗑️ [DELETE PRODUCT] ID: 123
🗑️ [DELETE PRODUCT] User: { id: 1, email: 'admin@...', role: 'admin' }
✅ [DELETE PRODUCT] Produto deletado do banco: 123
```

**Se não aparecer NENHUM log, a requisição não está chegando no backend!**

---

## 🎯 Próximo Passo

Execute o script de teste e me informe:
1. ✅ Backend está rodando?
2. ✅ URL da API está correta?
3. ✅ Token está sendo enviado?
4. ✅ Logs aparecem no backend?

