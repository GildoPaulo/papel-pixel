# 🚀 COMECE AGORA COM MYSQL

## ✅ Você Já Tem Tudo!

**Backend já está configurado:**
- ✅ `backend/server.js` - API pronta
- ✅ `backend/sql/schema.sql` - Estrutura do banco
- ✅ `backend/config/database.js` - Conexão criada
- ✅ `mysql2` instalado

---

## 📋 PASSO A PASSO RÁPIDO

### 1️⃣ Abrir XAMPP Control Panel

1. Procure **XAMPP Control Panel** no menu Iniciar
2. Abra
3. Clique **Start** em **Apache**
4. Clique **Start** em **MySQL**

✅ Ambos devem ficar verdes

---

### 2️⃣ Criar Banco de Dados

1. Abra no navegador: **http://localhost/phpmyadmin**
2. Clique em **"New"** (menu lateral esquerdo)
3. **Database name:** `papel_pixel`
4. **Collation:** `utf8mb4_unicode_ci`
5. Clique em **"Create"**

✅ Banco criado!

---

### 3️⃣ Executar SQL Schema

1. No phpMyAdmin, clique em **`papel_pixel`** no menu lateral
2. Clique na aba **"SQL"** (topo)
3. Abra o arquivo: `backend/sql/schema.sql`
4. **Copie TUDO** do arquivo
5. **Cole** na caixa SQL do phpMyAdmin
6. Clique em **"Go"**

✅ Tabelas criadas!

---

### 4️⃣ Iniciar Backend

**Abra PowerShell e execute:**

```powershell
cd C:\Users\"Gildo Paulo Correia"\Documents\pixel\backend
npm run dev
```

**Deve aparecer:**
```
🚀 Server running on http://localhost:3001
📊 Environment: development
✅ MySQL pool criado
```

✅ Backend rodando!

---

### 5️⃣ Criar Usuário de Teste

No phpMyAdmin, execute este SQL:

```sql
-- Criar usuário admin
-- Senha: 123456 (hash já calculado)
INSERT INTO users (name, email, password, role) 
VALUES (
  'Gildo Paulo Victor', 
  'gildopaulovictor@gmail.com', 
  '$2a$10$XmKIwYqmMdXYlA8SZs3z.OdJOzLz7jz5fV7W8hXN5rLjDQx5ZKZ9m',
  'admin'
);
```

**Senha:** `123456`

---

### 6️⃣ Testar API

Abra no navegador:
- http://localhost:3001/api/products

**Deve retornar:** `[]` (array vazio, normal!)

---

## 🎯 Próximo: Frontend

**Depois que backend estiver funcionando:**

1. Vou configurar autenticação no frontend
2. Criar sistema de login com JWT
3. Conectar com MySQL ao invés de Supabase
4. Tudo funcionando! 🎉

---

## 🐛 Se Der Erro

### Erro: "cannot find module 'mysql2'"
**Solução:**
```powershell
cd backend
npm install
```

### Erro: "MySQL connection refused"
**Solução:** Inicie MySQL no XAMPP

### Erro: "Unknown database"
**Solução:** Crie o banco `papel_pixel` no phpMyAdmin

---

## 📞 Me Avise!

Quando conseguir:
- [ ] XAMPP rodando (Apache + MySQL verdes)
- [ ] Banco `papel_pixel` criado
- [ ] SQL executado com sucesso
- [ ] Backend rodando na porta 3001
- [ ] API respondendo

**Aí eu configuro o frontend!** 🚀

