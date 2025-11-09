# 🛒 SISTEMA DE PEDIDOS - PASSO A PASSO

## ✅ PASSO 1: CRIAR TABELAS (EXECUTAR AGORA!)

### No PHPMyAdmin:
1. Abra: http://localhost/phpmyadmin
2. Selecione: banco `papel_pixel`
3. Vá em: aba **SQL**
4. Cole e execute:
```sql
-- Criar tabela de pedidos (orders)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  billing_address TEXT,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar tabela de itens do pedido (order_items)
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

5. Clique: **Executar**
6. Verifique se apareceu: **Tabelas orders e order_items criadas!**

---

## ✅ PASSO 2: RESTART BACKEND

### No terminal, pare e inicie o backend:
```bash
cd backend
# Ctrl+C para parar
npm start
```

---

## ✅ PASSO 3: CONTINUE A IMPLEMENTAÇÃO

Depois de executar o SQL, me avise que continuo criando:
- ✅ Context para pedidos
- ✅ Interface no Admin
- ✅ Checkout funcional

---

## 📊 O QUE JÁ FOI FEITO

✅ Backend routes (`backend/routes/orders.js`)  
✅ SQL para criar tabelas (`CREATE_TABLE_ORDERS.sql`)  
⏳ **Aguardando:** Executar SQL no banco

---

## 🚀 EXECUTE O SQL AGORA E ME AVISE!





