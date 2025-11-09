const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { authenticate } = require('../middleware/auth');

// GET /api/reviews/product/:productId - Avaliações de um produto
router.get('/product/:productId', reviewsController.getProductReviews);

// POST /api/reviews/product/:productId - Criar avaliação
router.post('/product/:productId', authenticate, reviewsController.createReview);

// PUT /api/reviews/:id - Atualizar avaliação
router.put('/:id', authenticate, reviewsController.updateReview);

// DELETE /api/reviews/:id - Deletar avaliação
router.delete('/:id', authenticate, reviewsController.deleteReview);

module.exports = router;

