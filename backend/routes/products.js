const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Todas as rotas começam com /api/products

// IMPORTANTE: Rotas específicas ANTES de rotas com parâmetros dinâmicos
// GET /api/products/categories - Listar categorias (DEVE VIR ANTES de /:id)
router.get('/categories', productsController.getCategories);

// GET /api/products - Listar todos os produtos (com filtros)
router.get('/', productsController.getAllProducts);

// POST /api/products - Criar produto (Admin)
router.post('/', authenticate, isAdmin, productsController.createProduct);

// PUT /api/products/:id - Atualizar produto (Admin)
router.put('/:id', authenticate, isAdmin, productsController.updateProduct);

// DELETE /api/products/:id - Deletar produto (Admin)
router.delete('/:id', authenticate, isAdmin, productsController.deleteProduct);

// GET /api/products/:id - Buscar produto por ID (DEVE VIR POR ÚLTIMO)
router.get('/:id', productsController.getProductById);

module.exports = router;

