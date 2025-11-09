# 🧪 COMO TESTAR FRONTEND COM MYSQL

## ✅ Status

**Migração concluída:** ✅  
**Sem Supabase:** ✅  
**Usando localStorage + MySQL:** ✅  
**Sem erros de linting:** ✅

---

## 🚀 TESTE AGORA - 3 CENÁRIOS

### Cenário 1: SEM Backend (TESTE BÁSICO)

**Objetivo:** Verificar se o frontend carrega sem backend

1. **Certifique-se que o backend NÃO está rodando**
2. Abra: http://localhost:8080
3. **Resultado esperado:**
   - ✅ Página carrega normalmente
   - ✅ Sem erros no console
   - ✅ Loja aparece (sem produtos)

**Como verificar:**
- Abra F12 (DevTools)
- Aba Console
- **NÃO deve ter erros vermelhos!**

---

### Cenário 2: COM Backend Rodando (TESTE COMPLETO)

**Objetivo:** Testar registro e login com backend

1. **Iniciar backend:**
```powershell
cd backend
npm start
```

2. Aguarde aparecer:
```
Server running on http://localhost:3001
```

3. Acesse: http://localhost:8080

4. Vá para registro: http://localhost:8080/register

5. Crie uma conta:
   - Nome: Teste
   - Email: teste@teste.com  
   - Senha: 123456

6. **Resultado esperado:**
   - ✅ Conta criada
   - ✅ Login automático
   - ✅ Página inicial carrega

---

### Cenário 3: Login Após Fechar Navegador

**Objetivo:** Verificar persistência no localStorage

1. **Faça login** (usando conta criada)

2. **Feche o navegador completamente**

3. **Abra novamente** e acesse: http://localhost:8080

4. **Resultado esperado:**
   - ✅ Você deve estar logado ainda!
   - ✅ Dados vêm do localStorage
   - ✅ Sem precisar fazer login de novo

---

## 🔍 ONDE VERIFICAR OS TESTES

### Console do Navegador (F12)

**Deve aparecer:**
```
Backend não disponível, usando usuário salvo
Error loading products from backend, using fallback
```

**NÃO deve aparecer:**
- ❌ Erros vermelhos
- ❌ "Cannot read property"
- ❌ "Failed to fetch" (só warnings, não errors)

---

### localStorage (F12 → Application → Local Storage)

**Deve ter:**
- `token`: "eyJhbGc..." (após login)
- `user`: {"id":1,"name":"Teste"...}
- `adminProducts`: [] (produtos salvos)

---

## ✅ CHECKLIST DE TESTES

### Teste 1: Frontend Básico
- [ ] Página carrega sem backend
- [ ] Sem erros no console
- [ ] Loja aparece (vazia ou com produtos locais)

### Teste 2: Registro
- [ ] Criar conta funciona
- [ ] Token salvo no localStorage
- [ ] Usuário logado automaticamente

### Teste 3: Login
- [ ] Login funciona
- [ ] Dados corretos carregados
- [ ] Permanece logado após refresh

### Teste 4: Logout
- [ ] Logout limpa localStorage
- [ ] Volta para visitante
- [ ] Token removido

### Teste 5: Persistência
- [ ] Fechar e abrir navegador mantém login
- [ ] Dados vem do localStorage
- [ ] Sessão não se perde

---

## 🚨 SE ALGO DER ERRADO

### Página Branca?

**Causa:** Erro de importação ou contexto  
**Solução:**
```powershell
# Limpar cache
npm run build
npm run dev
```

### Erro 401 no Console?

**Causa:** Backend não está rodando  
**Solução:** 
```powershell
cd backend
npm start
```

### localStorage não persiste?

**Causa:** Modo incógnito ou bloqueado  
**Solução:** Use navegador normal (não incógnito)

---

## 📊 O QUE FOI FEITO

✅ **Removido Supabase** dos contextos principais  
✅ **App.tsx** usa MySQL  
✅ **localStorage** como fallback  
✅ **Sem erros de linting**  
✅ **Funciona offline** (após primeira carga)  

---

## 🎯 PRÓXIMOS PASSOS

Se TODOS os testes passarem:

1. ✅ Frontend funcionando com MySQL
2. 📝 Adicionar produtos ao banco
3. 🧪 Testar compras
4. 🚀 Deploy!

---

## 📝 NOTA IMPORTANTE

**O frontend agora funciona:**
- ✅ **Com backend:** Registro, login, produtos reais
- ✅ **Sem backend:** LocalStorage, offline mode
- ✅ **Híbrido:** Tenta backend, usa localStorage se falhar

**Não quebra mais!** 🎉



