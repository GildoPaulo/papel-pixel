# 🧪 Guia de Teste - Novas Funcionalidades

## ✅ Funcionalidades Implementadas

1. **Salvamento Automático de Carrinho**
2. **Dashboard de Analytics**
3. **A/B Testing de Cupons**

---

## 1️⃣ Testar Salvamento Automático de Carrinho

### Teste Básico

1. **Abrir o site como visitante** (não logado)
   ```
   http://localhost:8080
   ```

2. **Adicionar produtos ao carrinho**
   - Adicione 2-3 produtos diferentes
   - Aguarde 2 segundos

3. **Verificar no console do navegador:**
   ```
   ✅ Carrinho salvo no backend para rastreamento
   ```

4. **Verificar no banco de dados:**
   ```sql
   SELECT * FROM abandoned_carts 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```
   ✅ Deve aparecer o carrinho recém-criado

### Teste com Usuário Logado

1. **Fazer login**
2. **Adicionar produtos ao carrinho**
3. **Fechar navegador**
4. **Abrir novamente e fazer login**
   - ✅ Carrinho deve estar preservado!

---

## 2️⃣ Testar Dashboard de Analytics

### Passo a Passo

1. **Login como Admin**
   ```
   http://localhost:8080/admin
   ```

2. **Ir para aba "Analytics"**
   - Clique na nova aba "Analytics" no topo

3. **Verificar Cards de Estatísticas**
   - ✅ Carrinhos Ativos
   - ✅ Recuperados  
   - ✅ Valor Total
   - ✅ Emails Enviados

4. **Verificar Gráfico de Pizza**
   - ✅ Taxa de recuperação visualizada
   - ✅ Legenda com cores

5. **Verificar Lista de Carrinhos**
   - ✅ Últimos 10 carrinhos
   - ✅ Informações do cliente
   - ✅ Status (Ativo/Recuperado)

6. **Testar Botão "Enviar Emails"**
   - Clique em "Enviar Emails"
   - ✅ Deve processar carrinhos e enviar emails

7. **Testar Botão "Atualizar"**
   - ✅ Recarrega dados

---

## 3️⃣ Testar A/B Testing de Cupons

### Verificar Inicialização

1. **Parar e reiniciar o backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Verificar no console:**
   ```
   ✅ [A/B TEST] Tabelas de experimento criadas/verificadas
   ✅ [A/B TEST] Variantes inicializadas
   ```

3. **Verificar no banco de dados:**
   ```sql
   SELECT * FROM ab_test_experiments;
   ```
   ✅ Deve ter 5 variantes (10%, 15%, 20%, FRETE GRÁTIS, 50 MZN)

### Testar Seleção de Variantes

1. **Criar carrinho abandonado manualmente:**
   ```sql
   INSERT INTO abandoned_carts (email, cart_items, total, last_activity)
   VALUES (
     'teste@email.com',
     '[{"id":1,"name":"Produto Teste","price":100,"quantity":1}]',
     100.00,
     NOW() - INTERVAL 25 HOUR
   );
   ```

2. **Processar carrinhos (Admin → Analytics → Enviar Emails)**
   - Ou via API:
   ```bash
   POST http://localhost:3001/api/abandoned-carts/process
   ```

3. **Verificar no console do backend:**
   ```
   🎟️ [ABANDONED CART] Cupom A/B criado: VOLTA10-XXX (10% OFF)
   📊 [A/B TEST] Email registrado: Variante 1
   ```

4. **Verificar cupom criado:**
   ```sql
   SELECT * FROM coupons 
   WHERE code LIKE 'VOLTA%' OR code LIKE 'FRETE%'
   ORDER BY created_at DESC;
   ```

### Ver Relatório de A/B Testing

1. **Admin → Analytics → Scroll para baixo**
   - Seção "A/B Testing - Cupons de Recuperação"

