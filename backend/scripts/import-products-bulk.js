/**
 * Script para importar produtos em massa via API
 * Execute: node backend/scripts/import-products-bulk.js
 * 
 * Requisitos:
 * - Backend rodando (server-simple.js)
 * - Token de admin no .env ou login feito
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const productsData = {
  Papelaria: [
    { name: 'Papel Chamex A4 500 folhas', price: 450, originalPrice: 550, description: 'Papel branco de alta qualidade, ideal para impressões e cópias.', stock: 100, isPromotion: true, isFeatured: true },
    { name: 'Caderno Universitário 200 folhas', price: 380, originalPrice: 450, description: 'Capa dura, pautado, ideal para anotações diárias.', stock: 80, isPromotion: true, isFeatured: true },
    { name: 'Caneta Esferográfica Azul Bic Cristal', price: 15, originalPrice: 20, description: 'Escrita suave e durável.', stock: 200, isPromotion: true, isFeatured: false },
    { name: 'Caneta Gel Preta Pentel Energel', price: 25, originalPrice: 35, description: 'Tinta de secagem rápida e traço fino.', stock: 150, isPromotion: true, isFeatured: false },
    { name: 'Lápis de Grafite HB Faber-Castell', price: 12, originalPrice: 18, description: 'Ideal para escrita e desenho técnico.', stock: 300, isPromotion: true, isFeatured: false },
    { name: 'Apontador com depósito Maped', price: 35, originalPrice: 45, description: 'Compacto e prático.', stock: 120, isPromotion: false, isFeatured: false },
    { name: 'Borracha Branca Staedtler', price: 18, originalPrice: 25, description: 'Remove facilmente sem borrar o papel.', stock: 180, isPromotion: false, isFeatured: false },
    { name: 'Marcadores de Texto Stabilo Boss (kit 4 cores)', price: 250, originalPrice: 320, description: 'Realce colorido e vibrante.', stock: 60, isPromotion: true, isFeatured: false },
    { name: 'Régua de 30 cm Transparente', price: 45, originalPrice: 60, description: 'Precisão e durabilidade para medições.', stock: 100, isPromotion: false, isFeatured: false },
    { name: 'Agrafador Pequeno Metálico', price: 95, originalPrice: 120, description: 'Compacto, ideal para uso escolar.', stock: 70, isPromotion: true, isFeatured: false },
    { name: 'Caixa de Clips nº 2 (100 unidades)', price: 65, originalPrice: 85, description: 'Organização de documentos.', stock: 150, isPromotion: false, isFeatured: false },
    { name: 'Pasta Arquivo A4 com Elástico', price: 120, originalPrice: 150, description: 'Protege e organiza papéis importantes.', stock: 90, isPromotion: true, isFeatured: false },
    { name: 'Envelope pardo A4 (50 unidades)', price: 180, originalPrice: 220, description: 'Ideal para envio de documentos.', stock: 80, isPromotion: false, isFeatured: false },
    { name: 'Fita adesiva transparente 18mm', price: 42, originalPrice: 55, description: 'Multiuso para escritório e casa.', stock: 140, isPromotion: false, isFeatured: false },
    { name: 'Bloco de Notas Autocolante (Post-it)', price: 85, originalPrice: 110, description: 'Ideal para lembretes e marcações.', stock: 110, isPromotion: true, isFeatured: false },
    { name: 'Calculadora Científica Casio FX-82MS', price: 850, originalPrice: 1100, description: 'Perfeita para estudantes de ciências.', stock: 40, isPromotion: true, isFeatured: true },
    { name: 'Tesoura Escolar Tramontina 13cm', price: 55, originalPrice: 75, description: 'Segura e ergonómica.', stock: 95, isPromotion: false, isFeatured: false },
    { name: 'Pincel Atômico Preto Pilot 100', price: 32, originalPrice: 45, description: 'Marcador permanente de ponta grossa.', stock: 130, isPromotion: false, isFeatured: false },
    { name: 'Cola Branca Tenaz 90g', price: 28, originalPrice: 38, description: 'Para colagens em papel e cartolina.', stock: 160, isPromotion: false, isFeatured: false },
    { name: 'Cartolina Colorida (kit 10 cores)', price: 150, originalPrice: 200, description: 'Ideal para trabalhos manuais e escolares.', stock: 75, isPromotion: true, isFeatured: false },
  ],
  Livros: [
    { name: 'Dom Casmurro', bookTitle: 'Dom Casmurro', bookAuthor: 'Machado de Assis', price: 280, originalPrice: 350, description: 'Clássico da literatura brasileira.', stock: 50, isPromotion: true, isFeatured: true, isBook: true, bookType: 'physical' },
    { name: 'O Pequeno Príncipe', bookTitle: 'O Pequeno Príncipe', bookAuthor: 'Antoine de Saint-Exupéry', price: 250, originalPrice: 320, description: 'Obra universal sobre amor e amizade.', stock: 60, isPromotion: true, isFeatured: true, isBook: true, bookType: 'physical' },
    { name: 'O Alquimista', bookTitle: 'O Alquimista', bookAuthor: 'Paulo Coelho', price: 320, originalPrice: 400, description: 'História inspiradora sobre autodescoberta.', stock: 45, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: '1984', bookTitle: '1984', bookAuthor: 'George Orwell', price: 380, originalPrice: 480, description: 'Romance distópico e crítico sobre o totalitarismo.', stock: 40, isPromotion: true, isFeatured: true, isBook: true, bookType: 'physical' },
    { name: 'Sapiens: Uma Breve História da Humanidade', bookTitle: 'Sapiens: Uma Breve História da Humanidade', bookAuthor: 'Yuval Noah Harari', price: 520, originalPrice: 650, description: 'Análise da evolução humana.', stock: 35, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'A Revolução dos Bichos', bookTitle: 'A Revolução dos Bichos', bookAuthor: 'George Orwell', price: 280, originalPrice: 350, description: 'Fábula política sobre poder e corrupção.', stock: 55, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'O Código Da Vinci', bookTitle: 'O Código Da Vinci', bookAuthor: 'Dan Brown', price: 420, originalPrice: 550, description: 'Mistério e suspense em torno da arte e religião.', stock: 38, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'O Homem Mais Rico da Babilônia', bookTitle: 'O Homem Mais Rico da Babilônia', bookAuthor: 'George S. Clason', price: 220, originalPrice: 280, description: 'Lições financeiras atemporais.', stock: 65, isPromotion: false, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'Pai Rico, Pai Pobre', bookTitle: 'Pai Rico, Pai Pobre', bookAuthor: 'Robert Kiyosaki', price: 380, originalPrice: 480, description: 'Educação financeira prática.', stock: 42, isPromotion: true, isFeatured: true, isBook: true, bookType: 'physical' },
    { name: 'A Arte da Guerra', bookTitle: 'A Arte da Guerra', bookAuthor: 'Sun Tzu', price: 180, originalPrice: 240, description: 'Estratégias aplicáveis à vida e negócios.', stock: 70, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'Os Lusíadas', bookTitle: 'Os Lusíadas', bookAuthor: 'Luís de Camões', price: 350, originalPrice: 450, description: 'Obra épica da literatura portuguesa.', stock: 30, isPromotion: false, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'A Cabana', bookTitle: 'A Cabana', bookAuthor: 'William P. Young', price: 320, originalPrice: 400, description: 'Reflexão sobre fé e perdão.', stock: 48, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'Mindset', bookTitle: 'Mindset', bookAuthor: 'Carol Dweck', price: 420, originalPrice: 550, description: 'Psicologia do sucesso e da mentalidade.', stock: 36, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'Harry Potter e a Pedra Filosofal', bookTitle: 'Harry Potter e a Pedra Filosofal', bookAuthor: 'J.K. Rowling', price: 480, originalPrice: 600, description: 'Início da famosa saga.', stock: 52, isPromotion: true, isFeatured: true, isBook: true, bookType: 'physical' },
    { name: 'O Senhor dos Anéis: A Sociedade do Anel', bookTitle: 'O Senhor dos Anéis: A Sociedade do Anel', bookAuthor: 'J.R.R. Tolkien', price: 520, originalPrice: 650, description: 'Fantasia clássica.', stock: 33, isPromotion: true, isFeatured: true, isBook: true, bookType: 'physical' },
    { name: 'O Poder do Hábito', bookTitle: 'O Poder do Hábito', bookAuthor: 'Charles Duhigg', price: 380, originalPrice: 480, description: 'Como hábitos moldam a vida.', stock: 44, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'O Segredo', bookTitle: 'O Segredo', bookAuthor: 'Rhonda Byrne', price: 320, originalPrice: 400, description: 'Atração e mentalidade positiva.', stock: 58, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'A Menina que Roubava Livros', bookTitle: 'A Menina que Roubava Livros', bookAuthor: 'Markus Zusak', price: 380, originalPrice: 480, description: 'Romance histórico emocionante.', stock: 41, isPromotion: true, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'Diário de um Banana', bookTitle: 'Diário de um Banana', bookAuthor: 'Jeff Kinney', price: 280, originalPrice: 350, description: 'Humor juvenil e leve.', stock: 66, isPromotion: false, isFeatured: false, isBook: true, bookType: 'physical' },
    { name: 'Auto da Barca do Inferno', bookTitle: 'Auto da Barca do Inferno', bookAuthor: 'Gil Vicente', price: 220, originalPrice: 280, description: 'Sátira clássica da literatura portuguesa.', stock: 72, isPromotion: false, isFeatured: false, isBook: true, bookType: 'physical' },
  ],
  Revistas: [
    { name: 'Revista Exame — Edição Negócios e Economia', price: 120, originalPrice: 150, description: 'Atualidades do mundo empresarial.', stock: 80, isPromotion: true, isFeatured: false },
    { name: 'Superinteressante — Edição Ciência e Tecnologia', price: 95, originalPrice: 120, description: 'Curiosidades e descobertas científicas.', stock: 90, isPromotion: true, isFeatured: false },
    { name: 'National Geographic Brasil — Natureza, exploração e cultura mundial', price: 180, originalPrice: 220, description: 'Natureza, exploração e cultura mundial.', stock: 60, isPromotion: true, isFeatured: true },
    { name: 'Veja — Edição Semanal', price: 85, originalPrice: 110, description: 'Notícias e análises políticas e sociais.', stock: 100, isPromotion: false, isFeatured: false },
    { name: 'Revista Caras — Celebridades, moda e estilo de vida', price: 110, originalPrice: 140, description: 'Celebridades, moda e estilo de vida.', stock: 75, isPromotion: true, isFeatured: false },
    { name: 'Forbes Brasil — Edição Especial Empreendedores', price: 150, originalPrice: 190, description: 'Histórias de sucesso e inovação.', stock: 55, isPromotion: true, isFeatured: false },
    { name: 'Revista Galileu — Tecnologia e Sociedade', price: 100, originalPrice: 130, description: 'Discussões sobre o futuro e ciência.', stock: 85, isPromotion: true, isFeatured: false },
    { name: 'Mundo Estranho — Edição Curiosidades Globais', price: 90, originalPrice: 115, description: 'Fatos e mistérios do planeta.', stock: 95, isPromotion: false, isFeatured: false },
    { name: 'Claudia — Beleza e Comportamento', price: 105, originalPrice: 135, description: 'Foco em bem-estar e empoderamento feminino.', stock: 70, isPromotion: true, isFeatured: false },
    { name: 'Vogue Brasil — Moda e Tendências', price: 220, originalPrice: 280, description: 'Destaques do universo fashion.', stock: 45, isPromotion: true, isFeatured: true },
    { name: 'Auto Esporte — Carros e Inovações Automotivas', price: 130, originalPrice: 170, description: 'Lançamentos e testes.', stock: 65, isPromotion: true, isFeatured: false },
    { name: 'Quatro Rodas — Guia de Automóveis', price: 140, originalPrice: 180, description: 'Análises de veículos e comparativos.', stock: 58, isPromotion: false, isFeatured: false },
    { name: 'IstoÉ — Atualidades e Opinião', price: 95, originalPrice: 120, description: 'Reportagens e entrevistas exclusivas.', stock: 88, isPromotion: false, isFeatured: false },
    { name: 'Rolling Stone Brasil — Música e Cultura Pop', price: 115, originalPrice: 145, description: 'Entrevistas e análises musicais.', stock: 72, isPromotion: true, isFeatured: false },
    { name: 'PC Gamer Brasil — Jogos e Tecnologia', price: 125, originalPrice: 160, description: 'Novidades e análises sobre games.', stock: 68, isPromotion: true, isFeatured: false },
    { name: 'Scientific American Brasil — Ciência Avançada', price: 160, originalPrice: 200, description: 'Pesquisas e artigos acadêmicos.', stock: 50, isPromotion: true, isFeatured: false },
    { name: 'GQ Portugal — Estilo Masculino e Cultura', price: 175, originalPrice: 220, description: 'Tendências, moda e comportamento.', stock: 52, isPromotion: true, isFeatured: false },
    { name: 'Revista Saúde — Dicas e Bem-Estar', price: 110, originalPrice: 140, description: 'Informações médicas e qualidade de vida.', stock: 78, isPromotion: false, isFeatured: false },
    { name: 'Casa & Jardim — Arquitetura e Decoração', price: 145, originalPrice: 185, description: 'Inspirações e projetos modernos.', stock: 62, isPromotion: true, isFeatured: false },
    { name: 'Revista TIME Internacional — Política, ciência e cultura global', price: 190, originalPrice: 240, description: 'Política, ciência e cultura global.', stock: 48, isPromotion: true, isFeatured: true },
  ]
};

async function importProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pixel_store'
  });

  console.log('🚀 Iniciando importação de produtos...\n');

  let totalInserted = 0;

  for (const [category, products] of Object.entries(productsData)) {
    console.log(`📦 Importando ${products.length} produtos da categoria: ${category}`);
    
    for (const product of products) {
      try {
        const isBook = product.isBook || false;
        
        if (isBook) {
          // Produto é livro
          await connection.execute(
            `INSERT INTO products (name, category, price, original_price, description, stock, is_promotion, is_featured, isBook, book_title, book_author, book_type, access_type, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              product.name,
              category,
              product.price,
              product.originalPrice || null,
              product.description,
              product.stock,
              product.isPromotion || false,
              product.isFeatured || false,
              true,
              product.bookTitle,
              product.bookAuthor,
              product.bookType || 'physical',
              null // access_type apenas para digital
            ]
          );
        } else {
          // Produto normal (Papelaria ou Revistas)
          await connection.execute(
            `INSERT INTO products (name, category, price, original_price, description, stock, is_promotion, is_featured, isBook, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              product.name,
              category,
              product.price,
              product.originalPrice || null,
              product.description,
              product.stock,
              product.isPromotion || false,
              product.isFeatured || false,
              false
            ]
          );
        }
        
        totalInserted++;
        process.stdout.write('.');
      } catch (error) {
        console.error(`\n❌ Erro ao inserir "${product.name}":`, error.message);
      }
    }
    
    console.log(`\n✅ ${category}: ${products.length} produtos inseridos\n`);
  }

  await connection.end();
  
  console.log(`\n✨ Importação concluída!`);
  console.log(`📊 Total: ${totalInserted} produtos inseridos`);
  console.log(`\n💡 Próximos passos:`);
  console.log(`   1. Acesse o painel admin`);
  console.log(`   2. Edite cada produto para adicionar imagens`);
  console.log(`   3. Ajuste preços e descrições se necessário`);
}

importProducts().catch(console.error);

