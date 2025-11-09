# 🚀 MIGRAR PARA MYSQL AGORA

## 🎯 VANTAGENS DO MYSQL

### ✅ Por Que Migrar
- ⚡ Mais rápido e confiável
- 🔧 Controle total sobre o banco
- 💰 Mais barato (grátis se usar local)
- 🎯 Sem complicações de configuração
- 📊 Dados no seu servidor
- 🔐 Segurança total

### ❌ Problemas do Supabase
- ⏱️ Configuração complexa
- 🔐 Email verification bloqueando
- 💸 Pode ter custos
- ⚠️ Depende de serviço externo
- 🐌 Mais lento

---

## 📋 PASSOS PARA MIGRAR

### PASSO 1: Instalar MySQL (se ainda não tem)

**Windows:**
1. Baixe: https://dev.mysql.com/downloads/mysql/
2. Instale e anote a senha do root

**Ou use XAMPP:**
1. Baixe: https://www.apachefriends.org/
2. Instale e use MySQL do XAMPP

---

### PASSO 2: Criar Banco de Dados

Execute este SQL no MySQL:

```sql
-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS papel_pixel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE papel_pixel;

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de produtos
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

-- Criar tabela de pedidos
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
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Criar tabela de campanhas de email
CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience VARCHAR(100),
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de inscritos
CREATE TABLE IF NOT EXISTS subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin padrão
INSERT INTO users (name, email, password_hash, role) 
VALUES 
  ('Gildo Paulo Correia Victor', 'admin@papelpixel.co.mz', '$2a$10$hashedpassword', 'admin'),
  ('Crimilda Marcos Manuel', 'crimilda@papelpixel.co.mz', '$2a$10$hashedpassword', 'admin')
ON DUPLICATE KEY UPDATE name=VALUES(name);

SELECT '✅ Banco de dados Papel & Pixel criado com sucesso!' as status;
```

---

### PASSO 3: Configurar Backend MySQL

O backend JÁ está pronto! Verifique:

**Arquivo:** `backend/config/database.js`

Deve ter algo como:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'SUA_SENHA',
  database: 'papel_pixel'
});
```

**Atualize com suas credenciais MySQL!**

---

### PASSO 4: Iniciar Backend

```bash
cd backend
npm install  # se ainda não instalou
npm start
```

Deve mostrar: `Server running on http://localhost:3001`

---

### PASSO 5: Atualizar Frontend para Usar MySQL

Crie o serviço de autenticação local:

**Arquivo:** `src/services/authLocal.ts`

```typescript
const API_URL = 'http://localhost:3001/api/auth';

export const loginLocal = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const registerLocal = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return response.json();
};
```

---

## ⚡ VANTAGENS IMEDIATAS

### Login/Cadastro
- ✅ Mais rápido
- ✅ Sem problemas de email verification
- ✅ Controle total
- ✅ Seguro

### Dados
- ✅ Sempre acessíveis
- ✅ Sem dependência de serviço externo
- ✅ Backup fácil
- ✅ Escalável

---

## 🎯 RESULTADO

Depois de migrar:
- ✅ Login funciona imediatamente
- ✅ Cadastro funciona imediatamente
- ✅ Sem dependências complicadas
- ✅ Totalmente funcional

---

## 📝 PRÓXIMOS PASSOS

1. Instalar MySQL (se não tem)
2. Executar SQL acima para criar banco
3. Configurar `backend/config/database.js`
4. Iniciar backend (`npm start`)
5. Atualizar frontend para usar backend MySQL
6. Testar!

**Vamos fazer isso juntos?** 🚀

