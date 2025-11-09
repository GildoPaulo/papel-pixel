# 🚀 ATIVAR MYSQL AGORA

## ✅ BACKEND JÁ ESTÁ PRONTO!

O seu backend MySQL está **totalmente funcional e pronto** para usar!

---

## 📋 PASSO A PASSO (SIGA NA ORDEM!)

### PASSO 1: Instalar MySQL (XAMPP é mais fácil)

1. Baixe XAMPP: https://www.apachefriends.org/download.html
2. Instale
3. Abra **XAMPP Control Panel**
4. Clique em **Start** no MySQL
5. ✅ MySQL está rodando!

---

### PASSO 2: Criar Banco de Dados

Abra phpMyAdmin: http://localhost/phpmyadmin

**Cole e execute este SQL:**

```sql
CREATE DATABASE papel_pixel;

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
  original_price DECIMAL(10, 2),
  description TEXT,
  image VARCHAR(500),
  stock INT DEFAULT 0,
  is_promotion BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT '✅ Banco criado!' as status;
```

---

### PASSO 3: Configurar Backend

**Arquivo:** `backend/config/database.js`

Se usar XAMPP, está correto assim:

```javascript
password: '', // Vazio para XAMPP
database: 'papel_pixel'
```

---

### PASSO 4: Iniciar Backend

```bash
cd backend
npm start
```

Deve mostrar: `Server running on http://localhost:3001`

---

### PASSO 5: Atualizar Frontend

Criar arquivo `.env` na raiz:

```env
VITE_API_URL=http://localhost:3001/api
```

Depois, substituir `AuthContext.tsx` por `AuthContextMySQL.tsx`:

**1. Renomear arquivos:**
```
AuthContext.tsx → AuthContextOld.tsx
AuthContextMySQL.tsx → AuthContext.tsx
```

**2. Ou apenas copie o conteúdo de AuthContextMySQL.tsx para AuthContext.tsx**

---

## 🧪 TESTAR AGORA

1. Abra: http://localhost:8080/register
2. Preencha e cadastre
3. **Deve funcionar!** ✅

---

## 📊 COMPARANDO

| Função | Supabase | MySQL |
|--------|----------|-------|
| Configuração | ❌ Complexa | ✅ Simples |
| Velocidade | ❌ Lenta | ✅ Rápida |
| Email verification | ❌ Bloqueia | ✅ Não precisa |
| Dependência externa | ❌ Sim | ✅ Não |
| Custo | ❌ Pode ter | ✅ Grátis |
| Controle | ❌ Limitado | ✅ Total |

---

## 🎉 VANTAGEM MYSQL

### Login/Cadastro:
- ✅ Funciona IMEDIATAMENTE
- ✅ Sem problemas
- ✅ Sem configurações complexas
- ✅ Sem emails para verificar
- ✅ Totalmente local

---

## ⚡ FAÇA AGORA

1. Instale XAMPP
2. Inicie MySQL
3. Execute SQL em phpMyAdmin
4. Inicie backend (`cd backend && npm start`)
5. Crie `.env` com API_URL
6. Substitua AuthContext
7. **TESTE!**

**Em 10 minutos você está com tudo funcionando!** 🚀

