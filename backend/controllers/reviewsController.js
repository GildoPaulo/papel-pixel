const pool = require('../config/database');

// Buscar avaliações de um produto
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const [reviews] = await pool.execute(
      `SELECT r.*, u.name as user_name, u.email as user_email 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ? 
       ORDER BY r.created_at DESC 
       LIMIT ? OFFSET ?`,
      [productId, parseInt(limit), parseInt(offset)]
    );

    // Calcular média de avaliações
    const [stats] = await pool.execute(
      `SELECT 
         AVG(rating) as avg_rating,
         COUNT(*) as total_reviews
       FROM reviews 
       WHERE product_id = ?`,
      [productId]
    );

    res.json({ 
      reviews, 
      stats: stats[0] 
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
};

// Criar avaliação
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating deve ser entre 1 e 5' });
    }

    // Verificar se o produto existe
    const [products] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Verificar se o usuário já avaliou
    const [existing] = await pool.execute(
      'SELECT * FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Você já avaliou este produto' });
    }

    // Criar avaliação
    const [result] = await pool.execute(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [userId, productId, rating, comment || null]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Avaliação criada com sucesso' 
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Atualizar avaliação
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.userId;

    // Verificar se a avaliação existe e pertence ao usuário
    const [reviews] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [id]);

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }

    if (reviews[0].user_id !== userId) {
      return res.status(403).json({ error: 'Você não pode editar esta avaliação' });
    }

    await pool.execute(
      'UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?',
      [rating, comment, id]
    );

    res.json({ message: 'Avaliação atualizada com sucesso' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: error.message });
  }
};

// Deletar avaliação
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Verificar se a avaliação existe e pertence ao usuário
    const [reviews] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [id]);

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }

    // Admin pode deletar qualquer avaliação
    if (reviews[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Você não pode deletar esta avaliação' });
    }

    await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);

    res.json({ message: 'Avaliação deletada com sucesso' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
};

