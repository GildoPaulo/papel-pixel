# 🔧 Correção dos Problemas do Backend

## 🐛 PROBLEMAS IDENTIFICADOS

1. **Produtos somem ao atualizar/login**
   - ❌ Frontend usa **Supabase** (nuvem)
   - ❌ Backend usa **MySQL** (local)
   - ❌ **NÃO ESTÃO CONECTADOS!**

2. **Pedidos não aparecem**
   - Rotas existem no backend
   - Mas frontend não está chamando corretamente
   - Ou pedidos não estão sendo salvos

3. **Imagens não persistem**
   - Upload local pode estar sendo perdido
   - Falta integração adequada

---

## ✅ SOLUÇÃO: Trabalhar Backend Separadamente

### **PASSO 1: Verificar Banco de Dados**

```bash
# Conectar ao MySQL
mysql -u root -p papel_pixel

# Verificar tabelas
SHOW TABLES;

# Ver produtos
SELECT * FROM products;

# Ver pedidos
SELECT * FROM orders;
SELECT * FROM order_items;
```

### **PASSO 2: Testar Backend Sozinho**

#### Opção A: Script Automático

```bash
# Na pasta raiz do projeto
node backend/scripts/test-backend.js
```

#### Opção B: Teste Manual (cURL)

**1. Verificar servidor:**
```bash
curl http://localhost:3001/
```

**2. Listar produtos:**
```bash
curl http://localhost:3001/api/products
```

**3. Criar produto (precisa de token de admin):**
```bash
# Primeiro fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@papelpixel.co.mz","password":"admin123"}'

# Copiar o token e usar aqui:
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name": "Teste Produto",
    "category": "Papelaria",
    "price": 50.00,
    "stock": 10
  }'
```

**4. Verificar no banco:**
```sql
SELECT * FROM products WHERE name LIKE '%Teste%';
```

### **PASSO 3: Corrigir Relacionamentos**

Se pedidos não aparecem, verifique:

```sql
-- Ver todos os pedidos
SELECT * FROM orders;

-- Ver pedidos com itens
SELECT 
  o.id,
  o.total,
  o.status,
  oi.product_id,
  oi.quantity,
  p.name as product_name
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id;
```

---

## 🔗 DEPOIS: Conectar Frontend ao Backend

**Quando backend estiver funcionando:**

1. **Remover Supabase** do frontend
2. **Atualizar ProductsContext** para usar backend MySQL
3. **Atualizar OrdersContext** para usar backend MySQL
4. **Testar fluxo completo**

---

## 📝 Checklist de Teste

**Backend MySQL:**
- [ ] MySQL rodando
- [ ] Banco `papel_pixel` existe
- [ ] Tabelas criadas
- [ ] Servidor backend rodando (`npm run dev`)
- [ ] GET /api/products funciona
- [ ] POST /api/products funciona
- [ ] Produtos persistem no MySQL
- [ ] GET /api/orders funciona
- [ ] POST /api/orders funciona
- [ ] Pedidos persistem no MySQL

**Depois:**
- [ ] Conectar frontend ao backend MySQL
- [ ] Remover Supabase/localStorage
- [ ] Testar fluxo completo

---

## 🚀 COMO TESTAR AGORA

1. **Inicie o backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Em outro terminal, execute o teste:**
   ```bash
   node backend/scripts/test-backend.js
   ```

3. **Veja os resultados e me informe!**

---

**Execute os testes e me diga o que aconteceu!**

