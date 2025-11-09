const express = require('express');
const router = express.Router();
const couponsController = require('../controllers/couponsController');
const { authenticate, isAdmin } = require('../middleware/auth');

// GET /api/coupons - Listar todos os cupons (Admin)
router.get('/', authenticate, isAdmin, couponsController.getAllCoupons);

// GET /api/coupons/code/:code - Buscar cupom por código
router.get('/code/:code', couponsController.getCouponByCode);

// POST /api/coupons/apply - Aplicar cupom
router.post('/apply', couponsController.applyCoupon);

// POST /api/coupons - Criar cupom (Admin)
router.post('/', authenticate, isAdmin, couponsController.createCoupon);

// PUT /api/coupons/:id - Atualizar cupom (Admin)
router.put('/:id', authenticate, isAdmin, couponsController.updateCoupon);

// DELETE /api/coupons/:id - Deletar cupom (Admin)
router.delete('/:id', authenticate, isAdmin, couponsController.deleteCoupon);

module.exports = router;

