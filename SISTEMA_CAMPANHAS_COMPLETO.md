# 📧 Sistema de Campanhas Completo - Fluxo no Banco

## 🎯 FLUXO IMPLEMENTADO

### **1. Criar Campanha**

**Rota:** `POST /api/campaigns`

**Fluxo:**
```
Admin cria campanha
  ↓
Backend recebe (title, content)
  ↓
Salva na tabela `campaigns` com status='draft'
  ↓
Retorna campanha criada
```

**Exemplo:**
```bash
POST /api/campaigns
{
  "title": "Promoção de Verão",
  "content": "Descontos de até 50%!"
}

→ Resposta:
{
  "success": true,
  "campaign": {
    "id": 1,
    "title": "Promoção de Verão",
    "content": "Descontos de até 50%!",
    "status": "draft",
    "created_at": "2025-01-15T10:00:00"
  }
}
```

---

### **2. Selecionar Assinantes**

**Rota:** `GET /api/subscribers`

**Fluxo:**
```
Admin lista assinantes
  ↓
Backend busca da tabela `subscribers`
  ↓
Retorna lista com IDs, emails, nomes
```

**Exemplo:**
```bash
GET /api/subscribers

→ Resposta:
{
  "success": true,
  "count": 5,
  "subscribers": [
    { "id": 1, "email": "cliente1@exemplo.com", "name": "Cliente 1" },
    { "id": 2, "email": "cliente2@exemplo.com", "name": "Cliente 2" },
    ...
  ]
}
```

---

### **3. Enviar Campanha**

**Rota:** `POST /api/campaigns/:id/send`

**Fluxo:**
```
Admin seleciona campanha + assinantes
  ↓
Backend busca campanha na tabela `campaigns`
  ↓
Backend busca assinantes da tabela `subscribers` (selecionados ou todos)
  ↓
Para cada assinante:
  1. Cria registro em `email_sends` (status='pending')
  2. Envia email via SMTP (Gmail)
  3. Atualiza `email_sends`:
     - status='sent' + sent_at se sucesso
     - status='failed' + error_message se erro
  ↓
Atualiza campanha: status='sent', send_date, subscribers_count
  ↓
Retorna estatísticas
```

**Exemplo:**
```bash
POST /api/campaigns/1/send
{
  "subscriber_ids": [1, 2, 3]  # Vazio = todos
}

→ Resposta:
{
  "success": true,
  "message": "Campanha enviada para 3 assinantes!",
  "stats": {
    "total": 3,
    "sent": 3,
    "failed": 0
  }
}
```

---

## 📊 ESTRUTURA DO BANCO

### **Tabela: `campaigns`**

```sql
CREATE TABLE campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('draft', 'sent') DEFAULT 'draft',
  send_date TIMESTAMP NULL,
  subscribers_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id` - ID da campanha
- `title` - Título da campanha
- `content` - Conteúdo HTML/texto
- `status` - 'draft' (rascunho) ou 'sent' (enviada)
- `send_date` - Data/hora do envio
- `subscribers_count` - Quantos assinantes receberam
- `created_at` - Quando foi criada

---

### **Tabela: `subscribers`**

```sql
CREATE TABLE subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) DEFAULT 'Subscriber',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos:**
- `id` - ID do assinante
- `email` - Email único
- `name` - Nome do assinante
- `subscribed_at` - Data da inscrição

---

### **Tabela: `email_sends`** (Histórico)

```sql
CREATE TABLE email_sends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  subscriber_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  status ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending',
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  opened_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id) ON DELETE CASCADE
);
```

**Campos:**
- `id` - ID do envio
- `campaign_id` - ID da campanha (FK)
- `subscriber_id` - ID do assinante (FK)
- `email` - Email enviado (cópia)
- `status` - Status do envio
- `sent_at` - Quando foi enviado
- `error_message` - Erro se falhou
- `opened_at` - Quando foi aberto (futuro)
- `clicked_at` - Quando clicou (futuro)
- `created_at` - Quando foi criado

---

## 🔄 FLUXO COMPLETO NO BANCO

### **Passo 1: Criar Campanha**

```sql
-- Admin cria campanha
INSERT INTO campaigns (title, content, status) 
VALUES ('Promoção de Verão', 'Descontos de até 50%!', 'draft');

-- Resultado: campanha com id=1 criada
SELECT * FROM campaigns WHERE id = 1;
```

---

### **Passo 2: Listar Assinantes**

```sql
-- Buscar assinantes
SELECT id, email, name FROM subscribers ORDER BY subscribed_at DESC;

-- Resultado: lista de assinantes disponíveis
```

---

### **Passo 3: Enviar Campanha**

```sql
-- Para cada assinante selecionado:

