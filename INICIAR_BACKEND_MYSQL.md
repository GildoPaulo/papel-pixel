# 🚀 CONFIGURAR MYSQL BACKEND AGORA

## 🎯 PLANO SIMPLES

### 1. Instalar MySQL (XAMPP)

Download: https://www.apachefriends.org/download.html

Instale e:
1. Abra XAMPP Control Panel
2. Clique em **Start** no MySQL
3. ✅ MySQL rodando na porta 3306

---

### 2. Criar Banco de Dados

Abra phpMyAdmin: http://localhost/phpmyadmin

Execute este SQL:

```sql
CREATE DATABASE papel_pixel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE papel_pixel;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  originalPrice DECIMAL(10, 2),
  description TEXT,
  image VARCHAR(500),
  stock INT DEFAULT 0,
  isPromotion BOOLEAN DEFAULT FALSE,
  isFeatured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT '✅ Banco criado!' as status;
```

---

### 3. Configurar Backend

Abra: `backend/config/database.js`

Certifique-se de que está assim:

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Deixe vazio para XAMPP
  database: 'papel_pixel',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
```

---

### 4. Iniciar Backend

Abra um terminal:

```bash
cd backend
npm install  # se ainda não instalou
npm start
```

Deve mostrar: `Server running on http://localhost:3001`

---

### 5. Criar .env na Raiz

Crie arquivo `.env` na raiz do projeto:

```
VITE_API_URL=http://localhost:3001/api
```

---

### 6. Testar

Abra: http://localhost:8080

✅ Deve funcionar agora!

---

## ✅ FEITO!

Frontend agora usa backend MySQL em vez de Supabase!

---

## 📝 RESUMO

1. ✅ Instale XAMPP
2. ✅ Crie banco papel_pixel
3. ✅ Configure backend/database.js
4. ✅ Inicie backend (`npm start`)
5. ✅ Crie .env com VITE_API_URL
6. ✅ Teste site!

**Tudo pronto para usar MySQL!** 🎉

