# 🚀 **SETUP DO BANCO DE DADOS NO RAILWAY**

O servidor está rodando, mas o banco está vazio! Siga estes passos para criar todas as tabelas.

---

## 📋 **PASSO 1: VERIFICAR SE AS VARIÁVEIS ESTÃO CONFIGURADAS**

No Railway, serviço **"efficient-connection"**:

1. Clique em **"Variables"**
2. Verifique se estas variáveis existem:
   - ✅ `DB_HOST`
   - ✅ `DB_USER`
   - ✅ `DB_PASSWORD`
   - ✅ `DB_NAME`
   - ✅ `DB_PORT`

---

## 🔧 **PASSO 2: EXECUTAR O SCRIPT DE SETUP**

### **Opção A: Via Railway CLI (RECOMENDADO)**

1. **Instale o Railway CLI** (se ainda não tiver):
   ```bash
   npm install -g @railway/cli
   ```

2. **Faça login no Railway**:
   ```bash
   railway login
   ```

3. **Acesse o projeto**:
   ```bash
   railway link
   ```
   *(Selecione seu projeto "papel-pixel")*

4. **Execute o script de inicialização**:
   ```bash
   railway run npm run init-railway
   ```

---

### **Opção B: Executar Direto no Container do Railway**

1. **No Railway, vá para o serviço "efficient-connection"**
2. **Clique em "Settings" → "Deploy Logs"**
3. **Procure por um botão "Shell" ou "Console"**
4. **Se encontrar, execute**:
   ```bash
   npm run init-railway
   ```

---

### **Opção C: Usar MySQL Client Externo**

1. **Conecte-se ao MySQL do Railway usando as variáveis `MYSQL_PUBLIC_URL`**
2. **Copie todo o conteúdo do arquivo** `backend/sql/init_database.sql`
3. **Execute no seu cliente MySQL** (MySQL Workbench, DBeaver, etc)

---

## ✅ **PASSO 3: VERIFICAR SE DEU CERTO**

Após executar o script, você deve ver:

```
✅ Todas as tabelas foram criadas com sucesso!

📊 Verificando tabelas criadas...

Tabelas no banco de dados:
   ✓ 1. users
   ✓ 2. products
   ✓ 3. orders
   ✓ 4. order_items
   ✓ 5. coupons
   ✓ 6. abandoned_carts
   ✓ 7. newsletter_subscribers
   ✓ 8. marketing_campaigns
   ✓ 9. reviews
   ✓ 10. returns
   ✓ 11. notifications
   ✓ 12. payments
   ✓ 13. ab_test_variants
   ✓ 14. ab_test_events
   ✓ 15. favorites
```

---

## 🎯 **PASSO 4: TESTAR A API**

Depois que as tabelas forem criadas, teste:

```bash
# Substitua pela URL do seu backend no Railway
curl https://seu-backend.railway.app/api/products
```

Deve retornar:
```json
[]
```

*(Lista vazia, mas SEM erro!)*

---

## 🚨 **PROBLEMAS?**

### **Erro: "command not found: railway"**
- Instale o Railway CLI: `npm install -g @railway/cli`

### **Erro: "Not authenticated"**
- Execute: `railway login`

### **Erro: "Connection timeout"**
- Verifique se as variáveis `DB_HOST`, `DB_USER`, etc estão corretas

### **Não consegue acessar o shell do Railway?**
- Use a **Opção C** (cliente MySQL externo)
- O arquivo SQL está em: `backend/sql/init_database.sql`

---

## 📞 **PRECISA DE AJUDA?**

Me envie:
1. Print da aba **"Variables"** do serviço
2. Logs do comando que você tentou executar
3. Mensagem de erro (se houver)

---

**Boa sorte! 🚀**

