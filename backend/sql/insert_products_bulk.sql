-- Script para inserir produtos em massa na loja
-- Categorias: Papelaria, Livros, Revistas
-- Execute este script uma vez para popular a loja com produtos iniciais

-- ==========================================
-- CATEGORIA: PAPELARIA
-- ==========================================
INSERT INTO products (name, category, price, originalPrice, description, stock, isPromotion, isFeatured, isBook, created_at) VALUES
('Papel Chamex A4 500 folhas', 'Papelaria', 450.00, 550.00, 'Papel branco de alta qualidade, ideal para impressões e cópias.', 100, true, true, false, NOW()),
('Caderno Universitário 200 folhas', 'Papelaria', 380.00, 450.00, 'Capa dura, pautado, ideal para anotações diárias.', 80, true, true, false, NOW()),
('Caneta Esferográfica Azul Bic Cristal', 'Papelaria', 15.00, 20.00, 'Escrita suave e durável.', 200, true, false, false, NOW()),
('Caneta Gel Preta Pentel Energel', 'Papelaria', 25.00, 35.00, 'Tinta de secagem rápida e traço fino.', 150, true, false, false, NOW()),
('Lápis de Grafite HB Faber-Castell', 'Papelaria', 12.00, 18.00, 'Ideal para escrita e desenho técnico.', 300, true, false, false, NOW()),
('Apontador com depósito Maped', 'Papelaria', 35.00, 45.00, 'Compacto e prático.', 120, false, false, false, NOW()),
('Borracha Branca Staedtler', 'Papelaria', 18.00, 25.00, 'Remove facilmente sem borrar o papel.', 180, false, false, false, NOW()),
('Marcadores de Texto Stabilo Boss (kit 4 cores)', 'Papelaria', 250.00, 320.00, 'Realce colorido e vibrante.', 60, true, false, false, NOW()),
('Régua de 30 cm Transparente', 'Papelaria', 45.00, 60.00, 'Precisão e durabilidade para medições.', 100, false, false, false, NOW()),
('Agrafador Pequeno Metálico', 'Papelaria', 95.00, 120.00, 'Compacto, ideal para uso escolar.', 70, true, false, false, NOW()),
('Caixa de Clips nº 2 (100 unidades)', 'Papelaria', 65.00, 85.00, 'Organização de documentos.', 150, false, false, false, NOW()),
('Pasta Arquivo A4 com Elástico', 'Papelaria', 120.00, 150.00, 'Protege e organiza papéis importantes.', 90, true, false, false, NOW()),
('Envelope pardo A4 (50 unidades)', 'Papelaria', 180.00, 220.00, 'Ideal para envio de documentos.', 80, false, false, false, NOW()),
('Fita adesiva transparente 18mm', 'Papelaria', 42.00, 55.00, 'Multiuso para escritório e casa.', 140, false, false, false, NOW()),
('Bloco de Notas Autocolante (Post-it)', 'Papelaria', 85.00, 110.00, 'Ideal para lembretes e marcações.', 110, true, false, false, NOW()),
('Calculadora Científica Casio FX-82MS', 'Papelaria', 850.00, 1100.00, 'Perfeita para estudantes de ciências.', 40, true, true, false, NOW()),
('Tesoura Escolar Tramontina 13cm', 'Papelaria', 55.00, 75.00, 'Segura e ergonómica.', 95, false, false, false, NOW()),
('Pincel Atômico Preto Pilot 100', 'Papelaria', 32.00, 45.00, 'Marcador permanente de ponta grossa.', 130, false, false, false, NOW()),
('Cola Branca Tenaz 90g', 'Papelaria', 28.00, 38.00, 'Para colagens em papel e cartolina.', 160, false, false, false, NOW()),
('Cartolina Colorida (kit 10 cores)', 'Papelaria', 150.00, 200.00, 'Ideal para trabalhos manuais e escolares.', 75, true, false, false, NOW());