-- 1. Criar registro de envio (pending)
INSERT INTO email_sends (campaign_id, subscriber_id, email, status)
VALUES (1, 1, 'cliente1@exemplo.com', 'pending');

-- 2. Enviar email via SMTP (Gmail)
-- [Código envia email]

-- 3a. Se sucesso:
UPDATE email_sends 
SET status = 'sent', sent_at = NOW() 
WHERE id = 1;

-- 3b. Se erro:
UPDATE email_sends 
SET status = 'failed', error_message = 'Erro SMTP' 
WHERE id = 1;

-- 4. Após todos enviados, atualizar campanha
UPDATE campaigns 
SET status = 'sent', send_date = NOW(), subscribers_count = 3 
WHERE id = 1;
```

---

## 📋 ROTAS DISPONÍVEIS

### **Campanhas:**

- ✅ `POST /api/campaigns` - Criar campanha (status='draft')
- ✅ `GET /api/campaigns` - Listar todas campanhas
- ✅ `GET /api/campaigns/:id` - Buscar campanha específica
- ✅ `POST /api/campaigns/:id/send` - Enviar campanha para assinantes
- ✅ `GET /api/campaigns/:id/sends` - Histórico de envios de uma campanha

### **Assinantes:**

- ✅ `POST /api/subscribers` - Inscrever na newsletter
- ✅ `GET /api/subscribers` - Listar todos assinantes (Admin)

---

## 🧪 TESTE COMPLETO

### **1. Criar Campanha:**

```bash
curl -X POST http://localhost:3001/api/campaigns \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Promoção de Verão",
    "content": "Descontos de até 50% em todos os produtos!"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "campaign": {
    "id": 1,
    "title": "Promoção de Verão",
    "status": "draft"
  }
}
```

---

### **2. Listar Assinantes:**

```bash
curl -X GET http://localhost:3001/api/subscribers \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

**Resposta:**
```json
{
  "success": true,
  "count": 5,
  "subscribers": [
    { "id": 1, "email": "cliente1@exemplo.com", "name": "Cliente 1" },
    ...
  ]
}
```

---

### **3. Enviar Campanha (Todos):**

```bash
curl -X POST http://localhost:3001/api/campaigns/1/send \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Ou Enviar para Selecionados:**

```bash
curl -X POST http://localhost:3001/api/campaigns/1/send \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber_ids": [1, 2, 3]
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Campanha enviada para 3 assinantes!",
  "stats": {
    "total": 3,
    "sent": 3,
    "failed": 0
  }
}
```

---

### **4. Ver Histórico:**

```bash
curl -X GET http://localhost:3001/api/campaigns/1/sends \
  -H "Authorization: Bearer TOKEN_ADMIN"
```

**Resposta:**
```json
{
  "success": true,
  "campaignId": 1,
  "stats": {
    "total": 3,
    "sent": 3,
    "failed": 0,
    "pending": 0
  },
  "sends": [
    {
      "id": 1,
      "email": "cliente1@exemplo.com",
      "status": "sent",
      "sent_at": "2025-01-15T10:30:00",
      "subscriber_name": "Cliente 1"
    },
    ...
  ]
}
```

---

## ✅ CHECKLIST DO FLUXO

- ✅ **Criar campanha** → Salva em `campaigns` (draft)
- ✅ **Listar assinantes** → Busca de `subscribers`
- ✅ **Enviar campanha** → Para cada assinante:
  - ✅ Cria registro em `email_sends` (pending)
  - ✅ Envia email via SMTP
  - ✅ Atualiza `email_sends` (sent/failed)
  - ✅ Atualiza `campaigns` (sent)
- ✅ **Histórico completo** → Tabela `email_sends` tem todos os envios

---

## 📊 LOGS DO BACKEND

**Ao criar campanha:**
```
✅ [CAMPAIGN] Campanha criada: 1
```

**Ao enviar:**
```
📧 [CAMPAIGN] Enviando campanha "Promoção de Verão" para 3 assinantes...
✅ [CAMPAIGN] Email enviado para cliente1@exemplo.com
✅ [CAMPAIGN] Email enviado para cliente2@exemplo.com
✅ [CAMPAIGN] Campanha enviada: 3 sucesso | 0 erros
```

---

## ✅ TUDO IMPLEMENTADO!

**Fluxo completo funcionando exatamente como você descreveu:**

1. ✅ Criar campanha → `campaigns`
2. ✅ Selecionar assinantes → `subscribers`
3. ✅ Enviar → Para cada um:
   - ✅ Envia email
   - ✅ Cria registro em `email_sends`
   - ✅ Atualiza status

**Próximo passo:** Teste com o frontend! 🚀

