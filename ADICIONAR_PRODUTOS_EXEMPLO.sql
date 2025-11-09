-- ==========================================
-- ADICIONAR PRODUTOS DE EXEMPLO
-- ==========================================
-- Cole no PHPMyAdmin → SQL → Execute

-- Limpar produtos existentes (opcional)
-- DELETE FROM products;

-- Adicionar produtos em DESTAQUE (is_featured = true)
INSERT INTO products (name, category, price, originalPrice, description, image, stock, isPromotion, isFeatured) VALUES
('Caderno Executivo Premium A5', 'Papelaria', 350.00, 450.00, 'Caderno executivo de alta qualidade com capa dura e folhas pautadas. Ideal para estudantes universitários e profissionais.', 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800', 50, true, true),

('Kit de Canetas Técnicas', 'Papelaria', 120.00, 150.00, 'Kit com 5 canetas técnicas de ponta fina, ideais para desenho técnico e caligrafia.', 'https://images.unsplash.com/photo-1583484963886-47b7c95b9e36?w=800', 30, true, true),

('Estojo Executivo em Couro', 'Papelaria', 450.00, 600.00, 'Estojo executivo em couro sintético com compartimentos organizados para canetas, carregador e documentos.', 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=800', 25, true, true),

('Calculadora Científica Básica', 'Escritório', 250.00, 300.00, 'Calculadora científica com funções trigonométricas, logarítmicas e estatísticas.', 'https://images.unsplash.com/photo-1618514148263-edc2be57a1cf?w=800', 40, false, true),

('Resmas de Papel A4 Premium', 'Escritório', 680.00, 750.00, 'Pacote com 5 resmas de papel A4, 75g, branco premium. Ideal para impressões de alta qualidade.', 'https://images.unsplash.com/photo-1608615757491-6988aef67fa3?w=800', 100, true, true);

-- Adicionar PRODUTOS EM PROMOÇÃO (isPromotion = true)
INSERT INTO products (name, category, price, originalPrice, description, image, stock, isPromotion, isFeatured) VALUES
('Folhas de Papel Pautado A4', 'Papelaria', 45.00, 60.00, 'Pacote com 100 folhas de papel pautado formato A4, ideal para cadernos universitários.', 'https://images.unsplash.com/photo-1450164044186-1b546d6f7a3f?w=800', 60, true, false),

('Agenda 2025 Executiva', 'Papelaria', 380.00, 480.00, 'Agenda executiva 2025 com capa em couro sintético, calendário anual e mensal, folhas destacáveis.', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800', 35, true, false),

('Kit de Marca Texto', 'Papelaria', 85.00, 110.00, 'Kit com 4 marca-textos amarelo, verde, azul e rosa. Ponta dupla para diferentes tipos de destaque.', 'https://images.unsplash.com/photo-1456613820599-bfe3e7f71203?w=800', 55, true, false),

('Sulfite Grande 90g', 'Escritório', 520.00, 650.00, 'Resma de papel sulfite 90g, formato A4, alta qualidade para impressões profissionais.', 'https://images.unsplash.com/photo-1613758239647-eba5c13dbca3?w=800', 45, true, false),

('Organizador de Mesa Executivo', 'Escritório', 420.00, 550.00, 'Organizador de mesa com múltiplos compartimentos para documentos, canetas e clips. Produzido em material resistente.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800', 20, true, false);

-- Adicionar PRODUTOS NORM淘宝AIS
INSERT INTO products (name, category, price, originalPrice, description, image, stock, isPromotion, isFeatured) VALUES
('Bloco de Notas A5', 'Papelaria', 55.00, NULL, 'Bloco de notas formato A5 com espiral, 80 folhas pautadas, capa dura e resistente.', 'https://images.unsplash.com/photo-1531184612484-e63c7a2845e0?w=800', 70, false, false),

('Canetas Esferográficas Pack 12', 'Papelaria', 150.00, NULL, 'Pack com 12 canetas esferográficas azuis, ponta média, tinta de alta qualidade.', 'https://images.unsplash.com/photo-1563287138-9c0e1b5e93e0?w=800', 85, false, false),

('Régua de 30cm Escolar', 'Papelaria', 25.00, NULL, 'Régua de plástico transparente com escala em centímetros e milímetros, ideal para desenho técnico.', 'https://images.unsplash.com/photo-1603213096098-d9d0f7d6c8d8?w=800', 120, false, false),

('Apontador de Lápis Duplo', 'Papelaria', 35.00, NULL, 'Apontador de lápis com reservatório removível, válido para lápis comum e de cor.', 'https://images.unsplash.com/photo-1603213096098-d9d0f7d6c8d8?w=800', 95, false, false),

('Clips Metálicos Grande 80un', 'Escritório', 40.00, NULL, 'Caixa com 80 clips metálicos tamanho grande, ideal para organizar documentos e papéis.', 'https://images.unsplash.com/photo-1560264357-8d9202250f21?w=800', 110, false, false),

('Lápis Escolar HB n°2', 'Papelaria', 85.00, NULL, 'Pacote com 24 lápis HB n°2, grafite de qualidade, ideal para uso escolar e profissional.', 'https://images.unsplash.com/photo-1629731675975-85d84a59f5de?w=800', 60, false, false),

('Perfurador de 2 Furos', 'Escritório', 180.00, NULL, 'Perfurador de papel com capacidade para até 25 folhas, ideal para arquivamento de documentos.', 'https://images.unsplash.com/photo-1512611983817-7664256504da?w=800', 30, false, false),

('Agenda Escolar 2025', 'Papelaria', 280.00, NULL, 'Agenda escolar 2025 com layout semanal, capa colorida e espaço para anotações.', 'https://images.unsplash.com/photo-1535982337059-51a5ff5f07f0?w=800', 50, false, false);

-- Verificar produtos adicionados
SELECT COUNT(*) as total_produtos FROM products;

-- Ver produtos em destaque
SELECT * FROM products WHERE isFeatured = true;

-- Ver produtos em promoção
SELECT * FROM products WHERE isPromotion = true;



