const pool = require('../config/database');

/**
 * Registra movimentação no histórico de estoque
 */
async function recordStockHistory(productId, orderId, userId, type, quantityChange, quantityBefore, quantityAfter, reason = null) {
  try {
    await pool.execute(
      `INSERT INTO stock_history (product_id, order_id, user_id, type, quantity_change, quantity_before, quantity_after, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, orderId, userId, type, quantityChange, quantityBefore, quantityAfter, reason]
    );
    console.log(`📊 [STOCK] Histórico registrado: Produto ${productId}, Tipo: ${type}, Mudança: ${quantityChange}`);
  } catch (error) {
    console.error('❌ [STOCK] Erro ao registrar histórico:', error);
    // Não bloqueia a operação principal
  }
}

/**
 * Reduz estoque do produto (venda confirmada)
 */
async function reduceStock(productId, quantity, orderId) {
  try {
    // Buscar estoque atual
    const [product] = await pool.execute('SELECT stock FROM products WHERE id = ?', [productId]);
    
    if (product.length === 0) {
      throw new Error(`Produto ${productId} não encontrado`);
    }
    
    const currentStock = product[0].stock;
    const newStock = Math.max(0, currentStock - quantity);
    
    if (currentStock < quantity) {
      throw new Error(`Estoque insuficiente. Disponível: ${currentStock}, Solicitado: ${quantity}`);
    }
    
    // Atualizar estoque
    await pool.execute('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
    
    // Registrar histórico
    await recordStockHistory(
      productId,
      orderId,
      null,
      'sale',
      -quantity,
      currentStock,
      newStock
    );
    
    console.log(`📦 [STOCK] Estoque reduzido: Produto ${productId}, ${currentStock} → ${newStock} (${-quantity})`);
    
    // Verificar estoque baixo e notificar admin se necessário
    await checkLowStock(productId);
    
    return newStock;
  } catch (error) {
    console.error(`❌ [STOCK] Erro ao reduzir estoque do produto ${productId}:`, error);
    throw error;
  }
}

/**
 * Restaura estoque do produto (pedido cancelado)
 */
async function restoreStock(productId, quantity, orderId) {
  try {
    // Buscar estoque atual
    const [product] = await pool.execute('SELECT stock FROM products WHERE id = ?', [productId]);
    
    if (product.length === 0) {
      throw new Error(`Produto ${productId} não encontrado`);
    }
    
    const currentStock = product[0].stock;
    const newStock = currentStock + quantity;
    
    // Atualizar estoque
    await pool.execute('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
    
    // Registrar histórico
    await recordStockHistory(
      productId,
      orderId,
      null,
      'cancel',
      quantity,
      currentStock,
      newStock
    );
    
    console.log(`📦 [STOCK] Estoque restaurado: Produto ${productId}, ${currentStock} → ${newStock} (+${quantity})`);
    
    return newStock;
  } catch (error) {
    console.error(`❌ [STOCK] Erro ao restaurar estoque do produto ${productId}:`, error);
    throw error;
  }
}

/**
 * Atualização manual de estoque (admin)
 */
async function updateStockManually(productId, newQuantity, userId, reason) {
  try {
    // Buscar estoque atual
    const [product] = await pool.execute('SELECT stock FROM products WHERE id = ?', [productId]);
    
    if (product.length === 0) {
      throw new Error(`Produto ${productId} não encontrado`);
    }
    
    const currentStock = product[0].stock;
    const quantityChange = newQuantity - currentStock;
    const type = quantityChange > 0 ? 'manual_add' : quantityChange < 0 ? 'manual_remove' : 'adjustment';
    
    // Atualizar estoque
    await pool.execute('UPDATE products SET stock = ? WHERE id = ?', [newQuantity, productId]);
    
    // Registrar histórico
    await recordStockHistory(
      productId,
      null,
      userId,
      type,
      quantityChange,
      currentStock,
      newQuantity,
      reason
    );
    
    console.log(`📦 [STOCK] Estoque atualizado manualmente: Produto ${productId}, ${currentStock} → ${newQuantity} (${quantityChange > 0 ? '+' : ''}${quantityChange})`);
    
    return newQuantity;
  } catch (error) {
    console.error(`❌ [STOCK] Erro ao atualizar estoque manualmente do produto ${productId}:`, error);
    throw error;
  }
}

/**
 * Verifica se o estoque está baixo e envia notificação ao admin
 */
async function checkLowStock(productId, threshold = 5) {
  try {
    const [product] = await pool.execute(
      'SELECT id, name, stock FROM products WHERE id = ?',
      [productId]
    );
    
    if (product.length === 0) return;
    
    const currentStock = product[0].stock;
    
    // Verificar se estoque está baixo e se já foi notificado recentemente
    if (currentStock <= threshold) {
      const lastNotified = await pool.execute(
        `SELECT created_at FROM stock_history 
         WHERE product_id = ? AND type = 'low_stock_notification'
         ORDER BY created_at DESC LIMIT 1`,
        [productId]
      );
      
      // Se foi notificado há menos de 24 horas, não notificar novamente
      if (lastNotified.length > 0) {
        const lastNotificationDate = new Date(lastNotified[0].created_at);
        const hoursSinceNotification = (Date.now() - lastNotificationDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceNotification < 24) {
          return; // Já notificado recentemente
        }
      }
      
      // Buscar admins
      const [admins] = await pool.execute(
        'SELECT email, name FROM users WHERE role = ?',
        ['admin']
      );
      
      if (admins.length > 0) {
        const emailService = require('../config/email');
        
        for (const admin of admins) {
          try {
            await emailService.sendEmail(
              admin.email,
              emailService.emailTemplates.lowStock,
              {
                productName: product[0].name,
                currentStock: currentStock,
                threshold: threshold,
                productId: productId
              }
            );
            
            // Registrar notificação no histórico
            await recordStockHistory(
              productId,
              null,
              null,
              'low_stock_notification',
              0,
              currentStock,
              currentStock,
              `Notificação de estoque baixo enviada para ${admin.email}`
            );
          } catch (emailError) {
            console.error(`❌ [STOCK] Erro ao enviar email de estoque baixo:`, emailError);
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ [STOCK] Erro ao verificar estoque baixo:`, error);
  }
}

