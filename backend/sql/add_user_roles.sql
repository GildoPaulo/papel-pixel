-- ============================================
-- ADICIONAR NOVOS PAPÉIS DE USUÁRIO
-- RF-02: Admin, Analyst, Assistant
-- ============================================

-- Atualizar tabela users para incluir novos papéis
ALTER TABLE users 
MODIFY COLUMN role ENUM('user', 'admin', 'analyst', 'assistant') 
DEFAULT 'user';

-- Verificar se foi aplicado corretamente
DESCRIBE users;

-- Exemplo: Atualizar um usuário existente para analyst
-- UPDATE users SET role = 'analyst' WHERE email = 'analyst@example.com';

-- Exemplo: Atualizar um usuário existente para assistant
-- UPDATE users SET role = 'assistant' WHERE email = 'assistant@example.com';

-- Visualizar usuários e seus papéis
-- SELECT id, name, email, role FROM users ORDER BY role, name;

