const pool = require('../config/database');

/**
 * Sistema de A/B Testing para Cupons de Recuperação
 * 
 * Testa diferentes variantes de cupons para carrinhos abandonados
 * e escolhe automaticamente o que tem melhor taxa de conversão
 */

// Variantes de cupons disponíveis
const COUPON_VARIANTS = [
  { id: 1, type: 'percentage', value: 10, label: '10% OFF' },
  { id: 2, type: 'percentage', value: 15, label: '15% OFF' },
  { id: 3, type: 'percentage', value: 20, label: '20% OFF' },
  { id: 4, type: 'free_shipping', value: 0, label: 'FRETE GRÁTIS' },
  { id: 5, type: 'fixed', value: 50, label: '50 MZN OFF' },
];

/**
 * Cria ou atualiza a tabela de experimentos A/B
 */
async function ensureABTestTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ab_test_experiments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        variant_id INT NOT NULL,
        variant_type VARCHAR(50) NOT NULL,
        variant_value DECIMAL(10, 2) NOT NULL,
        variant_label VARCHAR(100) NOT NULL,
        emails_sent INT DEFAULT 0,
        coupons_used INT DEFAULT 0,
        conversions INT DEFAULT 0,
        conversion_rate DECIMAL(5, 2) DEFAULT 0.00,
        total_revenue DECIMAL(10, 2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_variant (variant_id),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Criar tabela de eventos para rastreamento
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ab_test_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        experiment_id INT NOT NULL,
        abandoned_cart_id INT NOT NULL,
        coupon_code VARCHAR(100),
        event_type ENUM('email_sent', 'coupon_used', 'conversion') NOT NULL,
        revenue DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experiment_id) REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
        INDEX idx_cart (abandoned_cart_id),
        INDEX idx_type (event_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ [A/B TEST] Tabelas de experimento criadas/verificadas');
    
    // Inicializar variantes se não existirem
    await initializeVariants();
  } catch (error) {
    console.error('❌ [A/B TEST] Erro ao criar tabelas:', error);
  }
}

/**
 * Inicializa as variantes no banco de dados
 */
