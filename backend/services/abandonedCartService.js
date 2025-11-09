const pool = require('../config/database');
const { sendEmail, emailTemplates } = require('../config/email');
const abTesting = require('./abTestingService');

/**
 * Salva ou atualiza um carrinho abandonado
 */
async function saveAbandonedCart(userId, sessionId, email, cartItems, total) {
  try {
    // Verificar se já existe um carrinho para este usuário/sessão
    let query, params;
    
    if (userId) {
      query = 'SELECT id FROM abandoned_carts WHERE user_id = ? AND recovered = false';
      params = [userId];
    } else {
      query = 'SELECT id FROM abandoned_carts WHERE session_id = ? AND recovered = false';
      params = [sessionId];
    }
    
    const [existing] = await pool.execute(query, params);
    
    if (existing.length > 0) {
      // Atualizar carrinho existente
      await pool.execute(
        `UPDATE abandoned_carts 
         SET cart_items = ?, total = ?, last_activity = CURRENT_TIMESTAMP, email = ?
         WHERE id = ?`,
        [JSON.stringify(cartItems), total, email, existing[0].id]
      );
      console.log(`🛒 [ABANDONED CART] Carrinho atualizado: ID ${existing[0].id}`);
      return existing[0].id;
    } else {
      // Criar novo carrinho abandonado
      const [result] = await pool.execute(
        `INSERT INTO abandoned_carts (user_id, session_id, email, cart_items, total, last_activity)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [userId, sessionId, email, JSON.stringify(cartItems), total]
      );
      console.log(`🛒 [ABANDONED CART] Novo carrinho salvo: ID ${result.insertId}`);
      return result.insertId;
    }
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao salvar carrinho:', error);
    throw error;
  }
}

/**
 * Marca um carrinho como recuperado (quando o usuário finaliza a compra)
 */
async function markCartAsRecovered(userId, sessionId) {
  try {
    let query, params;
    
    if (userId) {
      query = 'UPDATE abandoned_carts SET recovered = true WHERE user_id = ? AND recovered = false';
      params = [userId];
    } else if (sessionId) {
      query = 'UPDATE abandoned_carts SET recovered = true WHERE session_id = ? AND recovered = false';
      params = [sessionId];
    } else {
      return;
    }
    
    await pool.execute(query, params);
    console.log(`✅ [ABANDONED CART] Carrinho marcado como recuperado`);
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao marcar carrinho como recuperado:', error);
  }
}

/**
 * Busca carrinhos abandonados (últimos 24h, sem email enviado ou com apenas 1 email)
 */
async function findAbandonedCarts() {
  try {
    const [carts] = await pool.execute(
      `SELECT ac.*, u.name as user_name
       FROM abandoned_carts ac
       LEFT JOIN users u ON ac.user_id = u.id
       WHERE ac.recovered = false
         AND ac.email_sent_count < 2
         AND ac.last_activity BETWEEN DATE_SUB(NOW(), INTERVAL 48 HOUR) AND DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY ac.last_activity DESC`
    );
    
    console.log(`📊 [ABANDONED CART] Encontrados ${carts.length} carrinhos abandonados`);
    return carts;
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao buscar carrinhos abandonados:', error);
    return [];
  }
}

/**
 * Gera um cupom de recuperação único baseado na variante do A/B test
 */
function generateRecoveryCoupon(variant) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const prefix = variant.type === 'free_shipping' ? 'FRETE' : `VOLTA${variant.value}`;
  return `${prefix}-${timestamp}`;
}

/**
 * Cria cupom de desconto para recuperação de carrinho usando A/B Testing
 */
async function createRecoveryCoupon(cartId) {
  try {
    // Selecionar melhor variante usando A/B Testing
    const variant = await abTesting.selectBestVariant();
    const code = generateRecoveryCoupon(variant);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Válido por 7 dias
    
    // Criar cupom baseado na variante
    await pool.execute(
      `INSERT INTO coupons (code, type, value, valid_until, max_uses, status)
       VALUES (?, ?, ?, ?, 1, 'active')`,
      [code, variant.type, variant.value, expiryDate.toISOString().split('T')[0]]
    );
    
    console.log(`🎟️ [ABANDONED CART] Cupom A/B criado: ${code} (${variant.label})`);
    
    // Registrar no A/B Testing
    await abTesting.recordEmailSent(variant.id, cartId, code);
    
    return { code, variant };
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao criar cupom:', error);
    return null;
  }
}

/**
 * Envia email de recuperação de carrinho abandonado
 */
async function sendAbandonedCartEmail(cart) {
  try {
    if (!cart.email) {
      console.log(`⚠️ [ABANDONED CART] Carrinho ${cart.id} sem email, pulando...`);
      return false;
    }
    
    // Criar cupom de desconto com A/B Testing
    const couponData = await createRecoveryCoupon(cart.id);
    if (!couponData) return false;
    
    const { code: coupon, variant } = couponData;
    
    // Parsear itens do carrinho
    const cartItems = typeof cart.cart_items === 'string' 
      ? JSON.parse(cart.cart_items) 
      : cart.cart_items;
    
    // Preparar dados para o email
    const emailData = {
      name: cart.user_name || 'Cliente',
      email: cart.email,
      items: cartItems.map(item => ({
        name: item.name || item.product_name || 'Produto',
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.image || item.imageUrl || ''
      })),
      subtotal: cart.total,
      coupon: coupon,
      couponText: `Use o cupom para ganhar ${variant.label}`,
      checkoutUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:8080'
    };
    
    // Enviar email
    const result = await sendEmail(cart.email, emailTemplates.abandonedCart, emailData);
    
    if (result.success) {
      // Atualizar contador de emails enviados
      await pool.execute(
        'UPDATE abandoned_carts SET email_sent_count = email_sent_count + 1 WHERE id = ?',
        [cart.id]
      );
      
      console.log(`✅ [ABANDONED CART] Email enviado para ${cart.email} (Carrinho #${cart.id})`);
      return true;
    } else {
      console.error(`❌ [ABANDONED CART] Falha ao enviar email para ${cart.email}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ [ABANDONED CART] Erro ao enviar email de carrinho abandonado:`, error);
    return false;
  }
}

/**
 * Processa todos os carrinhos abandonados (executado pelo cron)
 */
async function processAbandonedCarts() {
  try {
    console.log('🔄 [ABANDONED CART] Iniciando processamento de carrinhos abandonados...');
    
    const carts = await findAbandonedCarts();
    let sentCount = 0;
    
    for (const cart of carts) {
      const sent = await sendAbandonedCartEmail(cart);
      if (sent) sentCount++;
      
      // Pequeno delay entre emails para não sobrecarregar o servidor de email
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ [ABANDONED CART] Processamento concluído: ${sentCount}/${carts.length} emails enviados`);
    return { total: carts.length, sent: sentCount };
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao processar carrinhos abandonados:', error);
    return { total: 0, sent: 0, error: error.message };
  }
}

/**
 * Limpa carrinhos antigos (mais de 30 dias)
 */
async function cleanupOldCarts() {
  try {
    const [result] = await pool.execute(
      `DELETE FROM abandoned_carts 
       WHERE last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    
    console.log(`🗑️ [ABANDONED CART] Removidos ${result.affectedRows} carrinhos antigos`);
    return result.affectedRows;
  } catch (error) {
    console.error('❌ [ABANDONED CART] Erro ao limpar carrinhos antigos:', error);
    return 0;
  }
}

module.exports = {
  saveAbandonedCart,
  markCartAsRecovered,
  findAbandonedCarts,
  sendAbandonedCartEmail,
  processAbandonedCarts,
  cleanupOldCarts
};

