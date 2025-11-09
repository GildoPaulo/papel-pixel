# 🔍 Guia de Diagnóstico: Password Reset

## 🐛 Problema Relatado

- ❌ Não recebeu email de recuperação de senha
- ❌ Nenhum registro na tabela `password_resets`

---

## ✅ SOLUÇÃO IMPLEMENTADA

### **1. Logs Detalhados Adicionados**

Agora o backend mostra logs completos:

```
📝 [PASSWORD RESET] Criando tabela se não existir...
✅ [PASSWORD RESET] Tabela verificada/criada
🧹 [PASSWORD RESET] Tokens antigos removidos: 0
💾 [PASSWORD RESET] Inserindo token no banco...
✅ [PASSWORD RESET] Token salvo com sucesso! ID: 1
🔍 [PASSWORD RESET] Token verificado no banco: SIM
📧 [PASSWORD RESET] Preparando envio de email...
✅ [PASSWORD RESET] Email enviado com sucesso para: email@exemplo.com
```

---

### **2. Script SQL Criado**

Arquivo: `backend/sql/create_password_resets_table.sql`

**Execute no MySQL:**

```sql
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

---

## 🔍 COMO DIAGNOSTICAR

### **1. Verificar se Tabela Existe:**

```sql
SHOW TABLES LIKE 'password_resets';
```

**Se não existir, execute:**
```bash
mysql -u root -p papel_pixel < backend/sql/create_password_resets_table.sql
```

Ou execute o SQL manualmente no MySQL.

---

### **2. Testar Requisição:**

```bash
curl -X POST http://localhost:3001/api/auth/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"gildopaulovictor@gmail.com"}'
```

**Veja os logs no terminal do backend!**

**Deve mostrar:**
- ✅ Tabela criada/verificada
- ✅ Token inserido
- ✅ Email enviado (ou erro de configuração)

---

### **3. Verificar Registros no Banco:**

```sql
SELECT * FROM password_resets ORDER BY created_at DESC LIMIT 10;
```

**Se não houver registros, o erro será logado!**

---

### **4. Verificar Configuração de Email:**

**Veja o console do backend ao iniciar:**

```
✅ Email configurado com sucesso!
   Host: smtp.gmail.com
   User: seu_email@gmail.com
```

**OU:**

```
❌ Email não configurado ou credenciais inválidas
   Erro: Invalid login
   💡 Configure EMAIL_USER e EMAIL_PASS no arquivo .env
```

---

### **5. Testar Envio de Email Manual:**

**Se email configurado, teste direto:**

```bash
# Se estiver usando nodemailer
node -e "
const email = require('./backend/config/email');
email.sendEmail(
  'gildopaulovictor@gmail.com',
  email.emailTemplates.passwordReset,
  { name: 'Teste', resetLink: 'http://localhost:8080/reset-password?token=test' }
).then(r => console.log(r)).catch(e => console.error(e));
"
```

---

## ⚠️ PROBLEMAS COMUNS

### **1. Tabela não existe:**

**Sintoma:** Erro no log: `Table 'papel_pixel.password_resets' doesn't exist`

**Solução:** Execute o SQL de criação acima

---

### **2. Email não configurado:**

**Sintoma:** Log mostra: `⚠️ [PASSWORD RESET] Email não configurado`

**Solução:** Configure `backend/.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gildopaulovictor@gmail.com
EMAIL_PASS=sua_senha_de_app
```

**Para Gmail:** Use "Senha de App" (Google Account → Segurança → Senhas de App)

---

### **3. Email vai para Spam:**

**Sintoma:** Email enviado mas não chega na inbox

**Solução:**
- Verifique pasta de Spam
- Configure SPF/DKIM no domínio (se usar domínio próprio)
- Use email de confiança (Gmail funciona bem)

---

### **4. Erro ao inserir token:**

**Sintoma:** Log mostra: `❌ [PASSWORD RESET] Erro ao salvar token`

**Possíveis causas:**
- Foreign key constraint (usuário não existe)
- Token duplicado (muito raro)
- Problema de conexão MySQL

**Verifique:**
```sql
SELECT * FROM users WHERE email = 'gildopaulovictor@gmail.com';
```

---

## ✅ PRÓXIMOS PASSOS

1. **Execute o SQL para criar a tabela** (se não existir)
2. **Configure email no `.env`** (se não configurado)
3. **Reinicie o backend** para ver novos logs
4. **Teste recuperação de senha** e veja os logs
5. **Verifique banco:** `SELECT * FROM password_resets;`

---

## 📊 LOGS ESPERADOS (SUCESSO)

```
📝 [PASSWORD RESET] Criando tabela se não existir...
✅ [PASSWORD RESET] Tabela verificada/criada
🧹 [PASSWORD RESET] Tokens antigos removidos: 2
💾 [PASSWORD RESET] Inserindo token no banco... { user_id: 7, token_length: 64, expires_at: ... }
✅ [PASSWORD RESET] Token salvo com sucesso! ID: 5
🔍 [PASSWORD RESET] Token verificado no banco: SIM
📧 [PASSWORD RESET] Preparando envio de email... { to: 'gildopaulovictor@gmail.com', ... }
📧 [PASSWORD RESET] Serviço de email encontrado, enviando...
✅ Email enviado: <message-id>
✅ [PASSWORD RESET] Email enviado com sucesso para: gildopaulovictor@gmail.com
✅ [PASSWORD RESET] MessageId: <message-id>
```

---

## 🚨 LOGS DE ERRO (AJUSTE)

**Se ver estes logs, siga as soluções:**

```
❌ [PASSWORD RESET] Erro ao salvar token: ...
```
→ Verifique conexão MySQL e se tabela existe

```
⚠️ [PASSWORD RESET] Email não configurado
```
→ Configure EMAIL_USER e EMAIL_PASS

```
❌ [PASSWORD RESET] Erro ao enviar email: Invalid login
```
→ Use "Senha de App" do Gmail, não a senha normal

---

**Tudo documentado! Agora você pode diagnosticar o problema facilmente!** 🔍

