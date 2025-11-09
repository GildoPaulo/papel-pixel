# 🚀 Guia Completo de Deploy Gratuito - Papel & Pixel

## 🎯 Objetivo

Hospedar o sistema **Papel & Pixel** completamente GRÁTIS na internet!

**Stack de Deploy:**
- 🌐 **Frontend:** Vercel (Grátis)
- 🖥️ **Backend:** Railway (500h grátis/mês)
- 🗄️ **Banco de Dados:** Railway MySQL (incluído)

**Resultado:** Site público acessível 24/7! 🌍

---

## 📋 PRÉ-REQUISITOS

Antes de começar, você precisa:

1. ✅ Conta no **GitHub** (para código)
2. ✅ Conta no **Vercel** (para frontend)
3. ✅ Conta no **Railway** (para backend)
4. ✅ Código funcionando localmente

**Tempo estimado:** 30-45 minutos

---

## 🗂️ PASSO 1: Preparar o Código para Deploy

### 1.1 - Criar Repositório no GitHub

1. **Vá para** https://github.com/new

2. **Configure:**
   - Nome: `papel-pixel-ecommerce`
   - Descrição: `E-commerce completo de livros e papelaria`
   - Visibilidade: **Private** (recomendado)

3. **Criar repositório**

### 1.2 - Subir Código para o GitHub

**Abra o terminal na pasta do projeto:**

```bash
# Inicializar git (se ainda não foi)
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Deploy: Sistema Papel & Pixel completo v2.5"

# Adicionar repositório remoto (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/papel-pixel-ecommerce.git

# Enviar código
git branch -M main
git push -u origin main
```

✅ **Código no GitHub!**

---

## 🖥️ PASSO 2: Deploy do Backend (Railway)

### 2.1 - Criar Conta no Railway

1. **Vá para** https://railway.app
2. **Clique em** "Start a New Project"
3. **Login com GitHub**

### 2.2 - Criar Projeto

1. **Clique em** "New Project"
2. **Selecione** "Deploy from GitHub repo"
3. **Escolha** `papel-pixel-ecommerce`
4. **Selecione** a pasta `backend`

### 2.3 - Adicionar MySQL

1. **No projeto Railway, clique em** "+ New"
2. **Selecione** "Database" → "MySQL"
3. **Aguarde** provisioning (~1 minuto)
4. ✅ **MySQL criado!**

### 2.4 - Configurar Variáveis de Ambiente

1. **Clique no serviço do Backend**
2. **Vá para aba** "Variables"
3. **Adicione uma por uma:**

```bash
# Database (Railway fornece automaticamente)
DB_HOST=mysql.railway.internal
DB_USER=root
DB_PASSWORD=(pegar do MySQL Service)
DB_NAME=railway
DB_PORT=3306

# Server
PORT=3001
NODE_ENV=production

# JWT Secret (GERAR NOVO!)
JWT_SECRET=(executar: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Email
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=suporte.papelepixel@outlook.com
EMAIL_PASS=sua-senha-de-app-outlook

# Frontend (adicionar depois)
FRONTEND_URL=https://seu-site.vercel.app
CORS_ORIGIN=https://seu-site.vercel.app
```

**Para pegar as credenciais do MySQL:**
- Clique no serviço MySQL
- Vá em "Variables"
- Copie: `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`

### 2.5 - Deploy

1. **Railway vai fazer deploy automaticamente!**
2. **Aguarde** (~3-5 minutos)
3. **Quando terminar**, clique em "Settings"
4. **Gerar Domain:** Clique em "Generate Domain"
5. ✅ **Você terá:** `https://seu-backend.up.railway.app`

### 2.6 - Criar Tabelas no Banco

**Opção A: Via Railway CLI**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar ao MySQL
railway connect mysql

# Executar SQLs
SOURCE sql/schema.sql;
SOURCE sql/create_abandoned_carts_table.sql;
```

**Opção B: Via TablePlus / MySQL Workbench**

1. Pegar credenciais do Railway (MySQL → Variables)
2. Conectar com cliente MySQL
3. Executar todos os arquivos `.sql` da pasta `backend/sql/`

---

## 🌐 PASSO 3: Deploy do Frontend (Vercel)

### 3.1 - Criar Conta no Vercel

1. **Vá para** https://vercel.com
2. **Login com GitHub**
3. **Autorizar** acesso

### 3.2 - Importar Projeto

1. **Clique em** "Add New..." → "Project"
2. **Selecione** repositório `papel-pixel-ecommerce`
3. **Configure:**
   - Framework Preset: **Vite**
   - Root Directory: `./` (raiz)
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 3.3 - Variáveis de Ambiente

**Clique em** "Environment Variables" e adicione:

```bash
VITE_API_URL=https://seu-backend.up.railway.app/api
```

**IMPORTANTE:** Substitua `seu-backend.up.railway.app` pela URL real do Railway!

### 3.4 - Deploy

1. **Clique em** "Deploy"
2. **Aguarde** (~2-3 minutos)
3. ✅ **Site publicado:** `https://seu-site.vercel.app`

---

## 🔗 PASSO 4: Conectar Frontend e Backend

### 4.1 - Atualizar Backend com URL do Frontend

1. **Vá para Railway** → Seu backend → Variables
2. **Adicione/Atualize:**
   ```bash
   FRONTEND_URL=https://seu-site.vercel.app
   CORS_ORIGIN=https://seu-site.vercel.app
   ```

3. **Redeploy** (Railway faz automaticamente)

### 4.2 - Testar

1. **Acesse** `https://seu-site.vercel.app`
2. **Teste:**
   - ✅ Página inicial carrega
   - ✅ Produtos aparecem
   - ✅ Login funciona
   - ✅ Admin funciona

---

## ✅ PASSO 5: Checklist Final

### Frontend (Vercel)
- [ ] Site acessível via HTTPS
- [ ] Todas as páginas funcionam
- [ ] Imagens carregam
- [ ] Navegação funciona

### Backend (Railway)
- [ ] API responde (teste: `https://seu-backend.up.railway.app/api/products`)
- [ ] MySQL conectado
- [ ] Tabelas criadas
- [ ] Autenticação funciona

### Integração
- [ ] Frontend consegue fazer login
- [ ] Produtos carregam da API
- [ ] Pedidos funcionam
- [ ] Admin acessível

---

## 💰 CUSTOS (GRATUITO!)

### Vercel
- ✅ **100 GB bandwidth/mês** - Grátis
- ✅ **Unlimited sites** - Grátis
- ✅ **SSL automático** - Grátis

### Railway
- ✅ **500 horas/mês** - Grátis ($5 de crédito mensal)
- ✅ **MySQL incluído** - Grátis
- ✅ **1 GB RAM** - Grátis

**Total:** R$ 0,00/mês 🎉

**Limite:** ~20 dias online/mês (500h)  
**Para 24/7:** Upgrade para $5/mês (Railway)

---

## 🎁 BÔNUS: Otimizações para Produção

Criei arquivos otimizados para você! Vou listar agora...

**Quer que eu continue com:**
1. ✅ Criar arquivos de deploy (FEITO)
2. ⏳ Otimizar código para produção?
3. ⏳ Configurar CI/CD automático?

**Me responda "continuar" e eu faço as otimizações!**

Ou se preferir, **já pode começar o deploy** seguindo o guia acima! 🚀
