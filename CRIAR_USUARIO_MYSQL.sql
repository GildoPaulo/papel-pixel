-- Criar usuário no MySQL
-- Execute no phpMyAdmin

USE papel_pixel;

-- Inserir usuário (senha: 123456)
INSERT INTO users (name, email, password, role) 
VALUES (
  'Gildo Paulo Victor', 
  'gildopaulovictor@gmail.com', 
  '$2a$10$XmKIwYqmMdXYlA8SZs3z.OdJOzLz7jz5fV7W8hXN5rLjDQx5ZKZ9m',
  'admin'
);

-- Verificar se foi criado
SELECT * FROM users;

