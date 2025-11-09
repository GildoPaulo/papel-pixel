const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/favorites
 * Listar favoritos do usuário logado
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [favorites] = await pool.execute(
      `SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        p.*
      FROM favorites f
      INNER JOIN products p ON f.product_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      favorites,
      count: favorites.length
    });
  } catch (error) {
    console.error('❌ [FAVORITES] Erro ao buscar favoritos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar favoritos'
    });
  }
});

/**
 * POST /api/favorites/:productId
 * Adicionar produto aos favoritos
 */
router.post('/:productId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    // Verificar se produto existe
    const [products] = await pool.execute(
      'SELECT id, name FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Adicionar aos favoritos (ou ignorar se já existe)
    await pool.execute(
      'INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );

    console.log(`❤️ [FAVORITES] Usuário ${userId} favoritou produto ${productId}`);

    res.json({
      success: true,
      message: 'Produto adicionado aos favoritos!',
      product: products[0]
    });
  } catch (error) {
    console.error('❌ [FAVORITES] Erro ao adicionar favorito:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar favorito'
    });
  }
});

/**
 * DELETE /api/favorites/:productId
 * Remover produto dos favoritos
 */
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Favorito não encontrado'
      });
    }

    console.log(`💔 [FAVORITES] Usuário ${userId} removeu favorito ${productId}`);

    res.json({
      success: true,
      message: 'Produto removido dos favoritos!'
    });
  } catch (error) {
    console.error('❌ [FAVORITES] Erro ao remover favorito:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover favorito'
    });
  }
});

/**
 * GET /api/favorites/check/:productId
 * Verificar se produto está nos favoritos
 */
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const [favorites] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    res.json({
      success: true,
      isFavorite: favorites.length > 0
    });
  } catch (error) {
    console.error('❌ [FAVORITES] Erro ao verificar favorito:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar favorito',
      isFavorite: false
    });
  }
});

module.exports = router;

