# 🔍 Verificar MySQL - Solução Rápida

## ❌ Erro Atual

```
connect ETIMEDOUT
Host: 127.0.0.1
User: root
Password: (vazio)
Database: papel_pixel
```

---

## ✅ **SOLUÇÃO PASSO A PASSO**

### 1. Verificar se MySQL está instalado

**No terminal (CMD):**

```bash
mysql --version
```

**Se aparecer erro "comando não encontrado":**
- ❌ MySQL não está instalado
- 💡 **Solução:** Instale via XAMPP ou MySQL Installer

---

### 2. Verificar se MySQL está rodando

```bash
# Ver serviços rodando
net start | findstr MySQL
```

**Se não aparecer nada:**

```bash
# Iniciar MySQL
net start MySQL80

# ou
net start MySQL
```

**Se der erro "serviço não encontrado":**
- MySQL não está instalado corretamente
- **Instale XAMPP:** https://www.apachefriends.org/

---

### 3. Criar arquivo .env no backend

**No terminal:**

```bash
cd backend
copy con .env
```

**Cole isso (adapte com sua senha):**

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=papel_pixel
DB_PORT=3306

PORT=3001
JWT_SECRET=meu-secret-super-seguro-123

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gildopaulovictor@gmail.com
EMAIL_PASSWORD=sua_senha_email

FRONTEND_URL=http://localhost:8080
```

**Pressione:** `Ctrl+Z` e `Enter` para salvar

---

### 4. Criar banco de dados

```bash
# Abrir MySQL
mysql -u root -p
# Digite sua senha

# Dentro do MySQL
CREATE DATABASE papel_pixel;
SHOW DATABASES;
EXIT;
```

---

### 5. Executar setup

```bash
cd backend
npm run setup
```

---

### 6. Reiniciar backend

```bash
npm run dev
```

**Deve aparecer:**
```
✅ MySQL connection test successful
✅ [DATABASE] Tabela payments verificada/criada
```

---

## 🆘 **AINDA COM PROBLEMA?**

### Você tem XAMPP instalado?

**Se SIM:**
1. Abra XAMPP Control Panel
2. Clique em "Start" no MySQL
3. Aguarde ficar verde
4. Tente conectar novamente

**Se NÃO:**

**Instalar via XAMPP (MAIS FÁCIL):**
1. Download: https://www.apachefriends.org/download.html
2. Instalar (Next, Next, Next)
3. Abrir XAMPP Control Panel
4. Start MySQL
5. Criar banco:
   - Abrir http://localhost/phpmyadmin
   - New → `papel_pixel`

---

## ⚡ **SOLUÇÃO RÁPIDA (XAMPP)**

Se você tem XAMPP instalado:

1. **Abrir XAMPP Control Panel**
2. **Clicar "Start" no MySQL** (aguardar ficar verde)
3. **No backend/.env:**
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=papel_pixel
   ```
4. **Reiniciar backend:** `npm run dev`

✅ **Deve funcionar!**

---

**Me diga: Você tem XAMPP instalado? Ou MySQL separado?**


