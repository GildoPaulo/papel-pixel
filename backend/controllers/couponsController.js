const pool = require('../config/database');

// Buscar todos os cupons (Admin)
exports.getAllCoupons = async (req, res) => {
  try {
    const [coupons] = await pool.execute(
      `SELECT 
        id,
        code,
        discount_type as type,
        discount_value as value,
        min_purchase,
        expires_at,
        valid_until,
        usage_limit as max_uses,
        times_used,
        active,
        status,
        applicable_categories,
        created_at,
        updated_at
      FROM coupons ORDER BY created_at DESC`
    );

    // Mapear para formato esperado pelo frontend
    const formattedCoupons = coupons.map(c => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: parseFloat(c.value),
      min_purchase: c.min_purchase ? parseFloat(c.min_purchase) : 0,
      valid_until: c.valid_until || c.expires_at,
      max_uses: c.max_uses,
      times_used: c.times_used || 0,
      status: c.status || (c.active ? 'active' : 'inactive'),
      applicable_categories: c.applicable_categories,
      created_at: c.created_at,
      updated_at: c.updated_at
    }));

    res.json(formattedCoupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: error.message });
  }
};

// Buscar cupom por código
exports.getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const [coupons] = await pool.execute(
      'SELECT * FROM coupons WHERE code = ? AND active = true AND (expires_at IS NULL OR expires_at > NOW())',
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ error: 'Cupom inválido ou expirado' });
    }

    res.json(coupons[0]);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ error: error.message });
  }
};

// Criar cupom (Admin)
exports.createCoupon = async (req, res) => {
  try {
    // Aceitar ambos os formatos (antigo e novo)
    const code = req.body.code;
    const type = req.body.type || req.body.discount_type;
    const value = req.body.value || req.body.discount_value;
    const min_purchase = req.body.min_purchase;
    const max_uses = req.body.max_uses || req.body.usage_limit;
    const valid_until = req.body.valid_until || req.body.expires_at;
    const applicable_categories = req.body.applicable_categories || req.body.category;
    const status = req.body.status || 'active';

    console.log('📝 [CUPOM] Dados recebidos:', req.body);

    if (!code || !type || (type !== 'free_shipping' && !value)) {
      return res.status(400).json({ error: 'Campos obrigatórios: code, type, value' });
    }

    // Verificar se o código já existe
    const [existing] = await pool.execute(
      'SELECT * FROM coupons WHERE code = ?',
      [code.toUpperCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Código de cupom já existe' });
    }

    // Inserir cupom (usar colunas antigas da tabela)
    const [result] = await pool.execute(
      `INSERT INTO coupons (
        code, discount_type, discount_value, min_purchase, 
        expires_at, usage_limit, active, 
        valid_until, max_uses, status, applicable_categories
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(), 
        type,                           // discount_type
        value || 0,                     // discount_value
        min_purchase || null,           // min_purchase
        valid_until || null,            // expires_at
        max_uses || null,               // usage_limit
        status === 'active' ? 1 : 0,    // active (boolean)
        valid_until || null,            // valid_until (coluna nova)
        max_uses || null,               // max_uses (coluna nova)
        status || 'active',             // status (coluna nova)
        applicable_categories || null   // applicable_categories (coluna nova)
      ]
    );

    console.log('✅ [CUPOM] Cupom criado:', code.toUpperCase());

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Cupom criado com sucesso',
      coupon: {
        id: result.insertId,
        code: code.toUpperCase(),
        type,
        value
      }
    });
  } catch (error) {
    console.error('❌ [CUPOM] Error creating coupon:', error);
    res.status(500).json({ error: error.message });
  }
};

// Aplicar cupom (validar)
exports.applyCoupon = async (req, res) => {
  try {
    const { code, total } = req.body;

    if (!code || !total) {
      return res.status(400).json({ error: 'Código do cupom e total são obrigatórios' });
    }

    const [coupons] = await pool.execute(
      'SELECT * FROM coupons WHERE code = ? AND active = true',
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }

    const coupon = coupons[0];

    // Verificar validade
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Cupom expirado' });
    }

    // Verificar valor mínimo
    if (coupon.min_purchase && total < coupon.min_purchase) {
      return res.status(400).json({ 
        error: `Valor mínimo para este cupom é ${coupon.min_purchase} MZN` 
      });
    }

    // Verificar limite de uso
    if (coupon.usage_limit) {
      const [usage] = await pool.execute(
        'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ?',
        [coupon.id]
      );

      if (usage[0].count >= coupon.usage_limit) {
        return res.status(400).json({ error: 'Cupom atingiu o limite de uso' });
      }
    }

    // Calcular desconto
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (total * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else if (coupon.discount_type === 'fixed') {
      discount = coupon.discount_value;
    }

    const finalTotal = total - discount;

    res.json({
      coupon,
      discount,
      originalTotal: total,
      finalTotal: finalTotal >= 0 ? finalTotal : 0
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: error.message });
  }
};

// Atualizar cupom (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { active, discount_type, discount_value, expires_at } = req.body;

    await pool.execute(
      'UPDATE coupons SET active = ?, discount_type = ?, discount_value = ?, expires_at = ?, updated_at = NOW() WHERE id = ?',
      [active, discount_type, discount_value, expires_at, id]
    );

    res.json({ message: 'Cupom atualizado com sucesso' });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: error.message });
  }
};

// Deletar cupom (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM coupons WHERE id = ?', [id]);

    res.json({ message: 'Cupom deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: error.message });
  }
};

