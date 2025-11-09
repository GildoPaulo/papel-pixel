# 🚀 Guia de Configuração - RIHA Payment Gateway

Este guia explica como configurar a integração com a RIHA, o gateway de pagamentos de Moçambique.

## 📋 Pré-requisitos

1. Conta na RIHA (https://riha.co.mz)
2. API Key da RIHA
3. Backend rodando

## 🔧 Configuração

### 1. Obter API Key

1. Acesse o dashboard da RIHA (https://riha.co.mz)
2. Vá em "Settings" (Configurações)
3. Gere uma nova API Key
4. Copie a chave (você não poderá vê-la novamente)

### 2. Configurar Variáveis de Ambiente

Adicione no arquivo `.env` do backend (ou crie se não existir):

```bash
# RIHA Payment Gateway
RIHA_API_KEY=sua_api_key_aqui

# URLs do seu sistema
API_URL=http://localhost:3001/api  # ou https://seu-dominio.com/api
FRONTEND_URL=http://localhost:8080  # ou https://seu-dominio.com
```

### 3. Webhook URL

Configure o webhook da RIHA para apontar para:
```
https://seu-dominio.com/api/payments/riha/webhook
```

**Importante:** Para desenvolvimento local, use um serviço de tunneling como:
- ngrok: `ngrok http 3001`
- localtunnel: `lt --port 3001`

Depois use a URL gerada: `https://xxxx.ngrok.io/api/payments/riha/webhook`

## 🎯 Como Funciona

### Fluxo de Pagamento

1. **Cliente escolhe "RIHA"** no checkout
2. **Backend cria pedido** no banco de dados (status: `pending`)
3. **Backend cria payment link** na RIHA via API
4. **Cliente é redirecionado** para o checkout da RIHA
5. **Cliente paga** na plataforma da RIHA
6. **RIHA envia webhook** para o seu backend
7. **Backend atualiza** status do pedido para `confirmed` e `paid`
8. **Estoque é reduzido** automaticamente
9. **Emails são enviados** para admin e cliente

### Proteção Escrow

A integração habilita automaticamente a proteção Escrow para produtos físicos:
- Fundos ficam retidos até confirmação de entrega
- SLA de 7 dias úteis configurado
- Proteção para comprador e vendedor

## 🧪 Testando

### Modo Desenvolvimento

1. Certifique-se que o backend está rodando:
```bash
cd backend
node server-simple.js
```

2. Configure a variável `RIHA_API_KEY` no `.env`

3. Faça um teste de compra pelo frontend

4. Verifique os logs do backend:
```
💰 [RIHA] Criando payment link via RIHA...
✅ [RIHA] Payment link criado: 550e8400-e29b-41d4-a716-446655440000
📩 [RIHA WEBHOOK] Recebido: {...}
✅ [RIHA WEBHOOK] Pedido X confirmado
```

### Sandbox Mode

A RIHA oferece modo sandbox para testes. Use a API Key do sandbox nos testes.

## 📊 Status dos Pagamentos

Os pagamentos podem ter os seguintes status:

- `pending`: Aguardando pagamento
- `paid`: Pagamento confirmado
- `failed`: Pagamento falhou
- `cancelled`: Pagamento cancelado
- `refunded`: Reembolsado

## 🔒 Segurança

- **Nunca** commite a API Key no git
- Use `.env` e adicione no `.gitignore`
- Use HTTPS em produção
- Configure webhooks apenas para URLs seguras

## 🆘 Problemas Comuns

### Erro: "RIHA API key não configurada"

**Solução:** Configure a variável `RIHA_API_KEY` no arquivo `.env`

### Webhook não está recebendo notificações

**Verificar:**
1. URL do webhook está configurada corretamente na RIHA
2. Backend está acessível publicamente (use ngrok para local)
3. Endpoint retorna status 200
4. Verifique logs do backend

### Pagamento criado mas pedido não confirmado

**Verificar:**
1. Logs do webhook no backend
2. Se a RIHA está enviando o evento `payment.completed`
3. Se o metadata contém `order_id`

## 📚 Documentação

- API Docs: https://riha.co.mz/api/docs
- Dashboard: https://riha.co.mz/dashboard

## ✅ Checklist de Implantação

- [ ] Conta na RIHA criada
- [ ] API Key obtida
- [ ] Variável `RIHA_API_KEY` configurada
- [ ] Webhook URL configurada na RIHA
- [ ] Backend acessível publicamente (ou ngrok em dev)
- [ ] Testado em modo sandbox
- [ ] Testado em produção

## 🎉 Pronto!

Sua loja está integrada com a RIHA Payment Gateway! Os clientes podem pagar de forma segura e você terá controle total sobre os pagamentos.

