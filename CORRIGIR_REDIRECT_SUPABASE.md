# ✅ CORRIGIR REDIRECT DO SUPABASE

## 🎯 Problema
O Supabase está redirecionando para `localhost:3001` em vez de `localhost:8080`

## 🔧 Solução: Atualizar URL de Redirect

### Passo 1: Acessar Dashboard
https://app.supabase.com/project/leqyvitngubadvsyfzya

### Passo 2: Ir em Authentication
1. Menu lateral → **Authentication**
2. Submenu → **URL Configuration**

### Passo 3: Atualizar Site URL e Redirect URLs

**Site URL:**
```
http://localhost:8080
```

**Redirect URLs (adicionar estas):**
```
http://localhost:8080/**
http://localhost:8080/reset-password
http://localhost:8080
```

### Passo 4: Salvar
Clique em **"Save"** ou **"Update"**

---

## 🔄 Testar Agora

1. Vá para: http://localhost:8080/login
2. Clique em **"Esqueci a senha"**
3. Digite: `gildopaulovictor@gmail.com`
4. Clique em **"Enviar Instruções"**
5. Verifique o email
6. Clique no link que chegou no email
7. **Deve redirecionar para:** `http://localhost:8080/reset-password`
8. Digite nova senha
9. Clique em **"Atualizar Senha"**
10. ✅ Login deve funcionar!

---

## 📋 Como Fazer no Dashboard

### Opção 1: Via Interface Web
1. **Dashboard → Authentication → URL Configuration**
2. **Site URL:** `http://localhost:8080`
3. **Redirect URLs:** Adicione as linhas acima
4. **Save**

### Opção 2: Via SQL (se não encontrar a opção)
Execute no SQL Editor:

```sql
-- Ver configurações atuais
SELECT name, value 
FROM vault.secrets 
WHERE name LIKE '%redirect%';
```

---

## 🎉 Pronto!

Agora o reset de senha vai redirecionar corretamente para a porta 8080!

