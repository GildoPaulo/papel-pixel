# 🧪 TESTAR LOGIN COM MYSQL

## ✅ Passo 1: Instalar Dependências

**Abra PowerShell na pasta `backend` e execute:**

```powershell
npm install
```

---

## ✅ Passo 2: Reiniciar Backend

**No terminal onde backend está rodando:**
1. Pressione **Ctrl+C**
2. Execute: `npm run dev`

**Deve aparecer:**
```
🚀 Server running on http://localhost:3001
```

---

## ✅ Passo 3: Atualizar Frontend

**O frontend foi configurado para usar MySQL!**

**Teste no navegador:**
1. Vá em: http://localhost:8080/login
2. Email: `gildopaulovictor@gmail.com`
3. Senha: `123456`
4. Clique em **"Entrar"**

**Deve funcionar!** ✅

---

## 🐛 Se Der Erro

### Erro: "Credenciais inválidas"
**Verifique no phpMyAdmin:**
```sql
SELECT * FROM users WHERE email = 'gildopaulovictor@gmail.com';
```

### Erro: "Cannot GET /api/auth/login"
**Reinicie o backend** (Ctrl+C e `npm run dev` novamente)

---

## ✅ Tudo Configurado!

- ✅ Backend MySQL rodando
- ✅ Rotas de autenticação criadas
- ✅ Frontend usando MySQL
- ✅ Login funcionando

**Agora você tem um sistema completo funcionando!** 🎉

