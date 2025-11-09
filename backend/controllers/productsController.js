const pool = require('../config/database');

// Buscar todos os produtos (com filtros opcionais)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, isPromotion, isFeatured, search, sort = 'created_at DESC', limit = 100, offset = 0 } = req.query;
    
    console.log('📦 [GET ALL PRODUCTS] Filtros:', { category, search, limit, offset });
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Filtro por categoria
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    // Filtro por preço mínimo
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }

    // Filtro por preço máximo
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    // Filtro por promoção
    if (isPromotion !== undefined) {
      query += ' AND isPromotion = ?';
      params.push(isPromotion === 'true' || isPromotion === true || isPromotion === 1);
    }

    // Filtro por destaque
    if (isFeatured !== undefined) {
      query += ' AND isFeatured = ?';
      params.push(isFeatured === 'true' || isFeatured === true || isFeatured === 1);
    }

    // Busca por texto
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Ordenação
    const validSorts = ['created_at DESC', 'created_at ASC', 'price ASC', 'price DESC', 'name ASC', 'name DESC'];
    if (validSorts.includes(sort)) {
      query += ` ORDER BY ${sort}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // Limite e offset
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await pool.execute(query, params);
    console.log('✅ [GET ALL PRODUCTS] Retornando', products.length, 'produto(s)');
    
    // Parse images do JSON e adicionar avaliações
    const parsedProducts = await Promise.all(products.map(async (product) => {
      // Parse images
      if (product.images) {
        try {
          product.images = JSON.parse(product.images);
        } catch (e) {
          console.warn('⚠️ [GET ALL PRODUCTS] Erro ao parsear images:', e);
          product.images = [];
        }
      } else {
        product.images = [];
      }
      
      // Buscar avaliações
      try {
        const [reviewStats] = await pool.execute(
          `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews 
           FROM reviews WHERE product_id = ?`,
          [product.id]
        );
        
        if (reviewStats[0]) {
          product.avg_rating = reviewStats[0].avg_rating ? parseFloat(reviewStats[0].avg_rating) : 0;
          product.total_reviews = reviewStats[0].total_reviews || 0;
        } else {
          product.avg_rating = 0;
          product.total_reviews = 0;
        }
      } catch (reviewError) {
        console.warn('⚠️ [GET ALL PRODUCTS] Erro ao buscar avaliações:', reviewError);
        product.avg_rating = 0;
        product.total_reviews = 0;
      }
      
      return product;
    }));
    
    res.json(parsedProducts);
  } catch (error) {
    console.error('❌ [GET ALL PRODUCTS] Erro:', error);
    res.status(500).json({ error: error.message });
  }
};

// Buscar produto por ID
exports.getProductById = async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Buscar avaliações do produto
    const [reviews] = await pool.execute(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    // Buscar produtos relacionados (mesma categoria)
    const product = products[0];
    
    // Parse images do JSON
    if (product.images) {
      try {
        product.images = JSON.parse(product.images);
      } catch (e) {
        console.warn('⚠️ [GET PRODUCT BY ID] Erro ao parsear images:', e);
        product.images = [];
      }
    } else {
      product.images = [];
    }
    
    // Adicionar estatísticas de avaliações
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      product.avg_rating = parseFloat(avgRating.toFixed(1));
      product.total_reviews = reviews.length;
    } else {
      product.avg_rating = 0;
      product.total_reviews = 0;
    }
    
    const [relatedProducts] = await pool.execute(
      'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4',
      [product.category, product.id]
    );

    res.json({
      ...product,
      reviews,
      relatedProducts
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Criar produto (Admin)
exports.createProduct = async (req, res) => {
  try {
    console.log('📦 [CREATE PRODUCT] Recebido:', {
      body: req.body,
      hasImage: !!req.body.image,
      imageLength: req.body.image ? req.body.image.length : 0
    });

    const { name, category, price, originalPrice, description, image, stock = 0, isPromotion = false, isFeatured = false } = req.body;

    // Validações
    if (!name || !category || price === undefined || price === null) {
      return res.status(400).json({ error: 'Campos obrigatórios: name, category, price' });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Preço deve ser maior que zero' });
    }

    // Converter boolean se vier como string
    const isPromo = isPromotion === true || isPromotion === 'true' || isPromotion === 1;
    const isFeat = isFeatured === true || isFeatured === 'true' || isFeatured === 1;
    const stockNum = parseInt(stock) || 0;
    const priceNum = parseFloat(price);
    const originalPriceNum = originalPrice ? parseFloat(originalPrice) : null;

    const [result] = await pool.execute(
      `INSERT INTO products (name, category, price, originalPrice, description, image, stock, isPromotion, isFeatured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category, priceNum, originalPriceNum, description || '', image || '', stockNum, isPromo, isFeat]
    );

    const productId = result.insertId;
    console.log('✅ [CREATE PRODUCT] Produto criado com ID:', productId);

    // Buscar produto criado
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(500).json({ error: 'Produto criado mas não encontrado' });
    }

    const createdProduct = products[0];

    res.status(201).json({ 
      id: createdProduct.id,
      message: 'Produto criado com sucesso',
      product: createdProduct
    });
  } catch (error) {
    console.error('❌ [CREATE PRODUCT] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar produto' });
  }
};

