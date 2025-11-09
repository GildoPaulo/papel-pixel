# 🚨 FIX URGENTE - Token Inválido

## ❌ **PROBLEMA**

O token não está salvo corretamente no `localStorage`!

**Erro:** `Token inválido` (linha 51/75 do código)

---

## ✅ **SOLUÇÃO IMEDIATA (30 segundos)**

### **Abra o Console do Navegador (F12) e execute:**

```javascript
// 1. Ver o que está salvo
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('User:', user);
console.log('Token:', user.token);

// 2. Se token for undefined/null, vamos criar um manualmente
```

---

## 🔧 **OPÇÃO A: Relogar com Correção Automática**

**No console do navegador (F12):**

```javascript
// Limpar tudo
localStorage.clear();
sessionStorage.clear();

// Recarregar
location.href = '/login';
```

Depois faça login normalmente.

---

## 🔧 **OPÇÃO B: Fix Manual do Token (TEMPORÁRIO)**

Se você não quer fazer logout, execute no console:

```javascript
// Pegar user atual
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Criar token temporário (APENAS PARA TESTE)
const tempToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZW1haWwiOiJnaWxkb3BhdWxvY29ycmVpYTg0QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMDcxNjAwMCwiZXhwIjoxNzMxMzIwODAwfQ.FAKE_SIGNATURE';

// Salvar user com token
user.token = tempToken;
localStorage.setItem('user', JSON.stringify(user));

// Recarregar
location.reload();
```

⚠️ **ISSO É TEMPORÁRIO!** Faça login de verdade depois.

---

## 🔧 **OPÇÃO C: Gerar Token Real via API**

**Execute no console do navegador:**

```javascript
// Fazer login via console e pegar token real
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'gildopaulocorreia84@gmail.com',  // SEU EMAIL
    password: 'SUA_SENHA_AQUI'                 // SUA SENHA
  })
})
.then(r => r.json())
.then(data => {
  console.log('Token gerado:', data.token);
  
  // Salvar
  const userData = {
    ...data.user,
    token: data.token
  };
  localStorage.setItem('user', JSON.stringify(userData));
  
  console.log('✅ Token salvo! Recarregando...');
  location.reload();
})
.catch(err => console.error('Erro:', err));
```

Substitua `SUA_SENHA_AQUI` pela sua senha real.

---

## 🎯 **SOLUÇÃO DEFINITIVA**

Vou corrigir o sistema de login para **SEMPRE salvar o token corretamente**.

**Você quer que eu:**
1. **Corrija o AuthContext** para salvar token corretamente?
2. **Remova a necessidade de token** nas abas Analytics e Cupons? (menos seguro)
3. **Ambos**?

---

## 💡 **POR ENQUANTO**

**Execute a OPÇÃO A** (mais rápida):

```javascript
localStorage.clear();
location.href = '/login';
```

Faça login → **DEVE FUNCIONAR!**

Se não funcionar, **me avise** e vou corrigir o AuthContext agora! 🚀

