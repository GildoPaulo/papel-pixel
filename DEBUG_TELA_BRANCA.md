# 🐛 DEBUG: TELA BRANCA

## ⚠️ Problema
Página `localhost:8080/login` está em branco

---

## 🔍 COMO DIAGNOSTICAR:

### 1️⃣ Abrir Console do Navegador
1. Pressione **F12**
2. Vá na aba **Console**
3. **Me mostre OS ERROS que aparecem!**

---

## 🔧 SOLUÇÕES RÁPIDAS:

### Opção 1: Reiniciar Frontend
No terminal onde frontend está rodando:
1. Ctrl+C para parar
2. Execute: `npm run dev`

### Opção 2: Limpar Cache
No console do navegador (F12):
```javascript
localStorage.clear();
location.reload();
```

### Opção 3: Verificar Erros
Console (F12) → aba "Console" → copie TODOS os erros

---

## 📋 VERIFICAR:

### Frontend está rodando?
URL deve ser: **http://localhost:8080**

**Se aparecer erro de conexão:**
- Frontend não está rodando
- Reinicie: `npm run dev`

---

## 🆘 ME ENVIE:

1. O que aparece no **Console** (F12 > Console)?
2. Frontend está rodando? (terminal mostra servidor ativo?)
3. Algum erro em vermelho aparece?

