# 📧 Como Ativar o Email Marketing Real

## 🚀 PASSO A PASSO PARA COMEÇAR A ENVIAR EMAILS DE VERDADE

### 1️⃣ **Criar Conta Brevo (GRATUITO)**

1. Acesse: **https://www.brevo.com/**
2. Clique em **"Sign up free"**
3. Preencha com seus dados (usem os emails @gmail.com)
4. Verifique seu email
5. **PRONTO! 300 emails/dia GRÁTIS!**

---

### 2️⃣ **Obter API Key**

1. Após criar conta, entre em: **https://app.brevo.com/**
2. Vá em: **Settings → API Keys**
3. Clique em **"Generate a new API key"**
4. Dê um nome: **"Papel & Pixel Email Marketing"**
5. Copie a API key gerada (ela aparece apenas uma vez!)

---

### 3️⃣ **Configurar no Código**

Abra o arquivo: `src/contexts/EmailMarketing.tsx`

Procure estas linhas (cerca de linha 2-3):
```typescript
// Uncomment when you have Brevo API key:
// import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';
```

Remova o `//` para ficar:
```typescript
import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';
```

---

### 4️⃣ **Adicionar Sua API Key**

Na mesma função `sendPromotion`, procure (linha ~68-70):
```typescript
// const transactionEmailsApi = new TransactionalEmailsApi();
// Set your API key here: (Get from https://app.brevo.com/settings/keys/api)
// transactionEmailsApi.setApiKey(0, 'YOUR_BREVO_API_KEY_HERE');
```

Mude para:
```typescript
const transactionEmailsApi = new TransactionalEmailsApi();
transactionEmailsApi.setApiKey(0, 'SUA_API_KEY_COPIADA_AQUI');
```

---

### 5️⃣ **Descomentar Código de Envio**

Procure as linhas 76-91 e remova os comentários `/*` e `*/`:

De:
```typescript
// Uncomment when ready to send real emails:
/*
for (const subscriber of subscribers) {
  try {
    const sendSmtpEmail: SendSmtpEmail = {
      to: [{ email: subscriber.email, name: subscriber.name }],
      subject: campaign.title,
      htmlContent: campaign.content,
      sender: { email: 'sua-loja@exemplo.com', name: 'Papel & Pixel' }
    };
    
    await transactionEmailsApi.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error(`Error sending to ${subscriber.email}:`, error);
  }
}
*/
```

Para:
```typescript
for (const subscriber of subscribers) {
  try {
    const sendSmtpEmail: SendSmtpEmail = {
      to: [{ email: subscriber.email, name: subscriber.name }],
      subject: campaign.title,
      htmlContent: campaign.content,
      sender: { email: 'papelepixel@gmail.com', name: 'Papel & Pixel' }
    };
    
    await transactionEmailsApi.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error(`Error sending to ${subscriber.email}:`, error);
  }
}
```

**IMPORTANTE:** Troque `'papelepixel@gmail.com'` pelo email que vocês vão usar!

---

### 6️⃣ **Verificar Domain (OPCIONAL mas Recomendado)**

Para enviar de seu próprio domínio (mais profissional):

1. No Brevo: **Settings → Senders & IP**
2. Clique **"Verify a domain"**
3. Siga as instruções do DNS
4. Após verificar, troque no código:
   - De: `sender: { email: 'papelepixel@gmail.com' }`
   - Para: `sender: { email: 'marketing@papelepixel.com' }` (ou seu domínio)

**MAS ATENÇÃO:** Se ainda não têm domínio, podem usar o email do Brevo mesmo!

---

## 📊 COMO FUNCIONA

### **Como Cliente:**
1. Acessa o site
2. Digite email na homepage (seção newsletter)
3. Email é salvo automaticamente
4. Recebe promoções que vocês enviarem!

### **Como Admin:**
1. Acessa `/marketing` (precisa estar logado como admin)
2. Vê todos os assinantes
3. Cria uma promoção
4. Clica em "Enviar Promoção"
5. **EMAILS SÃO ENVIADOS DE VERDADE!** ✉️

---

## 💰 CUSTOS

- **Brevo Free:** 300 emails/dia (9.000/mês) - **TOTALMENTE GRÁTIS**
- **Brevo Lite:** $25/mês - 20.000 emails/mês
- **Brevo Premium:** $65/mês - 100.000 emails/mês

**Comecem de graça, cresçam quando precisar!**

---

## 🎯 ESTRATÉGIAS DE MARKETING SUGERIDAS

### 1. **Ofertas Relâmpago**
   - "48h de Desconto!"
   - "Últimas Horas para Garantir"
   - Crie urgência!

### 2. **Produtos Novos**
   - "Acabamos de Chegar!"
   - "Confira Nossa Novidade"
   - Seja o primeiro!

### 3. **Promoções por Categoria**
   - "LIVROS - Até 40% OFF"
   - "PAPELARIA - Promoção Especial"
   - Segmentar clientes!

### 4. **Carrinho Abandonado** (Futuro)
   - Cliente deixou item no carrinho
   - Email automático: "Complete sua compra!"
   - Reengaja clientes!

### 5. **Newsletter Semanal**
   - "Novidades da Semana"
   - "Produtos em Destaque"
   - Mantenha contato regular!

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Código já está pronto
2. ⏳ Vocês criam conta no Brevo
3. ⏳ Me enviam a API key
4. ✅ Eu configuro (ou vocês seguem este guia)
5. ✅ **COMEÇA A ENVIAR!** 🎉

---

**Está tudo pronto no código! Só falta vocês criarem a conta no Brevo!** 🚀

**Querem que eu ative agora ou vocês fazem?** 😊










