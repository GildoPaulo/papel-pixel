# 🐛 Debug: Produtos Não Adicionam

## ⚠️ Problema
Ao clicar em "Adicionar Produto", nada acontece.

## 🔍 Passo 1: Verificar o Console

1. Pressione **F12** (abre DevTools)
2. Vá na aba **Console**
3. Tente adicionar um produto novamente
4. **Me mostre o erro que aparece!**

## 🎯 Causas Possíveis

### 1️⃣ Usuário Não Está Logado

**Sintoma:** Erro de autenticação no console

**Solução:**
```sql
-- Execute este SQL no Supabase
INSERT INTO public.users (id, name, email, role)
VALUES (
  '3b784005-f25f-42d2-ab8e-e084c9952166',
  'Gildo Paulo Victor',
  'gildopaulocorreia84@gmail.com',
  'admin'
);
```

### 2️⃣ RLS (Row Level Security) Bloqueando

**Sintoma:** Erro 401 ou 403

**Solução:** Execute este SQL:

```sql
-- Permitir que admins insiram produtos
CREATE POLICY "Admins can insert products" 
ON products FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Permitir que admins atualizem produtos
CREATE POLICY "Admins can update products"
ON products FOR UPDATE
TO authenticated
USING (true);

-- Permitir que admins deletem produtos
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (true);

-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'products';
```

### 3️⃣ Campos Obrigatórios Faltando

**Sintoma:** Nenhum erro, só não adiciona

**Solução:** Preencha TODOS os campos:
- ✅ Nome do Produto
- ✅ Preço
- ✅ URL da Imagem
- ✅ Descrição

### 4️⃣ Validação de Dados

**Teste com estes dados:**

```
Nome: Teste Produto
Categoria: Papelaria
Preço: 100
Descrição: Teste de descrição
URL Imagem: https://via.placeholder.com/400
Estoque: 10
```

## 📝 Checklist de Diagnóstico

- [ ] Abri o console (F12)
- [ ] Tentei adicionar produto
- [ ] Vi o erro no console
- [ ] Copyei o erro completo
- [ ] Enviei para debug

## 🚀 Teste Rápido

Cole no console (F12) e execute:

```javascript
// Verificar se está autenticado
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Verificar produtos
const { data, error } = await supabase.from('products').select('*');
console.log('Products:', data);
console.log('Error:', error);
```

**Envie o resultado!**









