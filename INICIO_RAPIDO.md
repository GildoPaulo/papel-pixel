# 🚀 Início Rápido - Testar Backend

## ⚡ 3 Passos Simples

### 1️⃣ Instalar

```bash
cd backend
npm install
```

### 2️⃣ Configurar Banco

```bash
# Criar banco
mysql -u root -p
CREATE DATABASE papel_pixel;

# Sair do MySQL e executar:
mysql -u root -p papel_pixel < sql/schema.sql
```

### 3️⃣ Iniciar e Testar

```bash
# Iniciar servidor
npm run dev

# Em outro terminal, executar testes:
npm test
```

**✅ Pronto!** Os testes vão mostrar se tudo está funcionando.

---

## 📋 Testes Manuais

Se quiser testar manualmente:

### Teste Básico
```bash
curl http://localhost:3001
```

### Teste Registro
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'
```

---

## 📚 Mais Detalhes

- Testes Completos: `TESTE_COMPLETO_BACKEND.md`
- Documentação: `backend/API_DOCUMENTATION.md`

