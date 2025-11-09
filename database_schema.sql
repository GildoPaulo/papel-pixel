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
  ('550e8400-e29b-41d4-a716-446655440001', 'Caderno Executivo Premium A5', 'Papelaria', 350.00, 450.00, 'Caderno de alta qualidade com capa dura e folhas pautadas', '/category-stationery.jpg', 50, true, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Box Harry Potter - Edição Especial', 'Livros', 2800.00, 3500.00, 'Coleção completa dos livros de Harry Potter em edição especial', '/category-books.jpg', 25, true, false),
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

-- Criar política para que usuários vejam apenas seus próprios pedidos
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Criar política para inserção de pedidos
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (true);
