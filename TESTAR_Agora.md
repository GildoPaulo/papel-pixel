# ✅ Servidor Funcionando! Agora Vamos Testar

Você está recebendo:
```json
{
  "message": "Papel & Pixel Backend API is running! 🚀",
  "version": "1.0.0",
  "endpoints": {...}
}
```

## 🧪 Testes Prontos para Copiar e Colar

### 1️⃣ Teste: Registrar Usuário

```bash
curl -X POST http://localhost:3001/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"João Silva\",\"email\":\"joao@teste.com\",\"password\":\"123456\"}"
```

**Ou no PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"João Silva","email":"joao@teste.com","password":"123456"}'
```

---

### 2️⃣ Teste: Fazer Login

```bash
curl -X POST http://localhost:3001/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"joao@teste.com\",\"password\":\"123456\"}"
```

**Esperado:**
```json
{
  "user": {...},
  "token": "eyJhbGc..."
}
```

**⚠️ GUARDE O TOKEN! Vai precisar para outros testes.**

---

### 3️⃣ Teste: Buscar Produtos

```bash
curl http://localhost:3001/api/products
```

---

### 4️⃣ Teste: Criar Produto (Admin)

```bash
curl -X POST http://localhost:3001/api/products ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN_AQUI" ^
  -d "{\"name\":\"Livro Teste\",\"category\":\"livros\",\"price\":150,\"description\":\"Descrição\",\"image\":\"https://via.placeholder.com/300\",\"stock\":10}"
```

---

### 5️⃣ Teste: Buscar Categorias

```bash
curl http://localhost:3001/api/products/categories
```

---

### 6️⃣ Teste: Criar Pedido

```bash
curl -X POST http://localhost:3001/api/orders ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer SEU_TOKEN_AQUI" ^
  -d "{\"items\":[{\"id\":1,\"quantity\":2,\"price\":150}],\"total\":300,\"shippingInfo\":{\"name\":\"João\",\"email\":\"joao@teste.com\",\"phone\":\"+258841234567\",\"address\":\"Rua Principal\",\"city\":\"Beira\",\"province\":\"Sofala\"},\"paymentMethod\":\"cash\"}"
```

---

### 7️⃣ Teste: Buscar Notificações

```bash
curl http://localhost:3001/api/notifications ^
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### 8️⃣ Teste: Aplicar Cupom

```bash
curl -X POST http://localhost:3001/api/coupons/apply ^
  -H "Content-Type: application/json" ^
  -d "{\"code\":\"PROMO10\",\"total\":1000}"
```

---

## 🎯 Testes Rápidos no Navegador

Abra no navegador:
- http://localhost:3001
- http://localhost:3001/api/products
- http://localhost:3001/api/products/categories

---

## ✅ Verificar no Banco de Dados

No phpMyAdmin:
```sql
-- Ver usuários
SELECT * FROM users;

-- Ver produtos
SELECT * FROM products;

-- Ver pedidos
SELECT * FROM orders;

-- Ver notificações
SELECT * FROM notifications;
```

---

## 📚 Mais Testes

Veja `TESTE_COMPLETO_BACKEND.md` para todos os testes disponíveis!

