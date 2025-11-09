# 🔧 PLANO DE CORREÇÃO DO BACKEND - MySQL Relacional

## 🔍 PROBLEMAS IDENTIFICADOS

1. **Produtos somem ao atualizar/login**
   - Frontend usa Supabase/localStorage
   - Backend usa MySQL
   - **Não estão conectados!**

2. **Pedidos não aparecem**
   - Rotas existem, mas podem não estar salvando corretamente
   - Falta verificar relacionamentos

3. **Imagens não persistem**
   - Upload local pode estar sendo perdido
   - Falta integração com armazenamento

---

## ✅ SOLUÇÃO: Backend MySQL Independente

### **ETAPA 1: Verificar e Corrigir Schema**

O schema MySQL está correto, mas preciso garantir que:
- ✅ Relacionamentos estão funcionando
- ✅ Foreign keys estão ativas
- ✅ Campos estão mapeados corretamente

### **ETAPA 2: Criar Scripts de Teste**

Criar scripts para testar backend isoladamente:
- Testar conexão MySQL
- Testar CRUD de produtos
- Testar CRUD de pedidos
- Testar relacionamentos

### **ETAPA 3: Corrigir Controllers**

Garantir que controllers salvam corretamente no MySQL:
- `productsController.js`
- `ordersController.js`

### **ETAPA 4: Testar Endpoints**

Usar Postman ou curl para testar:
- POST /api/products (criar)
- GET /api/products (listar)
- GET /api/orders (listar)
- POST /api/orders (criar)

---

## 📋 PRÓXIMOS PASSOS

1. **Criar script de teste do backend**
2. **Corrigir controllers se necessário**
3. **Criar guia de teste completo**
4. **Depois conectar frontend ao backend MySQL**

---

**Vou criar os arquivos agora!**

