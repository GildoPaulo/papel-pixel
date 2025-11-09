# 🛒 SISTEMA DE PEDIDOS - INSTRUÇÕES

## 🎯 O QUE FOI CRIADO

### 1. ✅ SQL - Tabelas
**Arquivo:** `CREATE_TABLE_ORDERS.sql`

**Tabelas criadas:**
- `orders` - Pedidos principais
- `order_items` - Itens de cada pedido

**Campos importantes:**
- Status: pending, confirmed, processing, shipped, delivered, cancelled
- Total do pedido
- Informações do cliente
- Endereço de entrega

### 2. ✅ Backend - API
**Arquivo:** `backend/routes/orders.js`

**Rotas implementadas:**
- `GET /api/orders` - Listar todos pedidos
- `GET /api/orders/:id` - Buscar pedido por ID
- `GET /api/orders/user/:userId` - Pedidos de um usuário
- `POST /api/orders` - Criar pedido (faz checkout)
- `PATCH /api/orders/:id` - Atualizar status
- `DELETE /api/orders/:id` - Cancelar pedido (restaura estoque)

---

## 📋 PRÓXIMOS PASSOS

### PASSO 1: Criar tabelas no banco

**Execute este SQL no PHPMyAdmin:**
```sql
-- Copie e cole o conteúdo de CREATE_TABLE_ORDERS.sql
```

Ou pelo terminal:
```bash
mysql -u root -p papel_pixel < CREATE_TABLE_ORDERS.sql
```

### PASSO 2: Testar backend

**Inicie o backend:**
```bash
cd backend
npm start
```

**Teste a API:**
```bash
curl http://localhost:3001/api/orders
```

### PASSO 3: Criar Context para Pedidos

Vou criar `src/contexts/OrdersContext.tsx` para gerenciar pedidos no frontend.

### PASSO 4: Atualizar Admin

Vou criar interface no Admin.tsx para:
- Listar pedidos
- Ver detalhes
- Atualizar status
- Cancelar pedidos

### PASSO 5: Atualizar Checkout

Vou atualizar Checkout.tsx para finalizar pedidos de verdade.

---

## ✅ PRÓXIMO MENSAGEM

Depois de executar o SQL, me avise que continuo com a implementação!



