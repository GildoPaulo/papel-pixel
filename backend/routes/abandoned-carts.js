const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth');
const abandonedCartService = require('../services/abandonedCartService');

/**
 * POST /api/abandoned-carts/save
 * Salva ou atualiza um carrinho abandonado
 */
router.post('/save', async (req, res) => {
  try {
    const { userId, sessionId, email, cartItems, total } = req.body;
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Carrinho vazio' 
      });
    }
    
    if (!email && !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ou userId é obrigatório' 
      });
    }
    
    const cartId = await abandonedCartService.saveAbandonedCart(
      userId || null,
      sessionId || null,
      email,
      cartItems,
      total
    );
    
    res.json({ 
      success: true, 
      message: 'Carrinho salvo',
      cartId 
    });
  } catch (error) {
    console.error('❌ [API] Erro ao salvar carrinho abandonado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao salvar carrinho' 
    });
  }
});

/**
 * POST /api/abandoned-carts/recover
 * Marca um carrinho como recuperado (quando finaliza compra)
 */
router.post('/recover', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    
    await abandonedCartService.markCartAsRecovered(userId, sessionId);
    
    res.json({ 
      success: true, 
      message: 'Carrinho marcado como recuperado' 
    });
  } catch (error) {
    console.error('❌ [API] Erro ao marcar carrinho como recuperado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar' 
    });
  }
});

/**
 * GET /api/abandoned-carts/list
 * Lista todos os carrinhos abandonados (Admin apenas)
 */
router.get('/list', authenticate, isAdmin, async (req, res) => {
  try {
    const [carts] = await pool.execute(
      `SELECT ac.*, u.name as user_name, u.email as user_email
       FROM abandoned_carts ac
       LEFT JOIN users u ON ac.user_id = u.id
       WHERE ac.recovered = false
       ORDER BY ac.last_activity DESC
       LIMIT 100`
    );
    
    // Parse cart_items JSON
    const formattedCarts = carts.map(cart => ({
      ...cart,
      cart_items: typeof cart.cart_items === 'string' 
        ? JSON.parse(cart.cart_items) 
        : cart.cart_items
    }));
    
    res.json({ 
      success: true, 
      carts: formattedCarts 
    });
  } catch (error) {
    console.error('❌ [API] Erro ao listar carrinhos abandonados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao listar carrinhos' 
    });
  }
});

/**
 * POST /api/abandoned-carts/process
 * Processa carrinhos abandonados e envia emails (Admin apenas)
 */
router.post('/process', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await abandonedCartService.processAbandonedCarts();
    
    res.json({ 
      success: true, 
      message: `Processamento concluído: ${result.sent}/${result.total} emails enviados`,
      ...result
    });
  } catch (error) {
    console.error('❌ [API] Erro ao processar carrinhos abandonados:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar carrinhos' 
    });
  }
});

/**
 * DELETE /api/abandoned-carts/cleanup
 * Remove carrinhos antigos (Admin apenas)
 */
router.delete('/cleanup', authenticate, isAdmin, async (req, res) => {
  try {
    const count = await abandonedCartService.cleanupOldCarts();
    
    res.json({ 
      success: true, 
      message: `${count} carrinhos antigos removidos`,
      count 
    });
  } catch (error) {
    console.error('❌ [API] Erro ao limpar carrinhos antigos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao limpar carrinhos' 
    });
  }
});

/**
 * GET /api/abandoned-carts/stats
 * Estatísticas de carrinhos abandonados (Admin apenas)
 */
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_abandoned,
        COUNT(CASE WHEN recovered = true THEN 1 END) as recovered,
        COUNT(CASE WHEN recovered = false THEN 1 END) as active,
        COUNT(CASE WHEN email_sent_count > 0 THEN 1 END) as emails_sent,
        SUM(total) as total_value,
        AVG(total) as avg_value
      FROM abandoned_carts
      WHERE last_activity >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    res.json({ 
      success: true, 
      stats: stats[0] 
    });
  } catch (error) {
    console.error('❌ [API] Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar estatísticas' 
    });
  }
});

module.exports = router;



