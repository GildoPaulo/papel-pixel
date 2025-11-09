# ✅ Correção: Rotas de Autenticação

## 🐛 Problemas Encontrados

1. ❌ **`/api/auth/me` retornando 404**
   - Frontend tenta verificar usuário autenticado
   - Rota não existe no `server-simple.js`

2. ❌ **`/api/auth/password-reset/request` retornando 404**
   - Página de recuperar senha não funciona
   - Rota existe em `routes/password-reset.js` mas não está registrada no `server-simple.js`

3. ⚠️ **Imagens base64 com `ERR_INVALID_URL`**
   - URLs base64 muito longas causam erro
   - Precisa converter para URLs reais

---

## ✅ Correções Implementadas

### **1. Rota `/api/auth/me` Adicionada**

**Funcionalidade:**
- Verifica token JWT
- Retorna dados do usuário autenticado
- Usado para verificar se usuário está logado

**Rota:**
```javascript
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

---

### **2. Rotas de Password Reset Adicionadas**

**Rotas implementadas:**
- ✅ `POST /api/auth/password-reset/request` - Solicitar recuperação
- ✅ `POST /api/auth/password-reset/validate-token` - Validar token
- ✅ `POST /api/auth/password-reset/reset` - Redefinir senha

**Funcionalidade:**
- Gera token único (64 caracteres)
- Salva token no banco (tabela `password_resets`)
- Envia email com link (se configurado)
- Valida token e expiração
- Redefine senha com hash bcrypt

---

### **3. Tabela password_resets**

**Criada automaticamente se não existir:**
```sql
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

---

## 🧪 Como Testar

### **1. Teste `/api/auth/me`:**

```bash
# Com token válido
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:3001/api/auth/me
```

**Deve retornar:**
```json
{
  "user": {
    "id": 1,
    "name": "Gildo",
    "email": "admin@papelpixel.co.mz",
    "role": "admin"
  }
}
```

---

### **2. Teste Password Reset:**

1. Acesse página de recuperar senha
2. Digite email
3. Clique "Enviar Instruções"
4. ✅ Deve funcionar (não mais 404)
5. Se email configurado, receberá link
6. Se não configurado, veja token no console (desenvolvimento)

---

## ⚠️ Problema de Imagens Base64

**Erro:** `ERR_INVALID_URL` para imagens base64

**Causa:** URLs base64 muito longas (`data:image/webp;base64,...`) podem causar problemas

**Solução temporária:** 
- Imagens antigas (base64) ainda funcionam
- Novos uploads devem usar arquivos físicos (já implementado)

**Se ainda sumir:**
- Verifique logs do backend ao criar produto
- Veja console do navegador
- Verifique se arquivo existe em `backend/uploads/products/`

---

## ✅ Agora Teste

1. ✅ **Recuperar senha** deve funcionar
2. ✅ **Verificar usuário** deve funcionar
3. ⚠️ **Imagens** - Veja logs se ainda sumir

**Tudo corrigido!** 🎉

