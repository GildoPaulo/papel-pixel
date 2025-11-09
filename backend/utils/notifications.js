const pool = require('../config/database');

// Tipo de notificações
const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PROMOTION: 'promotion',
  NEW_PRODUCT: 'new_product'
};

// Criar notificação
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)',
      [userId, type, title, message, data ? JSON.stringify(data) : null]
    );

    return { id: result.insertId };
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
};

// Buscar notificações do usuário
const getUserNotifications = async (userId, limit = 50) => {
  try {
    const [notifications] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );

    return notifications;
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    throw error;
  }
};

// Marcar notificação como lida
const markAsRead = async (notificationId, userId) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    throw error;
  }
};

// Marcar todas como lidas
const markAllAsRead = async (userId) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = ? AND is_read = false',
      [userId]
    );
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    throw error;
  }
};

// Notificar sobre novo pedido
const notifyOrderConfirmation = async (order, user) => {
  const notification = await createNotification(
    order.user_id,
    NOTIFICATION_TYPES.ORDER_CONFIRMED,
    'Pedido Confirmado',
    `Seu pedido #${order.id} foi confirmado e está sendo processado.`,
    { orderId: order.id }
  );

  return notification;
};

// Notificar sobre envio
const notifyOrderShipped = async (order, user) => {
  const notification = await createNotification(
    order.user_id,
    NOTIFICATION_TYPES.ORDER_SHIPPED,
    'Pedido Enviado',
    `Seu pedido #${order.id} foi enviado!`,
    { orderId: order.id }
  );

  return notification;
};

// Notificar sobre entrega
const notifyOrderDelivered = async (order, user) => {
  const notification = await createNotification(
    order.user_id,
    NOTIFICATION_TYPES.ORDER_DELIVERED,
    'Pedido Entregue',
    `Seu pedido #${order.id} foi entregue. Obrigado pela sua compra!`,
    { orderId: order.id }
  );

  return notification;
};

// Notificar sobre promoção
const notifyPromotion = async (userId, promotion) => {
  const notification = await createNotification(
    userId,
    NOTIFICATION_TYPES.PROMOTION,
    'Nova Promoção!',
    `Conheça nossa nova promoção: ${promotion.title}`,
    { promotionId: promotion.id }
  );

  return notification;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  notifyOrderConfirmation,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyPromotion,
  NOTIFICATION_TYPES
};

