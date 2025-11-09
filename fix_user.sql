-- Fix user na tabela users
-- Copie e execute no SQL Editor do Supabase

-- Substitua o UID e email abaixo pelos seus dados
INSERT INTO users (id, name, email, role)
VALUES (
  '618fed49-6fc4-448f-8b95-e106f4fc1569',  -- UID do usuário que você viu
  'Gildo Paulo Correia',                     -- Seu nome
  'gildopaulocorreia84@gmail.com',           -- Seu email
  'user'                                      -- Role padrão
);

-- Verificar se foi criado
SELECT * FROM users WHERE email = 'gildopaulocorreia84@gmail.com';










