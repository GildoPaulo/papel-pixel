# 🚀 Comece Aqui - Guia de Testes Rápido

## ⚡ Início Rápido

### 1️⃣ Instalar e Configurar (5 minutos)

```bash
# 1. Navegar para backend
cd backend

# 2. Instalar dependências
npm install

# 3. Criar arquivo .env
echo "PORT=3001
NODE_ENV=development
JWT_SECRET=minha-chave-secreta-super-forte
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=papel_pixel
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-app" > .env

# 4. Criar banco de dados
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS papel_pixel;
USE papel_pixel;
EOF

# 5. Importar schema
mysql -u root -p papel_pixel < sql/schema.sql

# 6. Iniciar servidor
npm run dev
```

**✅ Se tudo correu bem:**
```
🚀 Server running on http://localhost:3001
```

---

## 🧪 Testes Rápidos (2 minutos)

### Teste 1: API Funcionando
```bash
curl http://localhost:3001
```

### Teste 2: Registrar Usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'
```

### Teste 3: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

**✅ Guarde o TOKEN retornado!**

---

## 📋 Testes Completos

Ver: `TESTE_COMPLETO_BACKEND.md`

---

## ✅ Tudo Funcionando?

**Próximo passo:** Integrar com o frontend!

