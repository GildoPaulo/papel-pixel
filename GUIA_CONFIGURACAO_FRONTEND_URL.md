# 🔧 Guia de Configuração FRONTEND_URL

## ⚠️ Problema: `http://undefined/` nos Emails

Se você está vendo `http://undefined/` nos links de email, significa que a variável `FRONTEND_URL` não está definida no arquivo `.env` do backend.

## ✅ Solução

### 1. Editar arquivo `.env` no backend

Abra o arquivo `backend/.env` e adicione/atualize a linha:

```env
FRONTEND_URL=http://127.0.0.1:8080
```

### 2. Formato completo do `.env` recomendado:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=pixel_ecommerce

# JWT Secret
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui

# Porta do Backend
PORT=3001

# Frontend URL (IMPORTANTE!)
FRONTEND_URL=http://127.0.0.1:8080

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

### 3. Reiniciar o servidor

Após editar o `.env`, **REINICIE O SERVIDOR BACKEND** para aplicar as mudanças:

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente
npm run dev
```

## 🛡️ Proteção Automática

O código agora tem proteções automáticas:
- Se `FRONTEND_URL` não estiver definido, usa `http://127.0.0.1:8080` automaticamente
- Remove qualquer "undefined" das URLs
- Logs de aviso aparecem no console quando o fallback é usado

## 📧 Testar

1. Solicite recuperação de senha
2. Verifique o email recebido
3. O link deve ser: `http://127.0.0.1:8080/reset-password?token=...&email=...`

## 🔍 Verificar nos Logs

No console do backend, você verá:

```
⚠️ [PASSWORD RESET] FRONTEND_URL não definido, usando fallback: http://127.0.0.1:8080
```

Se aparecer esse aviso, adicione `FRONTEND_URL` no `.env`.



