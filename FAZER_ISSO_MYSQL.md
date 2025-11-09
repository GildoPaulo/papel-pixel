# ✅ FAZER ISSO AGORA - MySQL

## 🎯 Você Está Aqui:

**❌ Problema:** Supabase dando muito trabalho  
**✅ Solução:** Usar MySQL local que você já conhece

---

## 📋 FAZER EM 5 MINUTOS:

### 1️⃣ ABRIR XAMPP
- Menu Iniciar → "XAMPP"
- Clicar **Start** em **Apache**
- Clicar **Start** em **MySQL**
- ✅ Ambos devem ficar **VERDES**

---

### 2️⃣ CRIAR BANCO
- Navegador: **http://localhost/phpmyadmin**
- Clicar **"New"** (lado esquerdo)
- Nome: **`papel_pixel`**
- Clicar **"Create"**

---

### 3️⃣ EXECUTAR SQL
- No phpMyAdmin, clicar em **`papel_pixel`**
- Aba **"SQL"** (topo)
- Abrir arquivo: **`backend/sql/schema.sql`**
- **Copiar tudo** do arquivo
- **Colar** na caixa SQL
- Clicar **"Go"**

✅ **Feito!** Tabelas criadas!

---

### 4️⃣ INSTALAR DEPENDENCIAS

**PowerShell:**
```powershell
cd "C:\Users\Gildo Paulo Correia\Documents\pixel\backend"
npm install
```

---

### 5️⃣ INICIAR BACKEND

**No PowerShell (pasta backend):**
```powershell
npm run dev
```

**Deve aparecer:**
```
🚀 Server running on http://localhost:3001
```

---

### 6️⃣ CRIAR USUÁRIO

**PowerShell (pasta backend):**
```powershell
node scripts/create-user.js
```

**Login:**
- Email: `gildopaulovictor@gmail.com`
- Senha: `123456`

---

### 7️⃣ TESTAR

Navegador: **http://localhost:3001/api/products**

**Deve retornar:** `[]` ✅

---

## 🎉 PRONTO!

**Me avise quando chegar no passo 7!**

Depois configuro:
- ✅ Frontend usar MySQL ao invés de Supabase
- ✅ Login funcionando
- ✅ Tudo integrado

---

## 🐛 AJUDA RÁPIDA

### "XAMPP não abre"
- Procurar no menu Iniciar por "XAMPP Control Panel"
- Executar como Administrador

### "MySQL não inicia"
- Clicar **Stop** no MySQL
- Esperar 5 segundos
- Clicar **Start** novamente

### "npm não funciona"
- Instalar Node.js: https://nodejs.org/

**Pode começar!** 🚀

