const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const abTesting = require('../services/abTestingService');

/**
 * GET /api/ab-testing/report
 * Retorna relatório de desempenho das variantes (Admin apenas)
 */
router.get('/report', authenticate, isAdmin, async (req, res) => {
  try {
    const report = await abTesting.getPerformanceReport();
    
    res.json({
      success: true,
      report,
      summary: {
        total_variants: report.length,
        active_variants: report.filter(r => r.is_active).length,
        best_performer: report[0] || null
      }
    });
  } catch (error) {
    console.error('❌ [API] Erro ao gerar relatório A/B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório'
    });
  }
});

/**
 * POST /api/ab-testing/reset
 * Reinicia o experimento (zera contadores) - Admin apenas
 */
router.post('/reset', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await abTesting.resetExperiment();
    
    res.json({
      success: true,
      message: 'Experimento reiniciado com sucesso'
    });
  } catch (error) {
    console.error('❌ [API] Erro ao reiniciar experimento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reiniciar experimento'
    });
  }
});

/**
 * GET /api/ab-testing/variants
 * Lista todas as variantes disponíveis
 */
router.get('/variants', authenticate, isAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      variants: abTesting.COUPON_VARIANTS
    });
  } catch (error) {
    console.error('❌ [API] Erro ao listar variantes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar variantes'
    });
  }
});

/**
 * POST /api/ab-testing/record/coupon-used
 * Registra que um cupom foi usado (chamado pelo frontend)
 */
router.post('/record/coupon-used', async (req, res) => {
  try {
    const { couponCode, revenue } = req.body;
    
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Código do cupom é obrigatório'
      });
    }
    
    await abTesting.recordCouponUsed(couponCode, revenue || 0);
    
    res.json({
      success: true,
      message: 'Uso de cupom registrado'
    });
  } catch (error) {
    console.error('❌ [API] Erro ao registrar uso de cupom:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar uso de cupom'
    });
  }
});

/**
 * POST /api/ab-testing/record/conversion
 * Registra uma conversão (chamado após compra bem-sucedida)
 */
router.post('/record/conversion', async (req, res) => {
  try {
    const { couponCode, revenue } = req.body;
    
    if (!couponCode || !revenue) {
      return res.status(400).json({
        success: false,
        message: 'Código do cupom e receita são obrigatórios'
      });
    }
    
    await abTesting.recordConversion(couponCode, revenue);
    
    res.json({
      success: true,
      message: 'Conversão registrada'
    });
  } catch (error) {
    console.error('❌ [API] Erro ao registrar conversão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar conversão'
    });
  }
});

module.exports = router;