async function initializeVariants() {
  try {
    for (const variant of COUPON_VARIANTS) {
      await pool.execute(
        `INSERT INTO ab_test_experiments (variant_id, variant_type, variant_value, variant_label)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
        [variant.id, variant.type, variant.value, variant.label]
      );
    }
    console.log('✅ [A/B TEST] Variantes inicializadas');
  } catch (error) {
    console.error('❌ [A/B TEST] Erro ao inicializar variantes:', error);
  }
}

/**
 * Seleciona a melhor variante baseada na taxa de conversão
 * Usa algoritmo Epsilon-Greedy para balancear exploração vs. exploração
 */
async function selectBestVariant() {
  try {
    const [variants] = await pool.execute(
      `SELECT * FROM ab_test_experiments WHERE is_active = true ORDER BY conversion_rate DESC`
    );
    
    if (variants.length === 0) {
      // Se não houver dados, retornar variante padrão
      return COUPON_VARIANTS[0];
    }
    
    // Epsilon-Greedy: 20% exploração, 80% exploração
    const epsilon = 0.2;
    const shouldExplore = Math.random() < epsilon;
    
    if (shouldExplore) {
      // Exploração: escolher variante aleatória
      const randomIndex = Math.floor(Math.random() * variants.length);
      return convertDbVariantToCoupon(variants[randomIndex]);
    } else {
      // Exploração: escolher melhor variante
      // Se todas têm 0 conversão, escolher aleatoriamente
      const bestVariant = variants[0];
      if (bestVariant.emails_sent < 10) {
        // Ainda coletando dados iniciais, escolher aleatoriamente
        const randomIndex = Math.floor(Math.random() * variants.length);
        return convertDbVariantToCoupon(variants[randomIndex]);
      }
      return convertDbVariantToCoupon(bestVariant);
    }
  } catch (error) {
    console.error('❌ [A/B TEST] Erro ao selecionar variante:', error);
    return COUPON_VARIANTS[0]; // Fallback para variante padrão
  }
}

/**
 * Converte variante do banco para formato de cupom
 */
function convertDbVariantToCoupon(dbVariant) {
  return {
    id: dbVariant.variant_id,
    type: dbVariant.variant_type,
    value: parseFloat(dbVariant.variant_value),
    label: dbVariant.variant_label
  };
}

/**
 * Registra que um email foi enviado com determinada variante
 */
async function recordEmailSent(variantId, abandonedCartId, couponCode) {
  try {
    // Buscar o experimento
    const [experiments] = await pool.execute(
      'SELECT id FROM ab_test_experiments WHERE variant_id = ?',
      [variantId]
    );
    
    if (experiments.length === 0) return;
    
    const experimentId = experiments[0].id;
    
    // Incrementar contador
    await pool.execute(
      'UPDATE ab_test_experiments SET emails_sent = emails_sent + 1 WHERE id = ?',
      [experimentId]
    );
    
    // Registrar evento
    await pool.execute(
      `INSERT INTO ab_test_events (experiment_id, abandoned_cart_id, coupon_code, event_type)
       VALUES (?, ?, ?, 'email_sent')`,
      [experimentId, abandonedCartId, couponCode]
    );
    
    console.log(`📊 [A/B TEST] Email registrado: Variante ${variantId}`);
  } catch (error) {
    console.error('❌ [A/B TEST] Erro ao registrar email:', error);
  }
}

/**
 * Registra que um cupom foi usado
 */
async function recordCouponUsed(couponCode, revenue = 0) {
  try {
    // Buscar o evento de email relacionado ao cupom
    const [events] = await pool.execute(
      `SELECT experiment_id, abandoned_cart_id FROM ab_test_events 
       WHERE coupon_code = ? AND event_type = 'email_sent' 
       ORDER BY created_at DESC LIMIT 1`,
      [couponCode]
    );
    
    if (events.length === 0) return;
    
    const { experiment_id, abandoned_cart_id } = events[0];
    
    // Incrementar contador de uso
    await pool.execute(
      'UPDATE ab_test_experiments SET coupons_used = coupons_used + 1 WHERE id = ?',
      [experiment_id]
    );
    
    // Registrar evento
    await pool.execute(
      `INSERT INTO ab_test_events (experiment_id, abandoned_cart_id, coupon_code, event_type, revenue)
       VALUES (?, ?, ?, 'coupon_used', ?)`,
      [experiment_id, abandoned_cart_id, couponCode, revenue]
    );
    
    console.log(`📊 [A/B TEST] Cupom usado: ${couponCode}`);
  } catch (error) {
    console.error('❌ [A/B TEST] Erro ao registrar uso de cupom:', error);
  }
}

/**
 * Registra uma conversão (compra completa)
 */
async function recordConversion(couponCode, revenue) {
  try {
    // Buscar o evento de cupom usado
    const [events] = await pool.execute(
      `SELECT experiment_id, abandoned_cart_id FROM ab_test_events 
       WHERE coupon_code = ? AND event_type = 'coupon_used' 
       ORDER BY created_at DESC LIMIT 1`,
      [couponCode]
    );
    
    if (events.length === 0) return;
    
    const { experiment_id, abandoned_cart_id } = events[0];
    
    // Incrementar conversão e receita
    await pool.execute(
      `UPDATE ab_test_experiments 
       SET conversions = conversions + 1, 
           total_revenue = total_revenue + ?
       WHERE id = ?`,
      [revenue, experiment_id]
    );
    
    // Recalcular taxa de conversão
    await pool.execute(
      `UPDATE ab_test_experiments 
       SET conversion_rate = (conversions / NULLIF(emails_sent, 0)) * 100
       WHERE id = ?`,
      [experiment_id]
    );
    
    // Registrar evento
    await pool.execute(
      `INSERT INTO ab_test_events (experiment_id, abandoned_cart_id, coupon_code, event_type, revenue)
       VALUES (?, ?, ?, 'conversion', ?)`,
      [experiment_id, abandoned_cart_id, couponCode, revenue]
    );
    
    console.log(`📊 [A/B TEST] Conversão registrada: ${couponCode} - ${revenue} MZN`);
  } catch (error) {
    console.error('❌ [A/B TEST] Erro ao registrar conversão:', error);
  }
}

/**
 * Obtém relatório de desempenho de todas as variantes
 */
async function getPerformanceReport() {
  try {
    const [results] = await pool.execute(
      `SELECT 
        variant_id,
        variant_label,
        variant_type,
        variant_value,
        emails_sent,
        coupons_used,
        conversions,
        conversion_rate,
        total_revenue,
        (total_revenue / NULLIF(conversions, 0)) as avg_order_value,
        is_active
       FROM ab_test_experiments
       ORDER BY conversion_rate DESC`
    );
    
    return results;
  } catch (error) {
    console.error('❌ [A/B TEST] Erro ao gerar relatório:', error);
    return [];
  }
}

/**
 * Reinicia experimento (zerar contadores)
 */
async function resetExperiment() {
  try {
    await pool.execute(
      `UPDATE ab_test_experiments SET 
        emails_sent = 0,
        coupons_used = 0,
        conversions = 0,
        conversion_rate = 0.00,
        total_revenue = 0.00`
    );
    
    await pool.execute('DELETE FROM ab_test_events');
    
    console.log('✅ [A/B TEST] Experimento reiniciado');
    return { success: true };
  } catch (error) {
    console.error('❌ [A/B TEST] Erro ao reiniciar experimento:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  ensureABTestTable,
  selectBestVariant,
  recordEmailSent,
  recordCouponUsed,
  recordConversion,
  getPerformanceReport,
  resetExperiment,
  COUPON_VARIANTS
};



