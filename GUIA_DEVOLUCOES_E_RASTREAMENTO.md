# 📦 GUIA COMPLETO: DEVOLUÇÕES E RASTREAMENTO

## 🔄 Como Fazer Devolução de Materiais

### 📍 Onde o Usuário Deve Ir:

1. **Página de Devoluções** (`/returns`)
   - Acesse através do menu do perfil: "Devoluções"
   - Ou diretamente pela URL: `http://localhost:8080/returns`
   - Ou pelo Footer: link "Política de Devolução"

2. **Passo a Passo:**

   **Passo 1:** Selecione um pedido
   - Na seção "Meus Pedidos", escolha o pedido que deseja devolver
   - Apenas pedidos com status diferente de "Cancelado" podem ser devolvidos

   **Passo 2:** Clique em "Solicitar Devolução"
   - Botão disponível na tabela de pedidos
   - Abrirá um dialog para informar o motivo

   **Passo 3:** Preencha o motivo
   - Descreva por que deseja devolver o produto
   - A política de devolução é exibida no dialog

   **Passo 4:** Aguarde análise
   - A solicitação será analisada em até 48h
   - Status pode ser visto em "Minhas Solicitações de Devolução"

   **Passo 5:** Após aprovação
   - Receba instruções de envio
   - Envie o produto de volta
   - Aguarde o reembolso após recebimento

---

## 📍 Sistema de Rastreamento de Produtos

### ✅ Funcionalidades Implementadas:

1. **Rastreamento por Número de Pedido**
   - Acesse: `/tracking` ou `/tracking/123` (número do pedido)
   - Busca por número de pedido
   - Visualização de timeline completa

2. **Onde Rastrear:**
   - **Menu do Usuário** no Header: "Rastrear Pedido"
   - **Página de Pedidos** no Profile: botão "Rastrear" em cada pedido
   - **Página de Devoluções**: botão "Rastrear" em cada pedido
   - **URL Direta**: `/tracking/123` (substitua 123 pelo número do pedido)

3. **O que Você Vê:**
   - ✅ Status atual do pedido
   - ✅ Timeline completa de eventos
   - ✅ Localização de cada evento
   - ✅ Data e hora de cada atualização
   - ✅ Previsão de entrega

4. **Estados do Pedido:**
   - 🔴 **Pendente**: Pedido recebido, aguardando confirmação
   - 🔵 **Confirmado**: Pedido confirmado e em preparação
   - 🟣 **Em Processamento**: Produto sendo preparado para envio
   - 🟠 **Enviado**: Produto saiu para entrega
   - 🟢 **Entregue**: Produto entregue com sucesso
   - ⚫ **Cancelado**: Pedido cancelado

---

## 🔔 Notificações Automáticas

### ✅ Quando o Usuário é Lembrado:

1. **Ícone de Notificação** (sino no Header)
   - Aparece quando há novas atualizações
   - Badge vermelho com número de não lidas

2. **Notificações Automáticas:**
   - ✅ **Pedido Confirmado**: Quando o pedido é confirmado
   - ✅ **Pedido Enviado**: Quando o produto é enviado (simulado após 2 dias)
   - ✅ **Pedido Entregue**: Quando o produto chega (simulado após 5 dias)

3. **Como Funciona:**
   - Verificação automática a cada 30 segundos
   - Toast notification quando há atualizações importantes
   - Dropdown com todas as notificações
   - Clique para ir direto ao rastreamento

4. **Visualização:**
   - Notificações não lidas em azul claro
   - Ícone verde para entregas
   - Ícone azul para envios
   - Data e hora de cada notificação

---

## 📋 Resumo das Funcionalidades:

### ✅ Devoluções:
- ✅ Página dedicada `/returns`
- ✅ Seleção de pedidos para devolução
- ✅ Formulário de motivo
- ✅ Acompanhamento de status
- ✅ Reembolso automático após aprovação

### ✅ Rastreamento:
- ✅ Página `/tracking` ou `/tracking/:orderId`
- ✅ Timeline visual completa
- ✅ Status em tempo real
- ✅ Localização de cada evento
- ✅ Previsão de entrega

### ✅ Notificações:
- ✅ Ícone de sino no Header
- ✅ Notificações automáticas
- ✅ Toast notifications
- ✅ Link direto para rastreamento
- ✅ Histórico completo

---

## 🚀 Como Usar:

### Para Rastrear um Pedido:
1. Faça login
2. Clique no ícone de sino (notificações) ou
3. Vá em "Meu Perfil" → "Meus Pedidos" → "Rastrear" ou
4. Acesse `/tracking/[número-do-pedido]`

### Para Solicitar Devolução:
1. Faça login
2. Vá em "Meu Perfil" → "Devoluções" ou
3. Acesse `/returns`
4. Selecione um pedido
5. Clique em "Solicitar Devolução"
6. Preencha o motivo
7. Aguarde aprovação

---

**TUDO IMPLEMENTADO E FUNCIONANDO! 🎉**