-- ==========================================
-- CATEGORIA: LIVROS (FÍSICOS)
-- ==========================================
INSERT INTO products (name, category, price, originalPrice, description, stock, isPromotion, isFeatured, isBook, book_title, book_author, book_type, access_type, created_at) VALUES
('Dom Casmurro', 'Livros', 280.00, 350.00, 'Clássico da literatura brasileira.', 50, true, true, true, 'Dom Casmurro', 'Machado de Assis', 'physical', NULL, NOW()),
('O Pequeno Príncipe', 'Livros', 250.00, 320.00, 'Obra universal sobre amor e amizade.', 60, true, true, true, 'O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 'physical', NULL, NOW()),
('O Alquimista', 'Livros', 320.00, 400.00, 'História inspiradora sobre autodescoberta.', 45, true, false, true, 'O Alquimista', 'Paulo Coelho', 'physical', NULL, NOW()),
('1984', 'Livros', 380.00, 480.00, 'Romance distópico e crítico sobre o totalitarismo.', 40, true, true, true, '1984', 'George Orwell', 'physical', NULL, NOW()),
('Sapiens: Uma Breve História da Humanidade', 'Livros', 520.00, 650.00, 'Análise da evolução humana.', 35, true, false, true, 'Sapiens: Uma Breve História da Humanidade', 'Yuval Noah Harari', 'physical', NULL, NOW()),
('A Revolução dos Bichos', 'Livros', 280.00, 350.00, 'Fábula política sobre poder e corrupção.', 55, true, false, true, 'A Revolução dos Bichos', 'George Orwell', 'physical', NULL, NOW()),
('O Código Da Vinci', 'Livros', 420.00, 550.00, 'Mistério e suspense em torno da arte e religião.', 38, true, false, true, 'O Código Da Vinci', 'Dan Brown', 'physical', NULL, NOW()),
('O Homem Mais Rico da Babilônia', 'Livros', 220.00, 280.00, 'Lições financeiras atemporais.', 65, false, false, true, 'O Homem Mais Rico da Babilônia', 'George S. Clason', 'physical', NULL, NOW()),
('Pai Rico, Pai Pobre', 'Livros', 380.00, 480.00, 'Educação financeira prática.', 42, true, true, true, 'Pai Rico, Pai Pobre', 'Robert Kiyosaki', 'physical', NULL, NOW()),
('A Arte da Guerra', 'Livros', 180.00, 240.00, 'Estratégias aplicáveis à vida e negócios.', 70, true, false, true, 'A Arte da Guerra', 'Sun Tzu', 'physical', NULL, NOW()),
('Os Lusíadas', 'Livros', 350.00, 450.00, 'Obra épica da literatura portuguesa.', 30, false, false, true, 'Os Lusíadas', 'Luís de Camões', 'physical', NULL, NOW()),
('A Cabana', 'Livros', 320.00, 400.00, 'Reflexão sobre fé e perdão.', 48, true, false, true, 'A Cabana', 'William P. Young', 'physical', NULL, NOW()),
('Mindset', 'Livros', 420.00, 550.00, 'Psicologia do sucesso e da mentalidade.', 36, true, false, true, 'Mindset', 'Carol Dweck', 'physical', NULL, NOW()),
('Harry Potter e a Pedra Filosofal', 'Livros', 480.00, 600.00, 'Início da famosa saga.', 52, true, true, true, 'Harry Potter e a Pedra Filosofal', 'J.K. Rowling', 'physical', NULL, NOW()),
('O Senhor dos Anéis: A Sociedade do Anel', 'Livros', 520.00, 650.00, 'Fantasia clássica.', 33, true, true, true, 'O Senhor dos Anéis: A Sociedade do Anel', 'J.R.R. Tolkien', 'physical', NULL, NOW()),
('O Poder do Hábito', 'Livros', 380.00, 480.00, 'Como hábitos moldam a vida.', 44, true, false, true, 'O Poder do Hábito', 'Charles Duhigg', 'physical', NULL, NOW()),
('O Segredo', 'Livros', 320.00, 400.00, 'Atração e mentalidade positiva.', 58, true, false, true, 'O Segredo', 'Rhonda Byrne', 'physical', NULL, NOW()),
('A Menina que Roubava Livros', 'Livros', 380.00, 480.00, 'Romance histórico emocionante.', 41, true, false, true, 'A Menina que Roubava Livros', 'Markus Zusak', 'physical', NULL, NOW()),
('Diário de um Banana', 'Livros', 280.00, 350.00, 'Humor juvenil e leve.', 66, false, false, true, 'Diário de um Banana', 'Jeff Kinney', 'physical', NULL, NOW()),
('Auto da Barca do Inferno', 'Livros', 220.00, 280.00, 'Sátira clássica da literatura portuguesa.', 72, false, false, true, 'Auto da Barca do Inferno', 'Gil Vicente', 'physical', NULL, NOW());

-- ==========================================
-- CATEGORIA: REVISTAS
-- ==========================================
INSERT INTO products (name, category, price, originalPrice, description, stock, isPromotion, isFeatured, isBook, created_at) VALUES
('Revista Exame — Edição Negócios e Economia', 'Revistas', 120.00, 150.00, 'Atualidades do mundo empresarial.', 80, true, false, false, NOW()),
('Superinteressante — Edição Ciência e Tecnologia', 'Revistas', 95.00, 120.00, 'Curiosidades e descobertas científicas.', 90, true, false, false, NOW()),
('National Geographic Brasil — Natureza, exploração e cultura mundial', 'Revistas', 180.00, 220.00, 'Natureza, exploração e cultura mundial.', 60, true, true, false, NOW()),
('Veja — Edição Semanal', 'Revistas', 85.00, 110.00, 'Notícias e análises políticas e sociais.', 100, false, false, false, NOW()),
('Revista Caras — Celebridades, moda e estilo de vida', 'Revistas', 110.00, 140.00, 'Celebridades, moda e estilo de vida.', 75, true, false, false, NOW()),
('Forbes Brasil — Edição Especial Empreendedores', 'Revistas', 150.00, 190.00, 'Histórias de sucesso e inovação.', 55, true, false, false, NOW()),
('Revista Galileu — Tecnologia e Sociedade', 'Revistas', 100.00, 130.00, 'Discussões sobre o futuro e ciência.', 85, true, false, false, NOW()),
('Mundo Estranho — Edição Curiosidades Globais', 'Revistas', 90.00, 115.00, 'Fatos e mistérios do planeta.', 95, false, false, false, NOW()),
('Claudia — Beleza e Comportamento', 'Revistas', 105.00, 135.00, 'Foco em bem-estar e empoderamento feminino.', 70, true, false, false, NOW()),
('Vogue Brasil — Moda e Tendências', 'Revistas', 220.00, 280.00, 'Destaques do universo fashion.', 45, true, true, false, NOW()),
('Auto Esporte — Carros e Inovações Automotivas', 'Revistas', 130.00, 170.00, 'Lançamentos e testes.', 65, true, false, false, NOW()),
('Quatro Rodas — Guia de Automóveis', 'Revistas', 140.00, 180.00, 'Análises de veículos e comparativos.', 58, false, false, false, NOW()),
('IstoÉ — Atualidades e Opinião', 'Revistas', 95.00, 120.00, 'Reportagens e entrevistas exclusivas.', 88, false, false, false, NOW()),
('Rolling Stone Brasil — Música e Cultura Pop', 'Revistas', 115.00, 145.00, 'Entrevistas e análises musicais.', 72, true, false, false, NOW()),
('PC Gamer Brasil — Jogos e Tecnologia', 'Revistas', 125.00, 160.00, 'Novidades e análises sobre games.', 68, true, false, false, NOW()),
('Scientific American Brasil — Ciência Avançada', 'Revistas', 160.00, 200.00, 'Pesquisas e artigos acadêmicos.', 50, true, false, false, NOW()),
('GQ Portugal — Estilo Masculino e Cultura', 'Revistas', 175.00, 220.00, 'Tendências, moda e comportamento.', 52, true, false, false, NOW()),
('Revista Saúde — Dicas e Bem-Estar', 'Revistas', 110.00, 140.00, 'Informações médicas e qualidade de vida.', 78, false, false, false, NOW()),
('Casa & Jardim — Arquitetura e Decoração', 'Revistas', 145.00, 185.00, 'Inspirações e projetos modernos.', 62, true, false, false, NOW()),
('Revista TIME Internacional — Política, ciência e cultura global', 'Revistas', 190.00, 240.00, 'Política, ciência e cultura global.', 48, true, true, false, NOW());

-- ==========================================
-- RESUMO
-- ==========================================
-- Total de produtos inseridos:
-- - Papelaria: 20 produtos
-- - Livros: 20 produtos
-- - Revistas: 20 produtos
-- TOTAL: 60 produtos
-- 
-- Nota: Todos os produtos têm preço, descrição e estoque inicial.
-- Você pode atualizar imagens e outros detalhes pelo painel admin.

