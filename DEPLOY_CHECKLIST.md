# ✅ Checklist de Deploy - Papel & Pixel

## 📦 Antes de Começar

- [ ] Sistema funcionando localmente
- [ ] Código sem erros
- [ ] Conta GitHub criada
- [ ] Conta Vercel criada  
- [ ] Conta Railway criada

---

## 🚀 DEPLOY RÁPIDO (30 min)

### ETAPA 1: GitHub (5 min)

```bash
# Na pasta do projeto
git init
git add .
git commit -m "Deploy: Sistema completo"
git remote add origin https://github.com/SEU-USUARIO/papel-pixel.git
git push -u origin main
```

- [ ] Código no GitHub
- [ ] Repositório criado

---

### ETAPA 2: Railway - Backend (15 min)

1. **Acessar:** https://railway.app
2. **Login** com GitHub
3. **New Project** → Deploy from GitHub
4. **Selecionar** seu repositório
5. **Root Directory:** `backend`

**Adicionar MySQL:**
- [ ] Clicar "+ New" → Database → MySQL
- [ ] Aguardar provisionamento

**Variáveis de Ambiente:**

```bash
# Copiar do MySQL Service
DB_HOST=mysql.railway.internal
DB_USER=root  
DB_PASSWORD=(pegar do MySQL)
DB_NAME=railway
DB_PORT=3306

# Gerar JWT Secret
JWT_SECRET=(executar: openssl rand -hex 64)

# Email
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=suporte.papelepixel@outlook.com
EMAIL_PASS=sua-senha-outlook

# Outros
PORT=3001
NODE_ENV=production
```

- [ ] Variáveis configuradas
- [ ] Deploy concluído
- [ ] Domain gerado

**Inicializar Banco:**

```bash
# Local, conectar ao Railway
railway login
railway link
railway run npm run init-production
```

- [ ] Tabelas criadas
- [ ] Admin criado (admin@papelepixel.com / Admin@2024)

---

### ETAPA 3: Vercel - Frontend (10 min)

1. **Acessar:** https://vercel.com
2. **Login** com GitHub
3. **Add New Project**
4. **Selecionar** repositório
5. **Configure:**
   - Framework: **Vite**
   - Root Directory: `./`
   - Build: `npm run build`
   - Output: `dist`

**Variável de Ambiente:**

```bash
VITE_API_URL=https://seu-backend.up.railway.app/api
```

- [ ] Variável configurada
- [ ] Deploy iniciado
- [ ] Site publicado

---

### ETAPA 4: Conectar Frontend ↔ Backend

**No Railway (Backend):**

```bash
FRONTEND_URL=https://seu-site.vercel.app
CORS_ORIGIN=https://seu-site.vercel.app
```

- [ ] Variáveis atualizadas
- [ ] Redeploy automático

---

## 🧪 TESTAR

### Backend

```bash
# Testar se API responde
curl https://seu-backend.up.railway.app/api/products
```

- [ ] API responde
- [ ] Retorna produtos

### Frontend

```
https://seu-site.vercel.app
```

- [ ] Site carrega
- [ ] Produtos aparecem
- [ ] Login funciona
- [ ] Admin acessível

---

## 📝 URLs Finais

Após o deploy, você terá:

```
Frontend: https://seu-site.vercel.app
Backend:  https://seu-backend.up.railway.app
Admin:    https://seu-site.vercel.app/admin

Login Admin:
Email: admin@papelepixel.com
Senha: Admin@2024 (MUDE DEPOIS!)
```

---

## 💰 CUSTOS

- **Vercel:** R$ 0,00/mês ✅
- **Railway:** R$ 0,00/mês (500h = ~20 dias) ✅
- **Total:** **GRATUITO!** 🎉

---

## 🎯 PRÓXIMO PASSO

**Leia:** `GUIA_DEPLOY_GRATUITO.md` (passo a passo detalhado)

**Ou me avise:** "Quero fazer o deploy agora" e eu te guio! 🚀


