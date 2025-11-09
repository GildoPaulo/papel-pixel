# 📥 Instalar XAMPP - Guia Rápido

## 🎯 Por que XAMPP?
- ✅ MySQL + phpMyAdmin incluídos
- ✅ Interface visual
- ✅ Fácil de usar
- ✅ Grátis

---

## 📦 INSTALAÇÃO (20 min)

### 1. Download

**Link:** https://www.apachefriends.org/download.html

**Escolha:** Windows (versão mais recente)

**Tamanho:** ~150 MB

---

### 2. Instalar

1. Executar o instalador
2. **Componentes:** Marcar apenas **MySQL**
3. Next, Next, Next...
4. Finish

---

### 3. Iniciar MySQL

1. **Abrir:** XAMPP Control Panel
2. **Clicar:** Start no **MySQL**
3. **Aguardar:** Ficar verde ✅

---

### 4. Criar Banco

1. **Abrir navegador:**
   ```
   http://localhost/phpmyadmin
   ```

2. **Clicar:** "New" (Nova)

3. **Nome:** `papel_pixel`

4. **Criar**

✅ **Pronto!**

---

### 5. Atualizar .env

No arquivo `backend/.env`, configure:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=papel_pixel
DB_PORT=3306
```

**Senha vazia** = deixar em branco mesmo!

---

### 6. Executar Setup

```bash
cd backend
npm run setup
```

---

### 7. Rodar Backend

```bash
npm run dev
```

**Deve aparecer:**
```
✅ MySQL connection test successful
```

✅ **FUNCIONANDO!**

