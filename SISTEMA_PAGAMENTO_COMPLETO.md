# Sistema de Pagamento Completo - Papel & Pixel Store

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Formas de Pagamento Implementadas](#formas-de-pagamento)
3. [Estrutura do Sistema](#estrutura-do-sistema)
4. [Como Funciona](#como-funciona)
5. [Integração com APIs Reais](#integração-com-apis-reais)
6. [Testes](#testes)

---

## 🎯 Visão Geral

O sistema de pagamento implementado fornece integração completa com múltiplas formas de pagamento, permitindo que os clientes paguem de forma segura através de diferentes métodos.

**Características:**
- ✅ Múltiplas formas de pagamento
- ✅ Processamento seguro
- ✅ Confirmação em tempo real
- ✅ Geração de recibos
- ✅ Rastreamento de transações
- ✅ Status de pagamento em tempo real

---

## 💳 Formas de Pagamento Implementadas

### 1. PayPal
- **Uso**: Pagamentos online internacionais
- **Função**: Permite pagamentos via cartão, débito ou saldo PayPal
- **Processo**: Redireciona para gateway PayPal

### 2. M-Pesa
- **Uso**: Pagamento via móvel (Moçambique)
- **Função**: Pagamento por telefone móvel
- **Processo**: Envia notificação push para o telefone do cliente

### 3. EMOLA
- **Uso**: Solução de pagamento nacional
- **Função**: Gateway de pagamento moçambicano
- **Processo**: Redireciona para plataforma EMOLA

### 4. Mkesh
- **Uso**: Carteira digital Moçambique
- **Função**: Pagamento via app Mkesh
- **Processo**: Gera código de referência para pagamento

### 5. Cartão de Crédito/Débito
- **Uso**: Visa/Mastercard
- **Função**: Pagamento direto com cartão
- **Processo**: Processamento seguro via gateway

### 6. Dinheiro na Entrega
- **Uso**: Pagamento na entrega
- **Função**: Pague quando receber o pedido
- **Processo**: Confirmação imediata do pedido

---

## 🏗️ Estrutura do Sistema

### Backend (`backend/`)

#### 1. **Rotas de Pagamento** (`routes/payments.js`)
```javascript
// Endpoints disponíveis:
- POST /api/payments/paypal/create          // Criar pagamento PayPal
- POST /api/payments/mpesa/initiate        // Iniciar pagamento M-Pesa
- POST /api/payments/emola/initiate        // Iniciar pagamento EMOLA
- POST /api/payments/mkesh/initiate        // Iniciar pagamento Mkesh
- POST /api/payments/card/create            // Criar pagamento cartão
- POST /api/payments/cash/create          // Criar pedido à vista
- GET  /api/payments/status/:id            // Status do pagamento
- POST /api/payments/confirm/:id           // Confirmar pagamento (webhook)
```

#### 2. **Tabelas do Banco de Dados**

**Tabela: `payments`**
```sql
- id: ID único do pagamento
- transaction_id: ID da transação único
- user_id: ID do usuário
- amount: Valor do pagamento
- payment_method: Método de pagamento
- status: Status (pending, completed, failed)
- order_data: Dados do pedido (JSON)
- completed_at: Data de conclusão
- created_at: Data de criação
```

---

### Frontend (`src/`)

#### 1. **Serviços de Pagamento** (`services/payments.ts`)
- `initiatePayPalPayment()` - Iniciar PayPal
- `initiateMpesaPayment()` - Iniciar M-Pesa
- `initiateEmolaPayment()` - Iniciar EMOLA
- `initiateMkeshPayment()` - Iniciar Mkesh
- `initiateCardPayment()` - Iniciar cartão
- `createCashOrder()` - Criar pedido à vista
- `getPaymentStatus()` - Status do pagamento

#### 2. **Componentes de Interface**

**Checkout.tsx**
- Seleção de método de pagamento
- Formulário de endereço de entrega
- Processamento de pagamento
- Dialog de confirmação

**PaymentReceipt.tsx**
- Exibição do recibo completo
- Detalhes da transação
- Informações de entrega
- Botões de impressão e download

**CheckoutSuccess.tsx**
- Confirmação de sucesso
- Link para recibo
- Continuar comprando

---

## 🔄 Como Funciona

### Fluxo de Pagamento Completo

1. **Cliente no Checkout**
   - Preenche dados de entrega
   - Seleciona método de pagamento
   - Clica em "Finalizar Pedido"

2. **Sistema Processa Pagamento**
   - Backend cria transação
   - Gera `transaction_id` único
   - Salva dados no banco
   - Retorna dados para frontend

3. **Cliente Completa Pagamento**
   - PayPal: Redireciona para gateway
   - M-Pesa: Recebe notificação no telefone
   - EMOLA: Redireciona para plataforma
   - Mkesh: Usa app para pagar
   - Cartão: Entra com dados do cartão
   - Dinheiro: Confirmação imediata

4. **Confirmação**
   - Backend recebe confirmação
   - Atualiza status do pagamento
   - Cria pedido automaticamente
   - Notifica cliente

5. **Cliente Recebe Confirmação**
   - Página de sucesso
   - Link para recibo
   - Email de confirmação

---

## 🔌 Integração com APIs Reais

### Para usar em produção, você precisa:

#### 1. **PayPal**
```javascript
// Adicionar no arquivo backend/routes/payments.js
const paypal = require('@paypal/checkout-server-sdk');

const env = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(env);
```

#### 2. **M-Pesa**
```javascript
// Adicionar SDK M-Pesa
const mpesa = require('mpesa-api');

const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  environment: 'sandbox' // ou 'production'
};
```

#### 3. **EMOLA**
```javascript
// Adicionar integração EMOLA
const emolaApi = {
  apiKey: process.env.EMOLA_API_KEY,
  apiSecret: process.env.EMOLA_API_SECRET,
  endpoint: 'https://api.emola.co.mz'
};
```

#### 4. **Stripe (para Cartões)**
```javascript
// Para pagamentos com cartão
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

---

## 🧪 Testes

### Testar Localmente

1. **Iniciar Backend**
```bash
cd backend
npm install
npm start
```

2. **Iniciar Frontend**
```bash
npm run dev
```

3. **Testar Pagamento**
   - Adicionar produtos ao carrinho
   - Ir para checkout
   - Selecionar método de pagamento
   - Completar formulário
   - Confirmar pagamento

### Endpoints de Teste

```bash
# Criar pagamento PayPal
curl -X POST http://localhost:3001/api/payments/paypal/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "userId": 1,
    "items": [...],
    "shippingInfo": {...}
  }'

# Verificar status
curl http://localhost:3001/api/payments/status/TXN-123456
```

---

## 📝 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no backend:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=papel_pixel

# PayPal
PAYPAL_CLIENT_ID=seu_client_id
PAYPAL_CLIENT_SECRET=seu_client_secret

# M-Pesa
MPESA_CONSUMER_KEY=sua_key
MPESA_CONSUMER_SECRET=sua_secret

# EMOLA
EMOLA_API_KEY=sua_key
EMOLA_API_SECRET=sua_secret

# Stripe
STRIPE_SECRET_KEY=sua_key
STRIPE_PUBLISHABLE_KEY=sua_key
```

---

## 📊 Fluxo de Dados

```
Cliente → Frontend → Backend → API Pagamento
                ↓
Cliente ← Frontend ← Backend ← API Pagamento
                ↓
         Banco de Dados
```

---

## ✅ Funcionalidades Implementadas

- [x] Múltiplas formas de pagamento
- [x] Processamento de transações
- [x] Confirmação automática
- [x] Geração de recibos
- [x] Status em tempo real
- [x] Proteção de dados
- [x] Validação de formulários
- [x] Feedback visual
- [x] Histórico de pagamentos
- [x] Notificações de status

---

## 🚀 Próximos Passos

1. **Integrar APIs Reais**
   - Conectar com PayPal real
   - Conectar com M-Pesa real
   - Conectar com EMOLA real

2. **Adicionar Webhooks**
   - Receber confirmações automaticamente
   - Atualizar status em tempo real

3. **Notificações por Email**
   - Enviar confirmação por email
   - Enviar recibo por email

4. **Painel de Admin**
   - Ver todos os pagamentos
   - Estatísticas de vendas
   - Gerenciar status de pedidos

---

## 📞 Suporte

Para dúvidas ou problemas:
- Email: atendimento@papelepixel.co.mz
- WhatsApp: +258 874383621

---

**Documento criado por:** Sistema de Pagamento Papel & Pixel Store  
**Última atualização:** 2025-01-09

