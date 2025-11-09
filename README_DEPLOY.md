# 🌐 Papel & Pixel - Deploy Gratuito

## 🎯 Seu Site Online em 3 Passos

```
┌─────────────────────────────────────────┐
│  1. GitHub (Código)                     │
│     ↓                                   │
│  2. Railway (Backend + MySQL)           │
│     ↓                                   │
│  3. Vercel (Frontend)                   │
│     ↓                                   │
│  ✅ SITE NO AR! 🌍                      │
└─────────────────────────────────────────┘
```

---

## ⚡ INÍCIO RÁPIDO

### Passo 1: GitHub

```bash
git init
git add .
git commit -m "Deploy inicial"
git remote add origin https://github.com/SEU-USUARIO/papel-pixel.git
git push -u origin main
```

### Passo 2: Railway (Backend)

1. Vá em https://railway.app
2. Login com GitHub
3. New Project → Deploy from GitHub
4. Selecione seu repo → pasta `backend`
5. Add MySQL database
6. Configure variáveis (ver `backend/env.production.template`)
7. Generate domain

### Passo 3: Vercel (Frontend)

1. Vá em https://vercel.com
2. Import repository
3. Framework: Vite
4. Adicione: `VITE_API_URL=https://seu-backend.railway.app/api`
5. Deploy

---

## 📱 URLs do Seu Site

Depois do deploy:

- 🌐 **Site:** https://papel-pixel.vercel.app
- 🔗 **API:** https://papel-pixel-backend.up.railway.app
- 👨‍💼 **Admin:** https://papel-pixel.vercel.app/admin

---

## 🆘 Precisa de Ajuda?

📖 **Guia Completo:** `GUIA_DEPLOY_GRATUITO.md`  
✅ **Checklist:** `DEPLOY_CHECKLIST.md`  
📧 **Suporte:** suporte.papelepixel@outlook.com

---

## 💎 O Que Você Ganha

✅ Site público 24/7  
✅ SSL/HTTPS automático  
✅ CDN global  
✅ Deploy automático (git push)  
✅ **100% GRATUITO!**

---

**🚀 Pronto para começar?**

Siga o guia: `GUIA_DEPLOY_GRATUITO.md`


