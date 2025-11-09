const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const pool = require('../config/database');

// GET /api/receipt/:orderId - Gerar PDF do recibo profissional
router.get('/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    
    // Buscar pedido com mais informações
    const [orders] = await pool.execute(`
      SELECT o.*, u.name as customer_name, u.email as customer_email,
             o.shipping_name, o.shipping_email, o.shipping_phone, 
             o.shipping_address, o.shipping_city, o.shipping_province,
             o.payment_method
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    const order = orders[0];
    
    // Buscar itens com nome do produto
    const [items] = await pool.execute(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);
    
    order.items = items;
    
    // Criar PDF com margens adequadas
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    
    // Configurar response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="recibo-${orderId}.pdf"`);
    
    // Pipe para resposta
    doc.pipe(res);
    
    // ==========================================
    // HEADER PROFISSIONAL
    // ==========================================
    doc.fillColor('#1a1a1a');
    
    // Retângulo de cabeçalho
    doc.rect(50, 50, 495, 80)
       .fillColor('#2563eb')
       .fill()
       .fillColor('#ffffff');
    
    // Título da loja
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .text('Papel & Pixel', 60, 70, { 
         width: 475,
         align: 'center',
         color: '#ffffff'
       });
    
    // Subtítulo
    doc.fontSize(14)
       .font('Helvetica')
       .text('Materiais de Qualidade para Educação e Criatividade', 60, 105, {
         width: 475,
         align: 'center',
         color: '#ffffff'
       });
    
    // Tipo de documento
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('RECIBO DE COMPRA', 60, 140, {
         width: 475,
         align: 'center',
         color: '#1a1a1a'
       });
    
    doc.moveDown(1.5);
    
    // ==========================================
    // INFORMAÇÕES DO PEDIDO
    // ==========================================
    doc.fillColor('#1a1a1a');
    
    // Box de informações do pedido
    const infoBoxY = doc.y;
    doc.rect(50, infoBoxY, 495, 90)
       .fillColor('#f3f4f6')
       .fill()
       .fillColor('#1a1a1a');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('INFORMAÇÕES DO PEDIDO', 60, infoBoxY + 10);
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Número do Pedido:`, 60, infoBoxY + 30, { continued: true })
       .font('Helvetica-Bold')
       .fillColor('#2563eb')
       .text(` #${order.id}`, { continued: false })
       .fillColor('#1a1a1a');
    
    const orderDate = new Date(order.created_at).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.font('Helvetica')
       .text(`Data da Compra: ${orderDate}`, 60, infoBoxY + 45);
    doc.text(`Status: ${getStatusLabel(order.status)}`, 60, infoBoxY + 60);
    doc.text(`Método de Pagamento: ${getPaymentMethodLabel(order.payment_method)}`, 60, infoBoxY + 75);
    
    doc.moveDown(2);
    
    // ==========================================
    // DADOS DO CLIENTE E ENDEREÇO
    // ==========================================
    const clientBoxY = doc.y;
    const boxHeight = 110;
    
    // Dados do Cliente (esquerda)
    doc.rect(50, clientBoxY, 240, boxHeight)
       .fillColor('#f9fafb')
       .fill()
       .fillColor('#1a1a1a');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('DADOS DO CLIENTE', 60, clientBoxY + 10);
    
    doc.fontSize(10)
       .font('Helvetica');
    
    const clientName = order.shipping_name || order.customer_name || 'N/A';
    const clientEmail = order.shipping_email || order.customer_email || 'N/A';
    const clientPhone = order.shipping_phone || 'N/A';
    
    doc.text(`Nome: ${clientName}`, 60, clientBoxY + 30, { width: 220, ellipsis: true });
    doc.text(`Email: ${clientEmail}`, 60, clientBoxY + 45, { width: 220, ellipsis: true });
    doc.text(`Telefone: ${clientPhone}`, 60, clientBoxY + 60, { width: 220 });
    
    // Endereço de entrega (direita)
    doc.rect(305, clientBoxY, 240, boxHeight)
       .fillColor('#f9fafb')
       .fill()
       .fillColor('#1a1a1a');
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('ENDEREÇO DE ENTREGA', 315, clientBoxY + 10);
    
    doc.fontSize(10)
       .font('Helvetica');
    
    // Formatar endereço corretamente
    const addressText = [];
    if (order.shipping_address && order.shipping_address !== 'N/A') {
      addressText.push(order.shipping_address);
    }
    
    const cityProvince = [];
    if (order.shipping_city) cityProvince.push(order.shipping_city);
    if (order.shipping_province) cityProvince.push(order.shipping_province);
    if (cityProvince.length > 0) {
      addressText.push(cityProvince.join(', '));
    }
    
    if (addressText.length === 0) {
      addressText.push('Não informado');
    }
    
    // Renderizar endereço com quebra de linha se necessário
    addressText.forEach((line, i) => {
      doc.text(line, 315, clientBoxY + 30 + (i * 20), { width: 220, ellipsis: true });
    });
    
    doc.moveDown(3);
    
    // ==========================================
    // ITENS DO PEDIDO - TABELA PROFISSIONAL
    // ==========================================
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('ITENS DO PEDIDO', 50, doc.y);
    
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    const itemHeight = 25;
    
    // Cabeçalho da tabela
    doc.rect(50, tableTop, 495, itemHeight)
       .fillColor('#2563eb')
       .fill()
       .fillColor('#ffffff');
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('PRODUTO', 60, tableTop + 7, { width: 310 })
       .text('QTD', 375, tableTop + 7)
       .text('PREÇO UNIT.', 420, tableTop + 7, { width: 70 })
       .text('SUBTOTAL', 495, tableTop + 7, { align: 'right', width: 50 });
    
    // Linhas dos itens
    items.forEach((item, index) => {
      const y = tableTop + (index + 1) * itemHeight;
      
      // Alternância de cores
      if (index % 2 === 0) {
        doc.rect(50, y, 495, itemHeight)
           .fillColor('#f9fafb')
           .fill();
      }
      
      doc.fillColor('#1a1a1a')
         .font('Helvetica')
         .fontSize(9)
         .text(item.product_name || `Produto #${item.product_id}`, 60, y + 8, { width: 310, ellipsis: true })
         .text(item.quantity.toString(), 375, y + 8)
         .text(`${parseFloat(item.price || 0).toFixed(2)} MZN`, 420, y + 8, { width: 70 })
         .text(`${(parseFloat(item.price || 0) * item.quantity).toFixed(2)} MZN`, 495, y + 8, { align: 'right', width: 50 });
    });
    
    // Linha divisória final
    const finalLineY = tableTop + (items.length + 1) * itemHeight;
    doc.moveTo(50, finalLineY)
       .lineTo(545, finalLineY)
       .strokeColor('#e5e7eb')
       .lineWidth(2)
       .stroke();
    
    doc.moveDown(1.5);
    
    // ==========================================
    // TOTAL
    // ==========================================
    const totalBoxY = doc.y;
    doc.rect(350, totalBoxY, 195, 50)
       .fillColor('#10b981')
       .fill()
       .fillColor('#ffffff');
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('TOTAL PAGO', 360, totalBoxY + 10);
    
    doc.fontSize(20)
       .text(`${parseFloat(order.total || 0).toFixed(2)} MZN`, 360, totalBoxY + 28);
    
    doc.moveDown(3);
    
    // ==========================================
    // RODAPÉ COM PARCEIROS E MÉTODOS DE PAGAMENTO
    // ==========================================
    const footerY = 680;
    
    // Linha divisória
    doc.moveTo(50, footerY)
       .lineTo(545, footerY)
       .strokeColor('#e5e7eb')
       .lineWidth(1)
       .stroke();
    
    doc.moveDown(1);
    
    // Agradecimento
    doc.fillColor('#1a1a1a')
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Obrigado pela sua compra!', 50, doc.y, { align: 'center', width: 495 });
    
    doc.moveDown(0.5);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('Papel & Pixel - Transformando ideias em realidade', 50, doc.y, { align: 'center', width: 495 });
    
    doc.moveDown(1);
    
    // Métodos de Pagamento Aceitos
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#4b5563')
       .text('MÉTODOS DE PAGAMENTO ACEITOS:', 50, doc.y, { width: 495, align: 'center' });
    
    doc.moveDown(0.3);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('PayPal • Cartão de Crédito/Débito • M-Pesa • EMOLA • Mkesh • Dinheiro na Entrega', 
             50, doc.y, { width: 495, align: 'center' });
    
    doc.moveDown(1);
    
    // Parceiros/Marcas
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#4b5563')
       .text('NOSSOS PARCEIROS:', 50, doc.y, { width: 495, align: 'center' });
    
    doc.moveDown(0.3);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('Editoras Premium • Marcas Internacionais • Fornecedores Locais', 
             50, doc.y, { width: 495, align: 'center' });
    
    doc.moveDown(1);
    
    // Informações de contato
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text('📧 atendimento@papelepixel.co.mz  •  📱 +258 874383621', 
             50, doc.y, { width: 495, align: 'center' });
    
    doc.text('Moçambique - Cidade da Beira', 50, doc.y, { width: 495, align: 'center' });
    
    // Finalizar PDF
    doc.end();
    
  } catch (error) {
    console.error('❌ Erro ao gerar recibo:', error);
    res.status(500).json({ error: 'Erro ao gerar recibo', details: error.message });
  }
});

function getStatusLabel(status) {
  const labels = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    processing: 'Em Processamento',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  };
  return labels[status] || status;
}

function getPaymentMethodLabel(method) {
  const labels = {
    paypal: 'PayPal',
    card: 'Cartão de Crédito/Débito',
    mpesa: 'M-Pesa',
    emola: 'EMOLA',
    mkesh: 'Mkesh',
    cash: 'Dinheiro na Entrega'
  };
  return labels[method] || method || 'N/A';
}

module.exports = router;



