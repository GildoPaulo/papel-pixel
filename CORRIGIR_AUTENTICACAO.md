# 🔧 Corrigir Erro de Autenticação

## ❌ Erro: "Rota não encontrada /api/auth/register"

### Causa: Dependências não instaladas

O servidor está tentando usar middlewares que não foram instalados.

## ✅ Solução Rápida

### Passo 1: Instalar Dependências

```bash
cd backend
npm install
```

Isso vai instalar:
- multer
- nodemailer
- express-rate-limit
- helmet
- morgan
- compression
- winston

### Passo 2: Reiniciar Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### Passo 3: Testar

```bash
curl http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'
```

---

## 🚀 Alternativa: Modo Simplificado (Se npm install falhar)

Se houver problemas, temporariamente remova os middlewares avançados:

### Editar `backend/server.js`

Comentar as linhas 5 e 12:

```javascript
// const { securityMiddleware, apiLimiter, authLimiter } = require('./middleware/security');

// Security Middleware
// app.use(...securityMiddleware);
```

E alterar linha 69:

```javascript
app.use('/api/auth', authRoutes); // Remover authLimiter temporariamente
```

---

## ✅ Verificar se Funcionou

Teste no navegador ou curl:

```bash
curl http://localhost:3001
```

Deve retornar:
```json
{
  "message": "Papel & Pixel Backend API is running! 🚀",
  "version": "1.0.0"
}
```

---

## 📊 Status Esperado

Após npm install, você deve ver:

```
added 200+ packages
```

E ao iniciar o servidor:

```
🚀 ========================================
   Papel & Pixel Backend API
   Server running on http://localhost:3001
   Environment: development
========================================
```

---

## 🎯 Próximo Passo

Depois que funcionar:

```bash
# Testar registro
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@teste.com","password":"123456"}'
```

