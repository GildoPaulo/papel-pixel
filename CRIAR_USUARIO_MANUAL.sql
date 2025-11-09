-- Execute este SQL no Supabase para criar seu usuário
-- Vá em SQL Editor > New Query > Cole este código > Run

INSERT INTO users (id, name, email, role)
VALUES (
  '618fed49-6fc4-448f-8b95-e106f4fc1569',
  'Gildo Paulo Correia',
  'gildopaulocorreia84@gmail.com',
  'user'
)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Verificar se foi criado
SELECT * FROM users WHERE email = 'gildopaulocorreia84@gmail.com';










