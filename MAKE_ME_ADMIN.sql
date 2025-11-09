-- Execute este SQL para tornar seu usuário ADMIN
UPDATE users 
SET role = 'admin' 
WHERE email = 'gildopaulocorreia84@gmail.com';

-- Verificar
SELECT name, email, role FROM users;










