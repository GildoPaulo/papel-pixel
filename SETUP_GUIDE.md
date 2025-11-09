# Papel & Pixel Store - Setup Guide

Este guia irá ajudá-lo a configurar completamente o projeto da Papel & Pixel Store.

## 🎯 Visão Geral do Projeto

**Papel & Pixel Store** é uma plataforma e-commerce moderna construída com:
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **Backend:** Node.js/Express + MySQL
- **Autenticação:** Firebase Authentication
- **Storage:** Firebase Storage (para imagens de produtos)
- **Pagamentos:** PayPal + M-Pesa
- **Mensageria:** WhatsApp API

## 📋 Pré-requisitos

- Node.js 18+ e npm
- MySQL 8.0+
- Conta Firebase
- Contas PayPal e M-Pesa para testes

## 🚀 Passo 1: Instalar Dependências

```bash
npm install
```

## 🗄️ Passo 2: Configurar o Banco de Dados MySQL

1. Crie um banco de dados MySQL:
```bash
mysql -u root -p
CREATE DATABASE papel_pixel_store;
```

2. Execute o schema SQL:
```bash
mysql -u root -p papel_pixel_store < database_schema.sql
```

3. Configure as credenciais do banco de dados no arquivo `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=papel_pixel_store
```

## 🔥 Passo 3: Configurar Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Habilite Authentication (Email/Password e Google)
4. Habilite Storage
5. Copie as credenciais e adicione ao `.env`:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

## 💳 Passo 4: Configurar Pagamentos

### PayPal
1. Crie uma conta em [PayPal Developer](https://developer.paypal.com/)
2. Crie uma aplicação e obtenha as credenciais
3. Adicione ao `.env`:
```env
VITE_PAYPAL_CLIENT_ID=sua_client_id
VITE_PAYPAL_CLIENT_SECRET=sua_client_secret
```

### M-Pesa
1. Registre-se na [M-Pesa Developer Portal](https://developer.mpesa.vm.co.mz/)
2. Obtenha as credenciais da API
3. Adicione ao `.env`:
```env
VITE_MPESA_CONSUMER_KEY=sua_consumer_key
VITE_MPESA_CONSUMER_SECRET=sua_consumer_secret
VITE_MPESA_PASSKEY=sua_passkey
VITE_MPESA_SHORTCODE=seu_shortcode
```

## 📱 Passo 5: Configurar WhatsApp

1. Registre-se no [WhatsApp Business API](https://www.twilio.com/whatsapp) ou use Twilio
2. Adicione as credenciais ao `.env`:
```env
VITE_WHATSAPP_API_KEY=sua_api_key
VITE_WHATSAPP_PHONE=258874383621
```

## 🌐 Passo 6: Configurar Integração com Supabase (Opcional)

Se preferir usar Supabase em vez de Firebase:
```env
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_PUBLISHABLE_KEY=sua_key
```

## 🎨 Passo 7: Personalização

### Cores e Tema
O arquivo `src/index.css` contém as variáveis de cores. Você pode personalizar:
- Cores primárias e secundárias
- Gradientes
- Sombras
- Transições

### Informações da Loja
- **Footer:** `src/components/Footer.tsx`
- **Contato:** Atualize o telefone e e-mail
- **Sobre:** Atualize a página `src/pages/About.tsx`

## ▶️ Passo 8: Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📦 Passo 9: Build para Produção

```bash
npm run build
```

Os arquivos de produção estarão na pasta `dist/`

## 🔐 Acesso ao Painel Admin

1. Acesse: `http://localhost:5173/admin`
2. No ambiente de desenvolvimento, qualquer e-mail e senha funcionam
3. Em produção, configure usuários reais com autenticação adequada

## 📊 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── ui/          # Componentes Shadcn UI
│   └── ...
├── pages/           # Páginas da aplicação
├── hooks/           # Custom hooks
├── lib/             # Utilitários
├── integrations/    # Integrações (Supabase, Firebase)
└── assets/          # Imagens e recursos estáticos
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## 🚨 Troubleshooting

### Problemas com o Banco de Dados
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Certifique-se de que o banco de dados foi criado

### Problemas com Firebase
- Verifique se as credenciais estão corretas
- Certifique-se de que Authentication e Storage estão habilitados
- Verifique as regras de segurança no Firebase Console

### Problemas com Build
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📞 Suporte

Para dúvidas ou problemas:
- **E-mail:** atendimento@papelepixel.co.mz
- **WhatsApp:** +258 874383621

## 📝 Licença

Este projeto é proprietário da Papel & Pixel Store.

---

**Desenvolvido com ❤️ na Beira, Moçambique**




