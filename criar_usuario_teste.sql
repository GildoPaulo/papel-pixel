-- Criar usuário de teste para login
-- Senha: 123456 (já com hash bcrypt)

INSERT INTO users (name, email, password, role) 
VALUES (
  'Gildo Paulo Victor', 
  'gildopaulovictor@gmail.com', 
  '$2a$10$XmKIwYqmMdXYlA8SZs3z.OdJOzLz7jz5fV7W8hXN5rLjDQx5ZKZ9m',
  'admin'
);

-- Verificar se foi criado
SELECT id, name, email, role, created_at FROM users;

