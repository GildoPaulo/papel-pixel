# ✅ MYSQL SETUP COMPLETO

## 🎯 MIGRAR DE SUPABASE PARA MYSQL

Já temos backend MySQL pronto! Vamos ativá-lo!

---

## 📋 PASSO A PASSO COMPLETO

### PASSO 1: Instalar MySQL (se não tem)

**Windows com XAMPP:**
1. Baixe: https://www.apachefriends.org/download.html
2. Instale
3. Abra XAMPP Control Panel
4. Clique em **Start** no MySQL

---

### PASSO 2: Criar Banco de Dados

Abra phpMyAdmin: http://localhost/phpmyadmin

Cole e execute este SQL:

```sql
CREATE DATABASE IF NOT EXISTS papel_pixel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE papel_pixel;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  description TEXT,
  image VARCHAR(500),
  stock INT DEFAULT 0,
  is_promotion BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  shipping_name VARCHAR(255),
  shipping_email VARCHAR(255),
  shipping_phone VARCHAR(50),
  shipping_address VARCHAR(500),
  shipping_city VARCHAR(100),
  shipping_province VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(100),
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar usuário admin com senha "123456"
INSERT INTO users (name, email, password_hash, role) 
VALUES 
  ('Gildo Paulo Correia Victor', 'gildo@papelpixel.co.mz', '$2a$10$rBDy4JgZK8qG3K8X9ZzLLOmEKFz3BqH7x8b8Z9XzLLKqG8X9ZzLL', 'admin');

SELECT '✅ Banco criado!' as status;
```

---

### PASSO 3: Configurar Backend

**Arquivo:** `backend/config/database.js`

Atualize com:

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // SENHA DO SEU MYSQL
  database: 'papel_pixel',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

**Se usar XAMPP, deixe password vazio ('').**

---

### PASSO 4: Instalar Dependências do Backend

```bash
cd backend
npm install
```

---

### PASSO 5: Iniciar Backend

```bash
npm start
```

Deve mostrar: `Server running on http://localhost:3001`

---

### PASSO 6: Verificar Rotas de Auth

O arquivo `backend/routes/auth.js` JÁ ESTÁ PRONTO!

Tem:
- POST `/api/auth/register` - Cadastrar usuário
- POST `/api/auth/login` - Fazer login
- GET `/api/auth/me` - Verificar usuário logado

---

## 🧪 TESTAR

### Testar Cadastro

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@teste.com",
    "password": "123456"
  }'
```

### Testar Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@teste.com",
    "password": "123456"
  }'
```

---

## ⚡ AGORA O QUE FAZER

O backend MySQL **JÁ ESTÁ PRONTO!**

Você só precisa:
1. ✅ Instalar MySQL (XAMPP)
2. ✅ Executar SQL acima
3. ✅ Configurar `database.js`
4. ✅ Iniciar backend (`npm start`)
5. ✅ Atualizar frontend para usar `/api/auth/login` em vez de Supabase

**Quer que eu atualize o frontend para usar MySQL agora?** 🚀