/**
 * Reduz estoque de todos os itens de um pedido quando pagamento é confirmado
 */
async function reduceStockFromOrder(orderId) {
  try {
    // Buscar itens do pedido
    const [items] = await pool.execute(
      `SELECT oi.product_id, oi.quantity 
       FROM order_items oi 
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    for (const item of items) {
      await reduceStock(item.product_id, item.quantity, orderId);
    }
    
    console.log(`✅ [STOCK] Estoque reduzido para todos os itens do pedido ${orderId}`);
  } catch (error) {
    console.error(`❌ [STOCK] Erro ao reduzir estoque do pedido ${orderId}:`, error);
    throw error;
  }
}

/**
 * Restaura estoque de todos os itens de um pedido cancelado
 */
async function restoreStockFromOrder(orderId) {
  try {
    // Buscar itens do pedido
    const [items] = await pool.execute(
      `SELECT oi.product_id, oi.quantity 
       FROM order_items oi 
       WHERE oi.order_id = ?`,
      [orderId]
    );
    
    for (const item of items) {
      await restoreStock(item.product_id, item.quantity, orderId);
    }
    
    console.log(`✅ [STOCK] Estoque restaurado para todos os itens do pedido ${orderId}`);
  } catch (error) {
    console.error(`❌ [STOCK] Erro ao restaurar estoque do pedido ${orderId}:`, error);
    throw error;
  }
}

module.exports = {
  reduceStock,
  restoreStock,
  updateStockManually,
  checkLowStock,
  reduceStockFromOrder,
  restoreStockFromOrder,
  recordStockHistory
};

