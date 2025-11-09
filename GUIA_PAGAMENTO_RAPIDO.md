# 🚀 Guia Rápido - Sistema de Pagamento

## ⚡ Início Rápido

### 1. Criar Tabela de Pagamentos

Execute no MySQL:

```bash
cd backend
mysql -u root -p papel_pixel < sql/create_payments_table.sql
```

Ou execute no MySQL Workbench:
```sql
-- Execute o arquivo backend/sql/create_payments_table.sql
```

### 2. Iniciar Backend

```bash
cd backend
npm install
npm start
```

### 3. Iniciar Frontend

```bash
npm run dev
```

---

## 🎯 Como Usar

### Para Clientes

1. **Adicionar produtos ao carrinho**
   - Vá para produtos
   - Clique em "Adicionar ao Carrinho"

2. **Ir para o checkout**
   - Clique no ícone do carrinho
   - Clique em "Ir para Checkout"

3. **Preencher dados**
   - Preencha endereço de entrega
   - Selecione método de pagamento

4. **Confirmar pagamento**
   - Clique em "Finalizar Pedido"
   - Complete o pagamento conforme o método escolhido

5. **Ver recibo**
   - Após confirmação, veja o recibo
   - Imprima ou baixe em PDF

---

## 💳 Métodos de Pagamento

### PayPal
- Cartão, débito ou saldo PayPal
- Processamento internacional
- Confirmação automática

### M-Pesa
- Notificação push no telefone
- Pagamento via PIN
- Confirmação por SMS

### EMOLA
- Gateway nacional
- Redirecionamento automático
- Confirmação imediata

### Mkesh
- Carteira digital
- Código de referência único
- Pagamento via app

### Cartão de Crédito/Débito
- Visa ou Mastercard
- Processamento seguro
- Proteção de dados

### Dinheiro na Entrega
- Pagamento na entrega
- Sem pagamento online
- Confirmação imediata

---

## 📁 Estrutura de Arquivos

```
backend/
├── routes/
│   └── payments.js          # Rotas de pagamento
├── sql/
│   ├── schema.sql            # Schema completo
│   └── create_payments_table.sql  # Apenas tabela de pagamentos
└── server.js                # Servidor principal

src/
├── services/
│   └── payments.ts           # Serviços de pagamento
├── pages/
│   ├── Checkout.tsx          # Página de checkout
│   ├── CheckoutSuccess.tsx   # Página de sucesso
│   └── PaymentReceipt.tsx    # Página de recibo
└── App.tsx                   # Rotas principais
```

---

## 🔧 API de Pagamento

### Endpoints Disponíveis

```javascript
// Criar pagamento PayPal
POST /api/payments/paypal/create

// Iniciar pagamento M-Pesa
POST /api/payments/mpesa/initiate

// Iniciar pagamento EMOLA
POST /api/payments/emola/initiate

// Iniciar pagamento Mkesh
POST /api/payments/mkesh/initiate

// Criar pagamento cartão
POST /api/payments/card/create

// Criar pedido à vista
POST /api/payments/cash/create

// Ver status do pagamento
GET /api/payments/status/:transactionId

// Confirmar pagamento (webhook)
POST /api/payments/confirm/:transactionId
```

### Exemplo de Uso

```typescript
import { initiatePayPalPayment } from '@/services/payments';

const paymentRequest = {
  amount: 1000,
  items: [
    { id: '1', name: 'Produto', price: 500, quantity: 2 }
  ],
  userId: '123',
  shippingInfo: {
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '+258841234567',
    address: 'Rua Principal, 123',
    city: 'Beira',
    province: 'Sofala'
  }
};

const result = await initiatePayPalPayment(paymentRequest);
console.log(result.transactionId);
```

---

## 🎨 Componentes

### Checkout.tsx
- Formulário de entrega
- Seleção de método de pagamento
- Processamento de pagamento
- Dialog de confirmação

### PaymentReceipt.tsx
- Recibo completo
- Detalhes da transação
- Informações de entrega
- Botões de impressão

---

## 🔒 Segurança

- ✅ Validação de formulários
- ✅ IDs de transação únicos
- ✅ Proteção de dados sensíveis
- ✅ Autenticação necessária
- ✅ HTTPS obrigatório em produção

---

## 📊 Status de Pagamento

```typescript
type PaymentStatus = 
  | 'pending'      // Aguardando pagamento
  | 'processing'   // Processando
  | 'completed'    // Concluído
  | 'confirmed'    // Confirmado (dinheiro na entrega)
  | 'failed'       // Falhou
  | 'cancelled'    // Cancelado
```

---

## 🐛 Troubleshooting

### Problema: Pagamento não funciona

**Solução:**
1. Verifique se o backend está rodando
2. Verifique as variáveis de ambiente
3. Verifique os logs do console

### Problema: Recibo não aparece

**Solução:**
1. Verifique se o `transactionId` foi salvo
2. Verifique o banco de dados
3. Veja os logs do backend

### Problema: Método de pagamento não disponível

**Solução:**
1. Verifique se a API está integrada
2. Em desenvolvimento, use métodos locais
3. Verifique a documentação da API

---

## 📞 Suporte

- 📧 Email: atendimento@papelepixel.co.mz
- 📱 WhatsApp: +258 874383621
- 📄 Documentação: Ver `SISTEMA_PAGAMENTO_COMPLETO.md`

---

## ✅ Checklist de Produção

- [ ] Criar tabela de pagamentos
- [ ] Configurar variáveis de ambiente
- [ ] Integrar APIs reais (PayPal, M-Pesa, etc.)
- [ ] Configurar webhooks
- [ ] Testar todos os métodos
- [ ] Configurar HTTPS
- [ ] Configurar email de confirmação
- [ ] Testar fluxo completo

---

**Criado para:** Papel & Pixel Store  
**Data:** 2025-01-09

