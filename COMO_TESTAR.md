# 🎯 Como Testar - 3 Passos Simples

## ✅ Passo 1: Preparar

```bash
cd backend
npm install
```

## ✅ Passo 2: Banco de Dados

```bash
# Criar banco
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS papel_pixel;
USE papel_pixel;
source sql/schema.sql;
EOF
```

## ✅ Passo 3: Testar!

```bash
# Terminal 1: Iniciar servidor
npm run dev

# Terminal 2: Executar testes
npm test
```

---

## 📋 Ou testar manualmente:

```bash
# 1. Testar se API está funcionando
curl http://localhost:3001

# 2. Registrar usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@teste.com","password":"123456"}'

# 3. Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@teste.com","password":"123456"}'

# 4. Buscar produtos
curl http://localhost:3001/api/products
```

---

## 📚 Guias Completos

- Início Rápido: `INICIO_RAPIDO.md`
- Testes Completos: `TESTE_COMPLETO_BACKEND.md`
- Comece Aqui: `COMECE_AQUI_TESTES.md`

