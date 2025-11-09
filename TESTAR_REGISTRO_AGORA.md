# 🧪 TESTE DE REGISTRO - PASSO A PASSO

## ✅ Pré-requisitos

- ✅ Frontend carregando sem erros
- ✅ Backend MySQL rodando (opcional, mas recomendado)

---

## 🚀 COMO TESTAR

### Passo 1: Verificar Backend

**Abra o terminal onde o backend está rodando**

Deve mostrar:
```
Server running on http://localhost:3001
Connected to database successfully
```

**Se não estiver rodando:**
```powershell
cd backend
npm start
```

---

### Passo 2: Abrir Página de Registro

**No navegador, acesse:**
http://localhost:8080/register

**O que você deve ver:**
- ✅ Formulário de registro
- ✅ Campos: Nome, Email, Telefone, Senha
- ✅ Botão "Criar Conta"
- ✅ Links para Termos e Privacidade

---

### Passo 3: Preencher o Formulário

**Preencha com dados de teste:**
- **Nome:** João Silva
- **Email:** joao@teste.com
- **Telefone:** (11) 99999-9999
- **Senha:** 123456
- **Confirmar Senha:** 123456

**Marque:**
- ✅ Aceito os termos e condições
- ✅ Aceito a política de privacidade

---

### Passo 4: Clicar em "Criar Conta"

**Resultado esperado:**
- ✅ Toast: "Conta criada com sucesso!"
- ✅ Redirecionamento para página inicial
- ✅ Você está logado (vê seu nome no header)

---

### Passo 5: Verificar no Banco de Dados

**Abrir MySQL (phpMyAdmin ou Workbench)**

**Executar query:**
```sql
SELECT * FROM users;
```

**Resultado esperado:**
- ✅ Usuário aparece na tabela
- ✅ Nome: "João Silva"
- ✅ Email: "joao@teste.com"
- ✅ Role: "user"

---

## 🚨 SE DER ERRO

### Erro 1: "Erro ao criar conta"

**Causa:** Backend não está rodando  
**Solução:** Iniciar backend

### Erro 2: "Email já cadastrado"

**Causa:** Email já existe  
**Solução:** Use outro email

### Erro 3: Página branca

**Causa:** Erro de JavaScript  
**Solução:** 
1. Abrir F12 (DevTools)
2. Aba Console
3. Me envie o erro

---

## ✅ SUCESSO!

**Se tudo funcionou:**
- ✅ Conta criada
- ✅ Salva no MySQL
- ✅ Login automático
- ✅ Dados corretos

**Próximo passo:** Testar login separadamente!

---

## 🎯 TESTE AGORA!

**Acesse:** http://localhost:8080/register  
**Crie a conta de teste!**



