# 🧪 Como Testar a Integração Frontend ↔ Backend

## 📋 Status Atual

- ✅ **Backend MySQL:** http://localhost:3001 (RODANDO)
- ✅ **Frontend:** http://localhost:8080 (RODANDO)
- ⚠️ **Frontend atualmente usa Supabase** (precisa mudar para backend MySQL)

---

## 🎯 Passo a Passo para Testar

### 1️⃣ Iniciar o Backend (Terminal 1)

```powershell
cd backend
npm start
```

**Deve aparecer:**
```
Server running on http://localhost:3001
Connected to database successfully
```

---

### 2️⃣ Iniciar o Frontend (Terminal 2)

```powershell
# Na raiz do projeto
npm run dev
```

**Deve aparecer:**
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:8080/
```

---

### 3️⃣ Testar no Navegador

#### Abrir o Site
Abra: **http://localhost:8080**

#### Ir para Página de Registro
Abra: **http://localhost:8080/register**

#### Preencher o Formulário
- **Nome:** João da Silva
- **Email:** joao@teste.com
- **Telefone:** (11) 99999-9999
- **Senha:** 123456
- **Confirmar Senha:** 123456
- ✅ Marcar "Aceito os termos"
- ✅ Marcar "Aceito a política de privacidade"

#### Clicar em "Criar Conta"

---

## 🚨 ATENÇÃO: Problema Identificado

O frontend está configurado para usar **Supabase**, não o backend MySQL!

**Problema:** Na linha 2 de `src/contexts/AuthContext.tsx`:
```typescript
import { supabase } from "@/config/supabase";
```

**Solução:** Precisamos criar uma versão do AuthContext que use o backend MySQL!

---

## 🔧 Solução: Integrar com Backend MySQL

### Opção 1: Criar Novos Arquivos (RECOMENDADO)

Vou criar um `AuthContextMySQL.tsx` que usa o backend MySQL:

- ✅ Chamadas para `http://localhost:3001/api/auth/register`
- ✅ Chamadas para `http://localhost:3001/api/auth/login`
- ✅ Armazenamento de token JWT
- ✅ Validação de token

### Opção 2: Modificar o AuthContext Existente

Substituir Supabase por chamadas HTTP para o backend.

---

## ✅ Solução Criada!

Criei o arquivo `src/contexts/AuthContextMySQL.tsx` que usa o backend MySQL!

---

## 🔧 Como Usar o Backend MySQL no Frontend

### Passo 1: Mudar App.tsx

Edite `src/App.tsx` e troque:

**DE:**
```typescript
import { AuthProvider } from "@/contexts/AuthContext";
```

**PARA:**
```typescript
import { AuthProviderMySQL as AuthProvider } from "@/contexts/AuthContextMySQL";
```

---

### Passo 2: Verificar Rotas do Backend

O backend precisa ter estas rotas:
- ✅ `POST /api/auth/register` - Já existe!
- ✅ `POST /api/auth/login` - Já existe!
- ❌ `GET /api/auth/me` - Precisamos criar!

---

## 🚀 Criar Rota GET /api/auth/me

Esta rota valida o token e retorna os dados do usuário logado.

### Adicionar no Backend

Abra: `backend/routes/auth.js`

Adicione esta rota **ANTES** do `module.exports`:

```javascript
// Obter usuário atual (verificar token)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key');
      
      const [users] = await pool.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ user: users[0] });
    } catch (error) {
      res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});
```

---

## 📝 Resumo

- ✅ Backend: RODANDO na porta 3001
- ✅ Frontend: RODANDO na porta 8080
- ✅ AuthContextMySQL.tsx: CRIADO!
- ⚠️ Precisa: Trocar App.tsx e adicionar rota /me

**Quer que eu faça essas mudanças agora?**

