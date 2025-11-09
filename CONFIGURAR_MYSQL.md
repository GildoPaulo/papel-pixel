# 🚀 CONFIGURAR MYSQL - Guia Rápido

## ✅ Passo 1: Instalar XAMPP (Se não tiver)

1. Download: https://www.apachefriends.org/
2. Instalar
3. Abrir XAMPP Control Panel
4. Iniciar **Apache** e **MySQL** (botões "Start")

---

## ✅ Passo 2: Criar Banco de Dados

1. Abra: http://localhost/phpmyadmin
2. Clique em **"New"** no menu lateral
3. Nome do banco: `papel_pixel`
4. Charset: `utf8mb4_unicode_ci`
5. Clique em **"Create"**

---

## ✅ Passo 3: Executar SQL

1. No phpMyAdmin, selecione o banco `papel_pixel`
2. Clique na aba **"SQL"**
3. Copie o conteúdo de: `backend/sql/schema.sql`
4. Cole e clique em **"Go"**

---

## ✅ Passo 4: Instalar Dependências

**No terminal, dentro da pasta `backend`:**
```bash
npm install
```

---

## ✅ Passo 5: Testar Backend

```bash
cd backend
npm run dev
```

**Deve aparecer:**
```
🚀 Server running on http://localhost:3001
📊 Environment: development
```

---

## ✅ Passo 6: Criar Usuário de Teste

No phpMyAdmin, execute este SQL:

```sql
-- Criar usuário admin
INSERT INTO users (name, email, password, role) 
VALUES (
  'Gildo Paulo Victor', 
  'gildopaulovictor@gmail.com', 
  '$2a$10$XmKIwYqmMdXYlA8SZs3z.OdJOzLz7jz5fV7W8hXN5rLjDQx5ZKZ9m',  -- senha: 123456
  'admin'
);
```

**Senha padrão:** `123456`

**OU** use este para gerar hash seguro:
```sql
-- Instalar bcrypt primeiro (npm install bcryptjs)
```

Ou execute via Node.js:
```bash
node backend/scripts/create-user.js
```

---

## ✅ Passo 7: Testar API

Abra no navegador:
- http://localhost:3001/api/products

**Deve retornar JSON** com produtos (mesmo que vazio).

---

## 🎯 Próximo: Configurar Frontend

Depois que MySQL estiver funcionando, vamos:
1. ✅ Remover Supabase do frontend
2. ✅ Usar API REST do backend MySQL
3. ✅ Sistema de login com JWT

---

## 🐛 Problemas Comuns

### "MySQL connection refused"
**Solução:** Certifique-se que MySQL está rodando no XAMPP

### "Access denied"
**Solução:** Verifique senha no `backend/.env`

### "Unknown database"
**Solução:** Crie o banco `papel_pixel` no phpMyAdmin

---

**Me avise quando tiver MySQL rodando! 🚀**

