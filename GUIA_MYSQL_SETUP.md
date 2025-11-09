# 🗄️ Guia Completo: Setup MySQL + Backend API

## 📋 Pré-requisitos

1. **MySQL instalado** (local ou remoto)
2. **Node.js** instalado
3. **npm** ou **pnpm**

---

## 🚀 Passo a Passo

### 1️⃣ Instalar Dependências do Backend

```bash
cd backend
npm install mysql2 express cors dotenv
```

### 2️⃣ Configurar MySQL

#### **Opção A: MySQL Local**
```bash
# Instalar MySQL (Windows)
# Baixe em: https://dev.mysql.com/downloads/installer/

# Criar banco de dados
mysql -u root -p
CREATE DATABASE papel_pixel;
USE papel_pixel;
```

#### **Opção B: MySQL Remoto (Hospedado)**
- **PlanetScale** (MySQL serverless): https://planetscale.com (Gratuito)
- **Aiven** (MySQL): https://aiven.io (Free tier)
- **Railway** (MySQL): https://railway.app (Pay as you go)

---

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=papel_pixel
PORT=3001
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
```

---

### 4️⃣ Executar Script de Setup

```bash
cd backend
npm run setup
```

Isso criará todas as tabelas automaticamente.

---

### 5️⃣ Iniciar o Backend

```bash
npm run dev
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

1. **users** - Usuários e administradores
2. **products** - Produtos da loja
3. **orders** - Pedidos realizados
4. **order_items** - Itens dos pedidos
5. **subscribers** - Assinantes da newsletter
6. **campaigns** - Campanhas de email marketing
7. **promotions** - Promoções ativas

---

## 🔗 Frontend

### Atualizar API Calls

O frontend já está preparado para conectar com o backend! Basta:

1. Atualizar `src/config/api.ts` com a URL do backend
2. Descomentar as chamadas de API nos contextos

### Exemplo:

```typescript
// src/config/api.ts
export const API_URL = "http://localhost:3001/api";
```

---

## 🌐 Hosting Backend

### **Opção 1: Railway (Recomendado)**
- Grátis para começar
- Deploy automático do GitHub
- MySQL incluído

### **Opção 2: Render**
- Grátis para começar
- Deploy automático
- Serviço de banco de dados disponível

### **Opção 3: Heroku**
- Plano gratuito com limitações
- MySQL via addon

---

## 🔐 Configurar JWT para Autenticação

```bash
# Gerar um JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Adicione o resultado no arquivo `.env`:
```
JWT_SECRET=seu_secret_aqui
```

---

## ✅ Testar a API

```bash
# Listar produtos
curl http://localhost:3001/api/products

# Criar usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'
```

---

## 🐛 Troubleshooting

### Erro: "Access denied for user"
- Verifique usuário e senha no `.env`
- Certifique-se de que o usuário tem permissões necessárias

### Erro: "Cannot find module"
- Execute `npm install` no diretório `backend/`

### Backend não inicia
- Verifique se a porta 3001 está livre
- Verifique as configurações do MySQL

---

## 📞 Suporte

Se tiver problemas, consulte os logs:
```bash
npm run dev
```

Ou consulte a documentação do MySQL: https://dev.mysql.com/doc/

---

## 📚 Próximos Passos

1. ✅ Configurar MySQL (local ou remoto)
2. ✅ Executar `npm run setup` no backend
3. ✅ Iniciar backend com `npm run dev`
4. ✅ Testar API com curl ou Postman
5. ✅ Atualizar frontend para usar API real
6. ✅ Deploy do backend
7. ✅ Deploy do frontend

---

**🎉 Pronto para começar!**










