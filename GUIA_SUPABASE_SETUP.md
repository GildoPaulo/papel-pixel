# 🚀 Guia Completo: Setup Supabase + Backend API

## 📋 Por que Supabase?

✅ **Totalmente GRATUITO** até 500MB de dados
✅ **PostgreSQL** (mais poderoso que MySQL)
✅ **Autenticação integrada** com email/password e Google
✅ **Real-time** subscriptions
✅ **Storage** para imagens
✅ **Dashboard** visual para gerenciar dados
✅ **API REST automática** - zero código de backend!

---

## 🎯 Passo a Passo

### **1️⃣ Criar Conta no Supabase**

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub
4. Crie uma organização
5. Crie um novo projeto:
   - **Nome**: `papel-pixel`
   - **Senha do banco**: escolha uma senha forte
   - **Região**: escolha a mais próxima (EU East)
   - Clique em **"Create new project"** ⏱️ (demora 2 minutos)

---

### **2️⃣ Obter Credenciais**

No dashboard do Supabase:

1. Vá em **Settings** > **API**
2. Copie essas informações:
   ```
   Project URL: https://xxxxx.supabase.co
   anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### **3️⃣ Instalar Cliente Supabase**

```bash
# Na raiz do projeto
npm install @supabase/supabase-js
```

---

### **4️⃣ Criar Arquivo de Configuração**

Crie `src/config/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### **5️⃣ Configurar Variáveis de Ambiente**

Edite `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: NUNCA commite o arquivo `.env` no GitHub!

Adicione ao `.gitignore`:
```
.env
.env.local
```

---

### **6️⃣ Executar SQL no Supabase**

1. No dashboard, vá em **SQL Editor**
2. Cole e execute este SQL:

```sql
-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  description TEXT,
  image TEXT,
  stock INTEGER DEFAULT 0,
  is_promotion BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  shipping_name TEXT,
  shipping_email TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_province TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de assinantes
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  send_date TIMESTAMPTZ,
  subscribers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir produtos de exemplo
INSERT INTO products (id, name, category, price, original_price, description, image, stock, is_promotion, is_featured)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Caderno Executivo Premium A5', 'Papelaria', 350.00, 450.00, 'Caderno de alta qualidade com capa dura', '/category-stationery.jpg', 50, true, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Box Harry Potter - Edição Especial', 'Livros', 2800.00, 3500.00, 'Coleção completa dos livros de Harry Potter', '/category-books.jpg', 25, true, false),
  ('550e8400-e29b-41d4-a716-446655440003', 'Revista Tech Monthly - Ed. Janeiro', 'Revistas', 120.00, NULL, 'Última edição da revista mensal de tecnologia', '/category-magazines.jpg', 100, false, false)
ON CONFLICT (id) DO NOTHING;

-- Criar policy para acesso público (para leitura de produtos)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON subscribers
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert in subscribers" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Habilitar RLS em outras tabelas
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
```

3. Clique em **"Run"** ou pressione `Ctrl+Enter`

✅ **Pronto!** Todas as tabelas foram criadas.

---

### **7️⃣ Testar Conexão**

Execute no console do navegador (ou crie uma página de teste):

```typescript
import { supabase } from '@/config/supabase'

// Testar conexão
const { data, error } = await supabase
  .from('products')
  .select('*')

console.log('Produtos:', data)
console.log('Erro:', error)
```

---

## 🔐 Configurar Autenticação

### **Habilitar Google OAuth**

1. No dashboard, vá em **Authentication** > **Providers**
2. Ative **Google**
3. Configure:
   - Client ID do Google
   - Client Secret
4. Adicione URL de callback:
   ```
   http://localhost:5173
   ```

### **Usar no Código**

```typescript
import { supabase } from '@/config/supabase'

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Registro
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Logout
await supabase.auth.signOut()

// Verificar sessão
const { data: { session } } = await supabase.auth.getSession()
```

---

## 🗄️ Storage para Imagens

### **Criar Bucket**

1. Vá em **Storage**
2. Crie um bucket chamado **"product-images"**
3. Configure política para acesso público

### **Upload de Imagem**

```typescript
const { data, error } = await supabase
  .storage
  .from('product-images')
  .upload('caderno.jpg', imageFile)

// Obter URL pública
const { data: { publicUrl } } = supabase
  .storage
  .from('product-images')
  .getPublicUrl('caderno.jpg')
```

---

## 🚀 Deploy

### **Frontend + Supabase**

1. **Frontend**: Deploy no Netlify/Vercel
2. **Backend**: Supabase é automático!
3. **Banco**: Já está no Supabase
4. **Storage**: Já está no Supabase

---

## 📊 Monitoramento

### **Dashboard do Supabase**

- **Table Editor**: Ver e editar dados
- **SQL Editor**: Executar queries
- **Logs**: Ver requisições em tempo real
- **API**: Documentação automática
- **Auth**: Gerenciar usuários

---

## 💰 Custos

| Feature | Free Tier | Paid (Pro) |
|---------|-----------|------------|
| **Banco de dados** | 500 MB | 8 GB |
| **Storage** | 1 GB | 100 GB |
| **Requests** | 500k/mês | Ilimitado |
| **Autenticação** | Ilimitado | Ilimitado |
| **Preço** | **GRÁTIS** | $25/mês |

---

## 🐛 Troubleshooting

### **Erro: "relation does not exist"**
- Execute o SQL novamente no SQL Editor
- Verifique se a tabela existe na sidebar

### **Erro: "Invalid API key"**
- Verifique se copiou a **anon key** corretamente
- Certifique-se de que `.env` está configurado

### **Autenticação não funciona**
- Verifique URLs de callback
- Certifique-se de que o provider está ativado

---

## 🎉 Pronto!

Agora você tem:
- ✅ Banco de dados PostgreSQL rodando
- ✅ API REST automática
- ✅ Autenticação pronta
- ✅ Storage de imagens
- ✅ Dashboard visual

---

## 📚 Próximos Passos

1. ✅ Criar conta no Supabase
2. ✅ Executar SQL
3. ✅ Configurar `.env`
4. ✅ Testar conexão
5. ✅ Integrar com frontend
6. ✅ Deploy

---

**🚀 Seu e-commerce está pronto para produção!**










