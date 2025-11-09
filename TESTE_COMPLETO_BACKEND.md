# 🧪 Guia Completo de Testes - Backend Papel & Pixel

## 📋 Checklist de Testes

### 1. Preparação Inicial

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Verificar configuração
cat .env

# 3. Criar/atualizar banco de dados
mysql -u root -p
CREATE DATABASE IF NOT EXISTS papel_pixel;
USE papel_pixel;
source sql/schema.sql;

# 4. Iniciar servidor
npm run dev
```

**✅ Esperado:** Servidor rodando em `http://localhost:3001`

---

## 🧪 Testes por Funcionalidade

### 1. Teste: API Principal

```bash
curl http://localhost:3001
```

**✅ Esperado:**
```json
{
  "message": "Papel & Pixel Backend API is running! 🚀",
  "version": "1.0.0",
  "endpoints": {...}
}
```

---

### 2. Teste: Autenticação

#### Registrar Usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@teste.com",
    "password": "senha123"
  }'
```

**✅ Esperado:**
```json
{
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@teste.com"
  }
}
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "senha123"
  }'
```

**✅ Esperado:**
```json
{
  "token": "eyJhbGc...",
  "user": {...}
}
```

**💾 Salvar o TOKEN:**
```bash
export TOKEN="seu-token-aqui"
```

---

### 3. Teste: Produtos

#### Listar Produtos
```bash
curl http://localhost:3001/api/products
```

**✅ Esperado:** Lista de produtos

#### Buscar com Filtros
```bash
curl "http://localhost:3001/api/products?category=livros&minPrice=100&maxPrice=500"
```

**✅ Esperado:** Produtos filtrados

#### Criar Produto (Admin)
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Livro Teste",
    "category": "livros",
    "price": 150,
    "description": "Descrição do livro",
    "image": "https://via.placeholder.com/300",
    "stock": 10
  }'
```

**✅ Esperado:** Produto criado com ID

---

### 4. Teste: Carrinho e Pedidos

#### Criar Pedido
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "price": 150
      }
    ],
    "total": 300,
    "shippingInfo": {
      "name": "João Silva",
      "email": "joao@teste.com",
      "phone": "+258841234567",
      "address": "Rua Principal, 123",
      "city": "Beira",
      "province": "Sofala"
    },
    "paymentMethod": "cash"
  }'
```

**✅ Esperado:** Pedido criado com ID e status "pending"

#### Buscar Pedidos do Usuário
```bash
curl http://localhost:3001/api/orders/user/1 \
  -H "Authorization: Bearer $TOKEN"
```

**✅ Esperado:** Lista de pedidos do usuário

---

### 5. Teste: Pagamentos

#### Criar Pagamento PayPal
```bash
curl -X POST http://localhost:3001/api/payments/paypal/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 300,
    "items": [{"id": 1, "quantity": 2, "price": 150}],
    "userId": 1,
    "shippingInfo": {
      "name": "João Silva",
      "email": "joao@teste.com"
    }
  }'
```

**✅ Esperado:** Transaction ID gerado

#### Criar Pagamento M-Pesa
```bash
curl -X POST http://localhost:3001/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 300,
    "phone": "+258841234567",
    "items": [{"id": 1, "quantity": 2, "price": 150}],
    "userId": 1,
    "shippingInfo": {...}
  }'
```

**✅ Esperado:** Instruções de pagamento M-Pesa

---

### 6. Teste: Avaliações

#### Criar Avaliação
```bash
curl -X POST http://localhost:3001/api/reviews/product/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "rating": 5,
    "comment": "Excelente produto!"
  }'
```

**✅ Esperado:** Avaliação criada

#### Buscar Avaliações de um Produto
```bash
curl http://localhost:3001/api/reviews/product/1
```

**✅ Esperado:** Lista de avaliações com média

---

### 7. Teste: Cupons

#### Criar Cupom (Admin)
```bash
curl -X POST http://localhost:3001/api/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "code": "PROMO10",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_purchase": 500,
    "max_discount": 100,
    "active": true
  }'
```

**✅ Esperado:** Cupom criado

#### Aplicar Cupom
```bash
curl -X POST http://localhost:3001/api/coupons/apply \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROMO10",
    "total": 1000
  }'
```

**✅ Esperado:** Desconto calculado (100 MZN)

---

### 8. Teste: Notificações

#### Buscar Notificações
```bash
curl http://localhost:3001/api/notifications \
  -H "Authorization: Bearer $TOKEN"
```

**✅ Esperado:** Lista de notificações

#### Marcar como Lida
```bash
curl -X PUT http://localhost:3001/api/notifications/1/read \
  -H "Authorization: Bearer $TOKEN"
```

**✅ Esperado:** `{"message": "Notificação marcada como lida"}`

---

### 9. Teste: Estatísticas (Admin)

#### Dashboard
```bash
curl http://localhost:3001/api/stats/dashboard \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

**✅ Esperado:** Estatísticas completas

---

### 10. Teste: Rate Limiting

#### Tentar Muitas Requisições
```bash
for i in {1..105}; do curl http://localhost:3001/api/products; done
```

**✅ Esperado:** Após 100 requisições, retorna erro 429

---

## 🧪 Testes com Postman

### Importar Collection

1. Abrir Postman
2. File → Import
3. Criar nova collection:
   ```
   Papel & Pixel API
   - Auth
   - Products
   - Orders
   - Payments
   - Reviews
   - Coupons
   - Notifications
   - Stats
   ```

---

## 📊 Verificar no Banco de Dados

```sql
USE papel_pixel;

-- Ver usuários
SELECT * FROM users;

-- Ver produtos
SELECT * FROM products;

-- Ver pedidos
SELECT * FROM orders;

-- Ver pagamentos
SELECT * FROM payments;

-- Ver avaliações
SELECT * FROM reviews;

-- Ver cupons
SELECT * FROM coupons;

-- Ver notificações
SELECT * FROM notifications;
```

---

## ✅ Checklist Final

- [ ] Servidor iniciado sem erros
- [ ] Registro de usuário funciona
- [ ] Login retorna token
- [ ] Criar produto funciona
- [ ] Criar pedido funciona
- [ ] Pagamentos são criados
- [ ] Avaliações podem ser criadas
- [ ] Cupons funcionam
- [ ] Notificações são criadas
- [ ] Rate limiting está ativo
- [ ] Logs aparecem no console
- [ ] Banco de dados é atualizado

---

## 🚨 Resolver Problemas

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Access denied"
```bash
# Verificar credenciais do MySQL em .env
```

### Erro: "Port already in use"
```bash
# Mudar porta no .env
PORT=3002
```

### Token inválido
```bash
# Fazer login novamente e atualizar TOKEN
```

---

## 📚 Documentação

- API Completa: `backend/API_DOCUMENTATION.md`
- Funcionalidades: `NOVAS_FUNCIONALIDADES.md`
- Backend Resumo: `BACKEND_COMPLETO_RESUMO.md`

---

## 🎯 Próximo: Testar Frontend

Após testar o backend, vá para testar o frontend com as integrações!

