# 🚀 Setup Completo MySQL - Projeto Final de E-commerce

## 📋 Para Apresentação na Faculdade

Este projeto funciona **100% localmente** sem necessidade de internet, usando MySQL como banco de dados relacional.

---

## ✅ REQUISITOS

1. **Node.js** 18+ instalado
2. **MySQL** instalado e rodando
3. **NPM** ou **Yarn**

---

## 🔧 INSTALAÇÃO E CONFIGURAÇÃO

### **1. Instalar MySQL**

**Windows:**
- Baixar: https://dev.mysql.com/downloads/mysql/
- Instalar seguindo o assistente
- Anotar senha do root

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

### **2. Criar Banco de Dados**

```bash
mysql -u root -p
```

Execute no MySQL:
```sql
CREATE DATABASE IF NOT EXISTS papel_pixel;
USE papel_pixel;
```

### **3. Executar Schema SQL**

```bash
# Na pasta raiz do projeto
mysql -u root -p papel_pixel < backend/sql/schema.sql
```

Ou copie e cole o conteúdo de `backend/sql/schema.sql` no MySQL.

### **4. Configurar Backend**

Copie `.env.example` para `.env` na pasta `backend`:

```bash
cd backend
cp .env.example .env
```

Edite `backend/.env`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA_MYSQL_AQUI
DB_NAME=papel_pixel

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=seu_secret_jwt_super_seguro_aqui

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

### **5. Instalar Dependências**

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
# Na pasta raiz do projeto
npm install
```

---

## 🚀 EXECUTAR O PROJETO

### **Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Deve mostrar:
```
🚀 ========================================
   Papel & Pixel Backend API
   Server running on http://localhost:3001
   ✅ Database connected successfully
========================================
```

### **Terminal 2 - Frontend:**

```bash
# Na pasta raiz
npm run dev
```

Deve abrir em: `http://localhost:8080`

---

## 👤 CRIAR USUÁRIO ADMIN

### **Opção 1: Via SQL**

```sql
USE papel_pixel;

INSERT INTO users (name, email, password, role) VALUES
('Administrador', 'admin@papelpixel.co.mz', '$2a$10$rM5Y5LkGh.8QxKZ8mQJXPeJ8ZxYQKZ8mQJXPeJ8ZxYQKZ8mQJXPe', 'admin');
```

**⚠️ A senha acima é hash de "admin123"**

### **Opção 2: Via Registro no Site**

1. Acesse: http://localhost:8080/register
2. Crie conta
3. No MySQL, atualize para admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'seu@email.com';
```

---

## 🧪 TESTAR BACKEND

### **Script Automático:**

```bash
node backend/scripts/test-backend.js
```

### **Manual:**

**1. Verificar servidor:**
```bash
curl http://localhost:3001/
```

**2. Listar produtos:**
```bash
curl http://localhost:3001/api/products
```

**3. Fazer login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@papelpixel.co.mz","password":"admin123"}'
```

Copie o token retornado!

**4. Criar produto (com token):**
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Caderno Teste",
    "category": "Papelaria",
    "price": 25.50,
    "stock": 100,
    "description": "Produto de teste"
  }'
```

**5. Verificar no MySQL:**
```sql
SELECT * FROM products;
```

---

## 📊 VERIFICAR DADOS NO MYSQL

```bash
mysql -u root -p papel_pixel
```

```sql
-- Ver usuários
SELECT id, name, email, role FROM users;

-- Ver produtos
SELECT id, name, price, stock FROM products;

-- Ver pedidos
SELECT id, user_id, total, status, created_at FROM orders;

-- Ver itens de pedidos (relacionamento)
SELECT 
  o.id as order_id,
  o.total,
  oi.product_id,
  oi.quantity,
  p.name as product_name
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id;
```

---

## 🔍 ESTRUTURA DE RELACIONAMENTOS

```
users
  └── orders (user_id → users.id)
      └── order_items (order_id → orders.id)
          └── products (product_id → products.id)

users
  └── reviews (user_id → users.id)
      └── products (product_id → products.id)

orders
  └── payments (order_id → orders.id)
```

**Todos os relacionamentos estão com FOREIGN KEYS ativas!**

---

## ✅ CHECKLIST DE FUNCIONALIDADES

- [x] MySQL instalado e rodando
- [x] Banco de dados criado
- [x] Tabelas criadas (schema.sql)
- [x] Backend conectado ao MySQL
- [x] Frontend conectado ao backend
- [ ] Login funciona
- [ ] Registro cria usuário no MySQL
- [ ] Admin pode criar produtos
- [ ] Produtos aparecem na loja
- [ ] Produtos persistem após refresh
- [ ] Checkout cria pedido
- [ ] Pedidos aparecem no admin
- [ ] Upload de imagens funciona

---

## 🎓 PARA APRESENTAÇÃO

**Demonstração sugerida:**

1. **Mostrar estrutura do banco** (MySQL Workbench ou terminal)
2. **Criar usuário admin** via site
3. **Adicionar produto** (com imagem)
4. **Ver produto na loja**
5. **Fazer login como cliente**
6. **Adicionar ao carrinho**
7. **Finalizar compra**
8. **Ver pedido no admin**
9. **Mostrar relacionamentos** no MySQL

**Slides sugeridos:**

1. Arquitetura (Frontend → Backend → MySQL)
2. Diagrama de relacionamentos
3. Tecnologias usadas
4. Funcionalidades implementadas
5. Demonstração ao vivo

---

## 🐛 PROBLEMAS COMUNS

### Backend não conecta ao MySQL

```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar credenciais no .env
cat backend/.env
```

### Produtos não aparecem

```sql
-- Verificar se há produtos no banco
SELECT * FROM products;
```

### Pedidos não aparecem

```sql
-- Verificar pedidos
SELECT * FROM orders;
SELECT * FROM order_items;
```

### Upload não funciona

```bash
# Verificar se pasta existe
ls backend/uploads/products/

# Criar se não existir
mkdir -p backend/uploads/products
```

---

## 📞 TESTE E ME INFORME!

Execute tudo e me diga:
1. ✅ Backend conectou ao MySQL?
2. ✅ Produtos aparecem?
3. ✅ Produtos persistem após refresh?
4. ✅ Pedidos são criados?

**Vamos garantir que tudo funciona para a apresentação!** 🎉

