const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Garantir que a tabela notifications existe
async function ensureNotificationsTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) DEFAULT 'return_status',
        title VARCHAR(255) NOT NULL,
        message TEXT,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✅ [NOTIFICATIONS] Tabela notifications verificada/criada');
  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Erro ao criar tabela:', error.message);
  }
}

// Executar ao carregar o módulo
ensureNotificationsTable();

// GET /api/notifications - Listar notificações do usuário autenticado
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [notifications] = await pool.execute(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);
    
    res.json({
      success: true,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        is_read: n.is_read === 1 || n.is_read === true,
        created_at: n.created_at
      })),
      unread_count: notifications.filter(n => !n.is_read).length
    });
  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

// GET /api/notifications/unread - Contar notificações não lidas
router.get('/unread', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [result] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND is_read = false
    `, [userId]);
    
    res.json({
      success: true,
      count: result[0].count || 0
    });
  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Erro ao contar notificações:', error);
    res.status(500).json({ error: 'Erro ao contar notificações' });
  }
});

// PATCH /api/notifications/:id/read - Marcar notificação como lida
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    
    // Verificar se a notificação pertence ao usuário
    const [notification] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, userId]
    );
    
    if (notification.length === 0) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }
    
    await pool.execute(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [notificationId]
    );
    
    res.json({ success: true, message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Erro ao marcar como lida:', error);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
});

// PATCH /api/notifications/read-all - Marcar todas como lidas
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pool.execute(
      'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false',
      [userId]
    );
    
    res.json({ success: true, message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Erro ao marcar todas como lidas:', error);
    res.status(500).json({ error: 'Erro ao marcar notificações' });
  }
});

module.exports = router;
