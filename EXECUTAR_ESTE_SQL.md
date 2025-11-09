# ✅ SQL Corrigido - Execute este agora

## ⚠️ Erro anterior
Você recebeu: `policy "Enable insert for authenticated users" already exists`

Isso aconteceu porque a política já existia. Criei um SQL mais seguro que resolve isso.

## ✅ SOLUÇÃO

### Passo 1: Copiar o SQL abaixo

Copie TODO este código SQL do arquivo `FIX_POLITICAS_FINAL.sql`:

```sql
-- ============================================
-- REMOVER TODAS AS POLÍTICAS E CRIAR NOVAS
-- ============================================

-- 1. DESABILITAR RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS (ignorando erros)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') LOOP
        BEGIN
            EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error dropping policy %: %', r.policyname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. HABILITAR RLS NOVAMENTE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS CORRETAS
CREATE POLICY IF NOT EXISTS "users_read_all" ON users
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "users_insert_auth" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. RECRIAR FUNÇÃO E TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. VERIFICAR
SELECT 
  'Políticas criadas:' as info,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'users';

SELECT 'SUCESSO! ✅' as status;
```

### Passo 2: Executar no Supabase

1. Abra o **SQL Editor** no Supabase
2. Cole este SQL
3. Clique em **Run** (ou pressione F5)
4. Você deve ver: `SUCESSO! ✅`

### Passo 3: Testar Cadastro

1. Limpe o cache: **Ctrl + Shift + Delete** > "Clear data"
2. Recarregue a página: **F5**
3. Tente criar uma conta NOVA
4. Deve funcionar! 🎉

## 📋 Checklist

- [ ] Copiei o SQL
- [ ] Colei no SQL Editor do Supabase
- [ ] Executei (F5)
- [ ] Vi a mensagem "SUCESSO! ✅"
- [ ] Limpei o cache
- [ ] Testei criar conta
- [ ] Funcionou!

## 🔍 Se ainda não funcionar

Abra o Console do navegador (F12) e me envie a mensagem de erro que aparece quando você tenta criar conta.