// Atualizar produto (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, originalPrice, description, image, stock, isPromotion, isFeatured } = req.body;

    console.log('📝 [UPDATE PRODUCT] ID:', id);
    console.log('📝 [UPDATE PRODUCT] User:', req.user);
    console.log('📝 [UPDATE PRODUCT] Dados recebidos:', {
      name, category, price, hasImage: !!image, imageLength: image ? image.length : 0,
      stock, isPromotion, isFeatured
    });

    // Verificar se o produto existe
    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      console.log('❌ [UPDATE PRODUCT] Produto não encontrado:', id);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Converter valores
    const isPromo = isPromotion === true || isPromotion === 'true' || isPromotion === 1 || (isPromotion === undefined ? existing[0].isPromotion : false);
    const isFeat = isFeatured === true || isFeatured === 'true' || isFeatured === 1 || (isFeatured === undefined ? existing[0].isFeatured : false);
    const stockNum = stock !== undefined ? parseInt(stock) : existing[0].stock;
    const priceNum = price !== undefined ? parseFloat(price) : existing[0].price;
    const originalPriceNum = originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existing[0].originalPrice;

    // Manter valores existentes se não foram fornecidos
    const finalName = name || existing[0].name;
    const finalCategory = category || existing[0].category;
    const finalDescription = description !== undefined ? description : existing[0].description;
    const finalImage = image !== undefined ? image : existing[0].image;

    await pool.execute(
      `UPDATE products 
       SET name = ?, category = ?, price = ?, originalPrice = ?, description = ?, image = ?, stock = ?, isPromotion = ?, isFeatured = ?, updated_at = NOW()
       WHERE id = ?`,
      [finalName, finalCategory, priceNum, originalPriceNum, finalDescription, finalImage, stockNum, isPromo, isFeat, id]
    );

    console.log('✅ [UPDATE PRODUCT] Produto atualizado:', id);

    // Buscar produto atualizado
    const [updated] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Produto atualizado com sucesso',
      product: updated[0]
    });
  } catch (error) {
    console.error('❌ [UPDATE PRODUCT] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar produto' });
  }
};

// Deletar produto (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ [DELETE PRODUCT] ID:', id);
    console.log('🗑️ [DELETE PRODUCT] User:', req.user);
    console.log('🗑️ [DELETE PRODUCT] Headers:', req.headers.authorization ? 'Token presente' : 'Token ausente');

    // Verificar se o produto existe
    const [existing] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      console.log('❌ [DELETE PRODUCT] Produto não encontrado:', id);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    console.log('🗑️ [DELETE PRODUCT] Produto encontrado:', existing[0].name);

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    console.log('✅ [DELETE PRODUCT] Produto deletado do banco:', id);

    res.json({ 
      success: true,
      message: 'Produto deletado com sucesso',
      deletedId: id
    });
  } catch (error) {
    console.error('❌ [DELETE PRODUCT] Erro:', error);
    res.status(500).json({ error: error.message || 'Erro ao deletar produto' });
  }
};

// Buscar categorias
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category'
    );

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
};

// Função auxiliar
const getProductById = async ({ params }) => {
  const [products] = await pool.execute(
    'SELECT * FROM products WHERE id = ?',
    [params.id]
  );
  return products[0];
};

