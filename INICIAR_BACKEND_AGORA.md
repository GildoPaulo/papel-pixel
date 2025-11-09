# ✅ PRÓXIMOS PASSOS - Backend MySQL

## ✅ O Que Você Já Fez
- ✅ XAMPP rodando
- ✅ Banco `papel_pixel` criado
- ✅ Tabelas criadas

---

## 1️⃣ CRIAR USUÁRIO DE TESTE

No phpMyAdmin, execute este SQL:

```sql
-- Criar usuário de teste
INSERT INTO users (name, email, password, role) 
VALUES (
  'Gildo Paulo Victor', 
  'gildopaulovictor@gmail.com', 
  '$2a$10$XmKIwYqmMdXYlA8SZs3z.OdJOzLz7jz5fV7W8hXN5rLjDQx5ZKZ9m',
  'admin'
);

-- Ver usuários criados
SELECT * FROM users;
```

**OU** copie do arquivo: `criar_usuario_teste.sql`

**Login:**
- Email: `gildopaulovictor@gmail.com`
- Senha: `123456`

---

## 2️⃣ INSTALAR DEPENDENCIAS

Abra PowerShell na pasta do projeto:

```powershell
cd backend
npm install
```

---

## 3️⃣ INICIAR BACKEND

```powershell
npm run dev
```

**Deve aparecer:**
```
🚀 Server running on http://localhost:3001
📊 Environment: development
✅ MySQL pool criado
```

---

## 4️⃣ TESTAR API

Abra no navegador:
- http://localhost:3001/

**Deve aparecer:**
```json
{"message":"Papel & Pixel Backend API is running! 🚀"}
```

- http://localhost:3001/api/products

**Deve retornar:** `[]`

---

## 5️⃣ ME AVISE!

Quando backend estiver rodando, eu configuro:
- ✅ Frontend para usar MySQL
- ✅ Sistema de login com JWT
- ✅ Autenticação funcionando

**Avise quando conseguir rodar o backend!** 🚀

