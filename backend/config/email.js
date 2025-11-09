const nodemailer = require('nodemailer');

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

// Verificar configuração ao iniciar
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email não configurado ou credenciais inválidas');
    console.log('   Erro:', error.message);
    console.log('   💡 Configure EMAIL_USER e EMAIL_PASS no arquivo .env');
    console.log('   💡 Para Gmail, use "Senha de App" (não a senha normal)');
  } else {
    console.log('✅ Email configurado com sucesso!');
    console.log('   Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
    console.log('   User:', process.env.EMAIL_USER || '(não configurado)');
  }
});

// Templates de email
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Bem-vindo à Papel & Pixel! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">Papel & Pixel</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2>Olá, ${name}!</h2>
          <p>Bem-vindo à nossa loja! Estamos muito felizes em tê-lo conosco.</p>
          <p>Explore nossa vasta seleção de materiais escolares, livros educativos e muito mais!</p>
          <a href="${(process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080')}" 
             style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Explorar Produtos
          </a>
        </div>
        <div style="padding: 20px; background: #e5e7eb; text-align: center; color: #666;">
          <p style="margin: 0;">© 2025 Papel & Pixel. Todos os direitos reservados.</p>
        </div>
      </div>
    `
  }),
  
  orderConfirmation: (order) => ({
    subject: `Pedido #${order.id} Confirmado! ✅`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0;">Pedido Confirmado!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Seu pedido foi confirmado com sucesso!</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Número do Pedido:</strong> #${order.id}</p>
            <p><strong>Total:</strong> ${order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <p>Nós entraremos em contato em breve para confirmar a entrega.</p>
        </div>
      </div>
    `
  }),
  
  passwordReset: (data) => {
    // Suporta tanto objeto quanto parâmetros diretos
    const name = typeof data === 'object' ? (data?.name || 'Cliente') : (data || 'Cliente');
    let resetLink = typeof data === 'object' ? (data?.resetLink || data?.link) : null;
    
    // Garantir que resetLink não seja undefined
    if (!resetLink || resetLink.includes('undefined')) {
      const frontendUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
      resetLink = `${frontendUrl}/reset-password`;
      if (typeof data === 'object' && data?.token && data?.email) {
        resetLink += `?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(data.email)}`;
      }
    }
    
    // Remover qualquer "undefined" da URL
    resetLink = resetLink.replace(/undefined/g, 'http://127.0.0.1:8080');
    
    return {
      subject: 'Recuperação de Senha - Papel & Pixel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Recuperar Senha</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <p>Olá, ${name}!</p>
            <p>Você solicitou a recuperação de senha. Clique no botão abaixo para redefinir sua senha:</p>
            <a href="${resetLink}" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Redefinir Senha
            </a>
            <p><small>Este link expira em 1 hora. Se você não solicitou isso, ignore este email.</small></p>
          </div>
        </div>
      `
    };
  },
  
  promotion: (data) => {
    // Extrai dados do objeto - garantir que não seja NULL, vazio ou "Subscriber"
    let name = data?.name || data?.firstName || 'Cliente';
    if (!name || name.trim() === '' || name.toLowerCase() === 'subscriber') {
      name = 'Cliente';
    }
    name = name.trim();
    const title = data?.title || 'Promoção Especial';
    const content = data?.content || data?.message || '';
    const bannerUrl = data?.bannerUrl || null;
    const couponCode = data?.couponCode || null;
    const couponText = data?.couponText || null;
    const ctaLabel = data?.ctaLabel || 'Ver Ofertas Agora 🛒';
    
    // Garantir que destinationUrl não seja undefined - padrão é página de promoções
    const baseUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
    let destinationUrl = data?.destinationUrl || `${baseUrl}/promotions`;
    if (!destinationUrl || destinationUrl === 'undefined' || destinationUrl.includes('undefined')) {
      destinationUrl = `${baseUrl}/promotions`;
    }
    destinationUrl = destinationUrl.replace(/undefined/g, 'http://127.0.0.1:8080');
    
    // URL para unsubscribe também corrigida
    const unsubscribeUrl = baseUrl;
    
    console.log(`📧 [EMAIL TEMPLATE] Renderizando email de promoção:`);
    console.log(`   - Nome: ${name}`);
    console.log(`   - Título: ${title}`);
    console.log(`   - Conteúdo: ${content.substring(0, 50)}...`);
    console.log(`   - URL destino: ${destinationUrl}`);
    
    return {
      subject: `🎉 ${title} - Papel & Pixel`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:#f6f7fb;">
          ${bannerUrl ? `<img src="${bannerUrl}" alt="Promoção" style="width:100%; display:block;">` : `
          <div style="background: linear-gradient(135deg, #111 0%, #ff7a00 100%); color: white; padding: 28px 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px;">${title}</h1>
            <p style="margin: 8px 0 0; opacity: 0.9;">Promoções imperdíveis!</p>
          </div>`}
          <div style="padding: 28px; background: #fff;">
            <p style="font-size: 16px; color:#111;">Olá, ${name}!</p>
            <div style="background: #fff; padding: 18px; border-radius: 8px; margin: 16px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.06); color:#333; line-height:1.6;">
              ${String(content || '').replace(/\n/g, '<br>')}
            </div>
            ${couponCode || couponText ? `
            <div style="margin:16px 0; background:#FFF7E6; border:1px dashed #FFB84D; padding:12px 14px; border-radius:8px; color:#8a5200;">
              ${couponText ? couponText : 'Use o cupom'} ${couponCode ? `<b>${couponCode}</b>` : ''}
            </div>` : ''}
            <div style="text-align:center; margin-top:18px;">
              <a href="${destinationUrl}" 
                 style="display:inline-block; background:#111; color:#fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 800; letter-spacing:.2px;">
                ${ctaLabel}
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 26px; text-align:center;">
              Você está recebendo este email porque se inscreveu na nossa newsletter.<br>
              <a href="${unsubscribeUrl}/unsubscribe?email=${encodeURIComponent(data?.email || '')}" style="color: #667eea;">Cancelar inscrição</a>
            </p>
          </div>
          <div style="padding: 16px; background: #e5e7eb; text-align: center; color: #666; font-size:12px;">
            <div>© 2025 Papel & Pixel. Todos os direitos reservados.</div>
            <div style="margin-top:4px;">Maputo, Moçambique</div>
          </div>
        </div>
      `
    };
  }
  ,
  // Template moderno para Carrinho Abandonado
  abandonedCart: (data) => {
    let name = data?.name || 'Cliente';
    if (!name || name.trim() === '' || name.toLowerCase() === 'subscriber') {
      name = 'Cliente';
    }
    name = name.trim();
    const items = Array.isArray(data?.items) ? data.items : [];
    const subtotal = data?.subtotal || 0;
    const coupon = data?.coupon || null;
    const bannerUrl = data?.bannerUrl || null;
    let checkoutUrl = data?.checkoutUrl || (process.env.FRONTEND_URL || 'http://127.0.0.1:8080');
    checkoutUrl = checkoutUrl.replace(/undefined/g, 'http://127.0.0.1:8080');

    const itemsHtml = items.map((it) => {
      const price = (it.price * (it.quantity || 1));
      const image = it.image || it.imageUrl || '';
      return `
        <tr>
          <td style="padding:12px 0; border-bottom:1px solid #eee; vertical-align:top;">
            ${image ? `<img src="${image}" alt="${it.name}" width="72" style="border-radius:6px; display:block;">` : ''}
          </td>
          <td style="padding:12px 10px; border-bottom:1px solid #eee;">
            <div style="font-weight:600; color:#111;">${it.name}</div>
            <div style="color:#555; font-size:12px;">Qtd: ${it.quantity || 1}</div>
          </td>
          <td style="padding:12px 0; border-bottom:1px solid #eee; text-align:right; font-weight:600; color:#111;">
            ${price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
          </td>
        </tr>`;
    }).join('');

    const headerGradient = 'linear-gradient(135deg,#FF7A00 0%,#FF4D4D 100%)';

    return {
      subject: '🛒 Esqueceu algo? Complete sua compra com oferta especial',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
          <div style="${bannerUrl ? '' : `background:${headerGradient};`} color:#fff; text-align:center;">
            ${bannerUrl ? `<img src="${bannerUrl}" alt="Oferta" style="width:100%; display:block;">` : `
              <div style="padding:28px 24px;">
                <div style="font-size:22px; font-weight:800; letter-spacing:.4px;">Papel & Pixel</div>
                <div style="margin-top:6px; opacity:.9">Ofertas exclusivas para finalizar sua compra</div>
              </div>`}
          </div>
          <div style="background:#fff; padding:24px;">
            <div style="font-size:16px; color:#111;">Olá, <b>${name}</b>! Você deixou estes itens no carrinho:</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding:14px 0; text-align:right; color:#666;">Subtotal</td>
                <td style="padding:14px 0; text-align:right; font-weight:700; color:#111;">
                  ${Number(subtotal).toLocaleString('pt-MZ', { style:'currency', currency:'MZN' })}
                </td>
              </tr>
            </table>
            ${coupon ? `
            <div style="margin-top:16px; background:#FFF7E6; border:1px dashed #FFB84D; padding:12px 14px; border-radius:8px; color:#8a5200;">
              Use o cupom <b>${coupon}</b> no checkout e garanta seu desconto! 🎁
            </div>` : ''}
            <div style="text-align:center; margin-top:22px;">
              <a href="${checkoutUrl}/cart" style="background:#FF7A00; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                Finalizar Compra Agora
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 26px; text-align:center;">
              Você está recebendo este email porque se inscreveu na nossa newsletter.<br>
              <a href="${checkoutUrl}/unsubscribe?email=${encodeURIComponent(data?.email || '')}" style="color: #667eea;">Cancelar inscrição</a>
            </p>
          </div>
          <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
        </div>`
    };
  },

  // Template moderno para anúncio de produto novo
  productAnnouncement: (data) => {
    const product = data?.product || {};
    let subscriberName = data?.name || 'Cliente';
    if (!subscriberName || subscriberName.trim() === '' || subscriberName.toLowerCase() === 'subscriber') {
      subscriberName = 'Cliente';
    }
    subscriberName = subscriberName.trim();
    const bannerUrl = data?.bannerUrl || null;
    const baseUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
    let productUrl = data?.productUrl || `${baseUrl}/products/${product.id || ''}`;
    productUrl = productUrl.replace(/undefined/g, 'http://127.0.0.1:8080');
    const headerGradient = 'linear-gradient(135deg,#111 0%,#ff7a00 100%)';

    const priceHtml = product?.price != null ? `${Number(product.price).toLocaleString('pt-MZ', {style:'currency',currency:'MZN'})}` : '';

    return {
      subject: `🆕 Novidade: ${product.name || 'Novo produto'} na Papel & Pixel`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
          <div style="${bannerUrl ? '' : `background:${headerGradient};`} color:#fff; text-align:center;">
            ${bannerUrl ? `<img src="${bannerUrl}" alt="Novidades" style="width:100%; display:block;">` : `
              <div style="padding:28px 24px;">
                <div style="font-size:22px; font-weight:800; letter-spacing:.4px;">Novidades chegaram!</div>
                <div style="margin-top:6px; opacity:.9">Confira o lançamento da semana</div>
              </div>`}
          </div>
          <div style="background:#fff; padding:24px;">
            <div style="font-size:16px; color:#111;">Olá, <b>${subscriberName}</b>! Dê uma olhada neste lançamento:</div>
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width:100%; max-height:360px; object-fit:cover; border-radius:10px; margin:16px 0;">` : ''}
            <div style="font-size:20px; font-weight:800; color:#111;">${product.name || 'Produto'}</div>
            ${product.description ? `<div style="color:#666; margin-top:8px;">${product.description}</div>` : ''}
            ${priceHtml ? `<div style="margin-top:14px; font-size:22px; color:#FF7A00; font-weight:800;">${priceHtml}</div>` : ''}
            <div style="text-align:center; margin-top:22px;">
              <a href="${productUrl}" style="background:#111; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                Ver Produto
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 26px; text-align:center;">
              Você está recebendo este email porque se inscreveu na nossa newsletter.<br>
              <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(data?.email || '')}" style="color: #667eea;">Cancelar inscrição</a>
            </p>
          </div>
          <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
        </div>`
    };
  },

  // Template para notificação de devolução respondida
  returnStatusUpdate: (data) => {
    const { name, returnId, orderId, status, refundAmount, notes, frontendUrl } = data;
    const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://127.0.0.1:8080';
    
    const statusLabels = {
      approved: 'Aprovada ✅',
      rejected: 'Rejeitada ❌',
      processed: 'Processada 🎉',
      pending: 'Pendente ⏳'
    };
    
    const statusColors = {
      approved: '#10B981',
      rejected: '#EF4444',
      processed: '#3B82F6',
      pending: '#F59E0B'
    };
    
    const statusLabel = statusLabels[status] || status;
    const statusColor = statusColors[status] || '#666';
    
    return {
      subject: `Atualização na sua solicitação de devolução #${returnId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f6f7fb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">Atualização de Devolução</h1>
          </div>
          <div style="background: white; padding: 30px;">
            <p style="font-size: 16px; color: #111;">Olá, <strong>${name}</strong>!</p>
            <p style="color: #666;">Sua solicitação de devolução foi atualizada:</p>
            
            <div style="background: #f9fafb; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <p style="margin: 0 0 10px 0;"><strong>Solicitação:</strong> #${returnId}</p>
              <p style="margin: 0 0 10px 0;"><strong>Pedido:</strong> #${orderId}</p>
              <p style="margin: 0; font-size: 18px; color: ${statusColor};"><strong>Status:</strong> ${statusLabel}</p>
            </div>
            
            ${refundAmount ? `
              <div style="background: #ECFDF5; border: 1px solid #10B981; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #065F46;">
                  <strong>💰 Valor do Reembolso:</strong> ${Number(refundAmount).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                </p>
              </div>
            ` : ''}
            
            ${status === 'approved' ? `
              <div style="background: #DBEAFE; border: 1px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 12px 0; font-weight: bold; color: #1E40AF; font-size: 18px;">📦 Instruções de Envio:</p>
                <ol style="margin: 0; padding-left: 20px; color: #1E3A8A; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">Embrulhe o produto com cuidado na embalagem original (se possível).</li>
                  <li style="margin-bottom: 8px;">Coloque o produto dentro de uma caixa resistente.</li>
                  <li style="margin-bottom: 8px;">Imprima ou escreva o número da devolução <strong>#${returnId}</strong> na embalagem.</li>
                  <li style="margin-bottom: 8px;">Envie para o endereço: <strong>Papel & Pixel, Maputo, Moçambique</strong></li>
                  <li style="margin-bottom: 8px;">Mantenha o comprovante de envio até receber confirmação do recebimento.</li>
                  <li>Após recebermos o produto, processaremos o reembolso em até 5 dias úteis.</li>
                </ol>
                <p style="margin-top: 12px; color: #1E40AF; font-size: 14px;">
                  <strong>⚠️ Importante:</strong> O produto deve estar em condições originais e na embalagem original quando possível.
                </p>
              </div>
            ` : ''}
            
            ${notes ? `
              <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: #92400E;">📝 Observações:</p>
                <p style="margin: 0; color: #78350F;">${notes}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${baseUrl}/returns" 
                 style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700;">
                Ver Detalhes da Devolução
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Se tiver dúvidas, entre em contato conosco através do nosso suporte.
            </p>
          </div>
          <div style="padding: 20px; background: #e5e7eb; text-align: center; color: #666;">
            <p style="margin: 0;">© 2025 Papel & Pixel. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    };
  },

  // Template para notificação de estoque baixo (Admin)
  lowStock: (data) => {
    const { productName, currentStock, threshold, productId } = data;
    const baseUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
    const adminUrl = `${baseUrl}/admin`;
    
    return {
      subject: `⚠️ Estoque Baixo: ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 28px 24px; text-align: center;">
            <div style="font-size:24px; font-weight:800; letter-spacing:.4px;">⚠️ Alerta de Estoque Baixo</div>
            <div style="margin-top:6px; opacity:.9">Ação necessária!</div>
          </div>
          <div style="background:#fff; padding:24px;">
            <div style="font-size:16px; color:#111;">Olá, <b>Administrador</b>!</div>
            <div style="margin-top:16px; padding:16px; background:#fff3cd; border-left:4px solid #ffc107; border-radius:4px;">
              <p style="margin:0; color:#856404; font-weight:600;">
                O produto <strong>${productName}</strong> está com estoque baixo!
              </p>
              <p style="margin:8px 0 0; color:#856404;">
                <strong>Estoque atual:</strong> ${currentStock} unidades<br>
                <strong>Limite configurado:</strong> ${threshold} unidades
              </p>
            </div>
            <div style="text-align:center; margin-top:22px;">
              <a href="${adminUrl}" style="background:#111; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                Gerenciar Estoque
              </a>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 26px;">
              Produto ID: ${productId}<br>
              Recomendamos repor o estoque o quanto antes para evitar problemas com vendas.
            </p>
          </div>
          <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
        </div>`
    };
  },

  // Template para notificação de novo pedido (Admin)
  newOrder: (data) => {
    const { orderId, customerName, customerEmail, total, items, orderDate } = data;
    const baseUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
    const adminUrl = `${baseUrl}/admin`;
    
    const itemsHtml = items.map((item, idx) => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">${idx + 1}</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">
          ${Number(item.subtotal).toLocaleString('pt-MZ', {style:'currency',currency:'MZN'})}
        </td>
      </tr>
    `).join('');
    
    return {
      subject: `🛒 Novo Pedido Recebido: #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
          <div style="background: linear-gradient(135deg, #111 0%, #ff7a00 100%); color: white; padding: 28px 24px; text-align: center;">
            <div style="font-size:24px; font-weight:800; letter-spacing:.4px;">🛒 Novo Pedido!</div>
            <div style="margin-top:6px; opacity:.9">Pedido #${orderId}</div>
          </div>
          <div style="background:#fff; padding:24px;">
            <div style="font-size:16px; color:#111;">Olá, <b>Administrador</b>!</div>
            <p style="color:#666; margin-top:8px;">Você recebeu um novo pedido que precisa ser aprovado.</p>
            
            <div style="margin-top:20px; padding:16px; background:#f8f9fa; border-radius:8px;">
              <p style="margin:0 0 8px; font-weight:600; color:#111;">📋 Detalhes do Pedido:</p>
              <p style="margin:4px 0; color:#666;"><strong>Cliente:</strong> ${customerName}</p>
              <p style="margin:4px 0; color:#666;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin:4px 0; color:#666;"><strong>Data:</strong> ${orderDate}</p>
              <p style="margin:8px 0 0; font-size:18px; color:#111; font-weight:700;">
                <strong>Total:</strong> ${Number(total).toLocaleString('pt-MZ', {style:'currency',currency:'MZN'})}
              </p>
            </div>
            
            <div style="margin-top:20px;">
              <p style="font-weight:600; color:#111; margin-bottom:8px;">Itens do Pedido:</p>
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <thead>
                  <tr style="background:#f8f9fa;">
                    <th style="padding:8px; text-align:left; border-bottom:2px solid #dee2e6;">#</th>
                    <th style="padding:8px; text-align:left; border-bottom:2px solid #dee2e6;">Produto</th>
                    <th style="padding:8px; text-align:center; border-bottom:2px solid #dee2e6;">Qtd</th>
                    <th style="padding:8px; text-align:right; border-bottom:2px solid #dee2e6;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            
            <div style="text-align:center; margin-top:22px;">
              <a href="${adminUrl}" style="background:#111; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                Acessar Painel Admin
              </a>
            </div>
          </div>
          <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
        </div>`
    };
  },

  // Template para pedido aprovado (Cliente)
  orderApproved: (data) => {
    const { orderId, customerName, total, items, estimatedDelivery } = data;
    const baseUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
    const trackingUrl = `${baseUrl}/tracking/${orderId}`;
    
    const itemsHtml = items.slice(0, 5).map((item) => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}x</td>
      </tr>
    `).join('');
    
    const moreItemsText = items.length > 5 ? `<tr><td colspan="2" style="padding:8px; color:#666; font-size:12px;">... e mais ${items.length - 5} item(ns)</td></tr>` : '';
    
    return {
      subject: `✅ Pedido #${orderId} Aprovado!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 28px 24px; text-align: center;">
            <div style="font-size:24px; font-weight:800; letter-spacing:.4px;">✅ Pedido Aprovado!</div>
            <div style="margin-top:6px; opacity:.9">Pedido #${orderId}</div>
          </div>
          <div style="background:#fff; padding:24px;">
            <div style="font-size:16px; color:#111;">Olá, <b>${customerName}</b>!</div>
            <p style="color:#666; margin-top:8px;">
              Seu pedido <strong>#${orderId}</strong> foi aprovado e está em processamento!
            </p>
            
            <div style="margin-top:20px; padding:16px; background:#d4edda; border-left:4px solid #28a745; border-radius:4px;">
              <p style="margin:0; color:#155724; font-weight:600;">
                🎉 Pagamento confirmado! Seu pedido será preparado e enviado em breve.
              </p>
              <p style="margin:8px 0 0; color:#155724;">
                <strong>Total pago:</strong> ${Number(total).toLocaleString('pt-MZ', {style:'currency',currency:'MZN'})}
              </p>
              ${estimatedDelivery ? `<p style="margin:8px 0 0; color:#155724;"><strong>Previsão de entrega:</strong> ${estimatedDelivery}</p>` : ''}
            </div>
            
            <div style="margin-top:20px;">
              <p style="font-weight:600; color:#111; margin-bottom:8px;">Itens do seu pedido:</p>
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <tbody>
                  ${itemsHtml}
                  ${moreItemsText}
                </tbody>
              </table>
            </div>
            
            <div style="text-align:center; margin-top:22px;">
              <a href="${trackingUrl}" style="background:#111; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                Acompanhar Pedido
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 26px; text-align:center;">
              Você receberá uma notificação quando seu pedido for enviado.
            </p>
          </div>
          <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
        </div>`
    };
  },

  // Template para nova solicitação de devolução (Admin)
  newReturnRequest: (data) => {
    const { returnId, orderId, customerName, customerEmail, reason, reasonType, total, items, orderDate } = data;
    const baseUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
    const adminUrl = `${baseUrl}/admin`;
    
    const itemsHtml = items?.map((item, idx) => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">${idx + 1}</td>
        <td style="padding:8px; border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
      </tr>
    `).join('') || '';
    
    return {
      subject: `📦 Nova Solicitação de Devolução: #${returnId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 28px 24px; text-align: center;">
            <div style="font-size:24px; font-weight:800; letter-spacing:.4px;">📦 Nova Devolução</div>
            <div style="margin-top:6px; opacity:.9">Devolução #${returnId}</div>
          </div>
          <div style="background:#fff; padding:24px;">
            <div style="font-size:16px; color:#111;">Olá, <b>Administrador</b>!</div>
            <p style="color:#666; margin-top:8px;">Você recebeu uma nova solicitação de devolução que precisa ser analisada.</p>
            
            <div style="margin-top:20px; padding:16px; background:#fff3cd; border-left:4px solid #ffc107; border-radius:4px;">
              <p style="margin:0 0 8px; font-weight:600; color:#111;">📋 Detalhes:</p>
              <p style="margin:4px 0; color:#666;"><strong>Cliente:</strong> ${customerName}</p>
              <p style="margin:4px 0; color:#666;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin:4px 0; color:#666;"><strong>Pedido:</strong> #${orderId}</p>
              <p style="margin:4px 0; color:#666;"><strong>Tipo de Motivo:</strong> ${reasonType || 'Não especificado'}</p>
              <p style="margin:8px 0 0; font-size:18px; color:#111; font-weight:700;">
                <strong>Total do Pedido:</strong> ${Number(total).toLocaleString('pt-MZ', {style:'currency',currency:'MZN'})}
              </p>
            </div>
            
            <div style="margin-top:20px; padding:16px; background:#f8f9fa; border-radius:8px;">
              <p style="font-weight:600; color:#111; margin-bottom:8px;">Motivo da Devolução:</p>
              <p style="color:#666; margin:0;">${reason}</p>
            </div>
            
            ${itemsHtml ? `
            <div style="margin-top:20px;">
              <p style="font-weight:600; color:#111; margin-bottom:8px;">Itens do Pedido:</p>
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <thead>
                  <tr style="background:#f8f9fa;">
                    <th style="padding:8px; text-align:left; border-bottom:2px solid #dee2e6;">#</th>
                    <th style="padding:8px; text-align:left; border-bottom:2px solid #dee2e6;">Produto</th>
                    <th style="padding:8px; text-align:center; border-bottom:2px solid #dee2e6;">Qtd</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            <div style="text-align:center; margin-top:22px;">
              <a href="${adminUrl}" style="background:#111; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                Analisar Devolução
              </a>
            </div>
          </div>
          <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
        </div>`
    };
  },

  // Template para confirmação de recebimento da solicitação (Cliente)
  returnRequestReceived: (data) => {
    const { name, returnId, orderId, status, message } = data;
    const baseUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
    const returnsUrl = `${baseUrl}/returns`;
    
    return {
      subject: `📦 Solicitação de Devolução #${returnId} Recebida`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 28px 24px; text-align: center;">
            <div style="font-size:24px; font-weight:800; letter-spacing:.4px;">📦 Solicitação Recebida</div>
            <div style="margin-top:6px; opacity:.9">Devolução #${returnId}</div>
          </div>
          <div style="background:#fff; padding:24px;">
            <div style="font-size:16px; color:#111;">Olá, <b>${name}</b>!</div>
            <p style="color:#666; margin-top:8px;">
              Recebemos sua solicitação de devolução para o pedido <strong>#${orderId}</strong>.
            </p>
            
            <div style="margin-top:20px; padding:16px; background:#d4edda; border-left:4px solid #28a745; border-radius:4px;">
              <p style="margin:0; color:#155724; font-weight:600;">
                ✅ ${message || 'Sua solicitação está sendo analisada'}
              </p>
              <p style="margin:8px 0 0; color:#155724; font-size:14px;">
                Você receberá uma atualização por email em até 48 horas úteis.
              </p>
            </div>
            
            <div style="text-align:center; margin-top:22px;">
              <a href="${returnsUrl}" style="background:#111; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                Acompanhar Devolução
              </a>
            </div>
          </div>
          <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
        </div>`
    };
  },

  // Template para pedido enviado com código de rastreamento
  orderShipped: (data) => {
    const { name, orderId, trackingCode, items, total, estimatedDelivery } = data;
    const baseUrl = (process.env.FRONTEND_URL || 'http://127.0.0.1:8080').replace(/undefined/g, 'http://127.0.0.1:8080');
    const trackingUrl = `${baseUrl}/tracking/${orderId}`;
    
    const itemsHtml = items?.slice(0, 5).map((item) => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #eee;">${item.product_name || item.name}</td>
        <td style="padding:8px; border-bottom:1px solid #eee; text-align:center;">${item.quantity}x</td>
      </tr>
    `).join('') || '';
    
    return {
      subject: `🚚 Seu pedido #${orderId} foi enviado!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 28px 24px; text-align: center;">
            <div style="font-size:24px; font-weight:800; letter-spacing:.4px;">🚚 Pedido Enviado!</div>
            <div style="margin-top:6px; opacity:.9">Pedido #${orderId}</div>
          </div>
          <div style="background:#fff; padding:24px;">
            <div style="font-size:16px; color:#111;">Olá, <b>${name}</b>!</div>
            <p style="color:#666; margin-top:8px;">
              Ótimas notícias! Seu pedido <strong>#${orderId}</strong> foi enviado e está a caminho!
            </p>
            
            <div style="margin-top:20px; padding:20px; background:#DBEAFE; border-left:4px solid #3B82F6; border-radius:4px;">
              <p style="margin:0 0 12px; font-weight:bold; color:#1E40AF; font-size:18px;">📦 Código de Rastreamento:</p>
              <div style="background:white; padding:16px; border-radius:8px; text-align:center; border:2px dashed #3B82F6;">
                <p style="margin:0; font-size:24px; font-weight:800; color:#111; letter-spacing:2px;">${trackingCode}</p>
              </div>
            </div>
            
            ${itemsHtml ? `
            <div style="margin-top:20px;">
              <p style="font-weight:600; color:#111; margin-bottom:8px;">📋 Itens enviados:</p>
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
            ` : ''}
            
            ${estimatedDelivery ? `
            <div style="margin-top:20px; padding:16px; background:#FEF3C7; border-left:4px solid #F59E0B; border-radius:4px;">
              <p style="margin:0; color:#92400E; font-weight:600;">
                ⏱️ Previsão de Entrega: ${estimatedDelivery}
              </p>
            </div>
            ` : ''}
            
            <div style="text-align:center; margin-top:22px;">
              <a href="${trackingUrl}" style="background:#111; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                Rastrear Pedido Agora
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 26px; text-align:center;">
              Use o código acima para rastrear seu pedido na transportadora.
            </p>
          </div>
          <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
        </div>`
    };
  }
};

// Função para enviar email
async function sendEmail(to, template, data) {
  try {
    console.log(`📧 [EMAIL SERVICE] Preparando envio para: ${to}`);
    console.log(`📧 [EMAIL SERVICE] Dados recebidos:`, JSON.stringify(data, null, 2));
    
    const emailData = template(data);
    
    if (!emailData || !emailData.subject || !emailData.html) {
      throw new Error('Template não retornou dados válidos');
    }
    
    console.log(`📧 [EMAIL SERVICE] Subject: ${emailData.subject}`);
    
    const info = await transporter.sendMail({
      from: `"Papel & Pixel" <${process.env.EMAIL_USER || 'noreply@papelepixel.co.mz'}>`,
      to: to,
      subject: emailData.subject,
      html: emailData.html
    });
    
    console.log(`✅ [EMAIL SERVICE] Email enviado com sucesso para ${to}, MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [EMAIL SERVICE] Erro ao enviar email para ${to}:`, error.message);
    console.error(`❌ [EMAIL SERVICE] Stack:`, error.stack);
    return { success: false, error: error.message };
  }
}

module.exports = {
  transporter,
  emailTemplates,
  sendEmail
};