2. **Verificar Tabela:**
   - ✅ Todas as 5 variantes listadas
   - ✅ Contadores: Emails, Cupons Usados, Conversões
   - ✅ Taxa de Conversão calculada
   - ✅ Receita Total

3. **Verificar "Melhor Performer":**
   - ✅ Após ≥10 emails, mostra o vencedor em destaque

4. **Testar Botão "Reiniciar":**
   - ✅ Zera todos os contadores
   - ✅ Pede confirmação antes

### Simular Conversão Completa

1. **Criar carrinho → Enviar email → Usar cupom:**

   ```sql
   -- 1. Inserir carrinho
   INSERT INTO abandoned_carts (email, cart_items, total, last_activity)
   VALUES ('conversao@test.com', '[{"id":1,"name":"Teste","price":200,"quantity":1}]', 200.00, NOW() - INTERVAL 25 HOUR);
   ```

2. **Processar emails** (Admin ou API)

3. **Registrar que o cupom foi usado:**
   ```bash
   POST http://localhost:3001/api/ab-testing/record/coupon-used
   {
     "couponCode": "VOLTA10-XXXXX",
     "revenue": 0
   }
   ```

4. **Registrar conversão (compra completa):**
   ```bash
   POST http://localhost:3001/api/ab-testing/record/conversion
   {
     "couponCode": "VOLTA10-XXXXX",
     "revenue": 180.00
   }
   ```

5. **Atualizar Analytics:**
   - ✅ Contador de "Conversões" aumentou
   - ✅ Taxa de Conversão recalculada
   - ✅ Receita Total atualizada

---

## ✅ Checklist Completo

### Frontend
- [ ] Carrinho salva automaticamente (ver console)
- [ ] Carrinho persiste após fechar navegador
- [ ] Aba "Analytics" aparece no Admin
- [ ] Dashboard mostra estatísticas corretas
- [ ] Gráficos renderizam corretamente
- [ ] Botões funcionam (Atualizar, Enviar Emails)

### Backend
- [ ] Tabelas criadas ao iniciar servidor
- [ ] Endpoint `/api/abandoned-carts/save` funciona
- [ ] Endpoint `/api/ab-testing/report` funciona
- [ ] Variantes inicializadas no banco
- [ ] Cupons criados com variantes diferentes
- [ ] Emails enviados com cupons corretos

### A/B Testing
- [ ] Sistema escolhe variantes automaticamente
- [ ] Eventos registrados (email_sent, coupon_used, conversion)
- [ ] Taxa de conversão calculada corretamente
- [ ] Relatório mostra dados em tempo real
- [ ] Algoritmo Epsilon-Greedy funcionando (80/20)
- [ ] Melhor variante destacada após ≥10 emails

### Integração
- [ ] Carrinho → Email → Cupom → Conversão (fluxo completo)
- [ ] Analytics atualiza em tempo real
- [ ] A/B Testing escolhe melhor cupom automaticamente
- [ ] Dados sincronizados entre frontend e backend

---

## 🐛 Troubleshooting

### Erro: "Carrinho não salva"
✅ **Solução:** Verificar se endpoint `/api/abandoned-carts/save` existe e está respondendo

### Erro: "Analytics não carrega"
✅ **Solução:** Verificar token de autenticação e permissão de admin

### Erro: "Variantes não aparecem"
✅ **Solução:** Reiniciar backend para inicializar tabelas

### Erro: "Cupons todos iguais"
✅ **Solução:** Aguardar mais emails (Epsilon-Greedy explora 20% do tempo)

---

## 🎉 Sucesso!

Se todos os testes passaram, as **3 novas funcionalidades** estão funcionando perfeitamente:

1. ✅ **Salvamento Automático** - Carrinhos sincronizados
2. ✅ **Analytics Dashboard** - Métricas em tempo real  
3. ✅ **A/B Testing** - Otimização automática de cupons

**Sistema Completo e Pronto para Produção!** 🚀

---

**Documentação Completa:** `GUIA_COMPLETO_SISTEMA.md`

