const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuração do transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email de boas-vindas
const sendWelcomeEmail = async (to, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Papel & Pixel" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Bem-vindo à Papel & Pixel!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Papel & Pixel</h1>
            <p style="color: white; margin-top: 10px;">Sua loja de produtos educacionais</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Olá, ${name}!</h2>
            <p>Bem-vindo à <strong>Papel & Pixel</strong>!</p>
            <p>Estamos felizes em ter você como parte da nossa comunidade. Oferecemos produtos educacionais de alta qualidade, incluindo e-books, papelaria premium e revistas online.</p>
            
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Explorar Loja
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Se você tiver alguma dúvida, não hesite em nos contatar:<br>
              📧 suporte.papelepixel@outlook.com<br>
              📱 +258 874383621
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2025 Papel & Pixel. Todos os direitos reservados.</p>
            <p>Cidade da Beira, Moçambique</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email de boas-vindas enviado para:', to);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

// Email de confirmação de pedido
const sendOrderConfirmation = async (to, name, order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Papel & Pixel" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Pedido Confirmado - #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Pedido Confirmado!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Olá, <strong>${name}</strong>!</p>
            <p>Seu pedido foi confirmado e está sendo processado.</p>
            
            <div style="background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p><strong>Número do Pedido:</strong> #${order.id}</p>
              <p><strong>Total:</strong> ${order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleDateString('pt-PT')}</p>
            </div>
            
            <p>Você receberá atualizações sobre o status do seu pedido por email.</p>
            
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Pedido
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p>© 2025 Papel & Pixel</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email de confirmação de pedido enviado para:', to);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

// Email de notificação de newsletter
const sendNewsletter = async (to, subject, content) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Papel & Pixel" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject || 'Novidades da Papel & Pixel',
      html: content
    };

    await transporter.sendMail(mailOptions);
    console.log('Newsletter enviada para:', to);
    return true;
  } catch (error) {
    console.error('Erro ao enviar newsletter:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendNewsletter
};

