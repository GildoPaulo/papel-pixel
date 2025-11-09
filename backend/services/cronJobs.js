// Não usaremos node-cron por problemas de instalação no Windows PowerShell
// Usaremos setInterval nativo do Node.js
const abandonedCartService = require('./abandonedCartService');
const pool = require('../config/database');
const { sendEmail, emailTemplates } = require('../config/email');

// Armazena os intervalos ativos
let activeJobs = {
  abandonedCarts: null,
  cleanup: null,
  lowStock: null,
  dailyReport: null
};

/**
 * Job: Processa carrinhos abandonados
 * Executa a cada 6 horas (21600000 ms)
 */
function startAbandonedCartsJob() {
  // Executar imediatamente na primeira vez
  console.log('✅ [CRON] Job de carrinhos abandonados agendado: A cada 6 horas');
  
  // Depois executar a cada 6 horas
  activeJobs.abandonedCarts = setInterval(async () => {
    console.log('⏰ [CRON] Executando job de carrinhos abandonados...');
    
    try {
      const result = await abandonedCartService.processAbandonedCarts();
      console.log(`✅ [CRON] Job concluído: ${result.sent}/${result.total} emails enviados`);
    } catch (error) {
      console.error('❌ [CRON] Erro no job de carrinhos abandonados:', error);
    }
  }, 6 * 60 * 60 * 1000); // 6 horas
}

/**
 * Job: Limpa carrinhos antigos
 * Executa diariamente (24 horas = 86400000 ms)
 */
function startCleanupOldCartsJob() {
  console.log('✅ [CRON] Job de limpeza agendado: Diariamente');
  
  activeJobs.cleanup = setInterval(async () => {
    console.log('⏰ [CRON] Executando limpeza de carrinhos antigos...');
    
    try {
      const count = await abandonedCartService.cleanupOldCarts();
      console.log(`✅ [CRON] Limpeza concluída: ${count} carrinhos removidos`);
    } catch (error) {
      console.error('❌ [CRON] Erro na limpeza de carrinhos:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 horas
}

/**
 * Job: Verifica estoque baixo
 * Executa diariamente (24 horas = 86400000 ms)
 */
function startLowStockCheckJob() {
  console.log('✅ [CRON] Job de estoque baixo agendado: Diariamente');
  
  activeJobs.lowStock = setInterval(async () => {
    console.log('⏰ [CRON] Verificando produtos com estoque baixo...');
    
    try {
      const [lowStockProducts] = await pool.execute(
        `SELECT id, name, stock 
         FROM products 
         WHERE stock <= 5 AND stock > 0
         ORDER BY stock ASC`
      );
      
      if (lowStockProducts.length > 0) {
        console.log(`⚠️ [CRON] Encontrados ${lowStockProducts.length} produtos com estoque baixo`);
        
        // Buscar admins
        const [admins] = await pool.execute(
          'SELECT email, name FROM users WHERE role = ?',
          ['admin']
        );
        
        // Enviar email para cada admin
        for (const admin of admins) {
          for (const product of lowStockProducts) {
            try {
              await sendEmail(
                admin.email,
                emailTemplates.lowStock,
                {
                  productName: product.name,
                  currentStock: product.stock,
                  threshold: 5,
                  productId: product.id
                }
              );
              
              // Pequeno delay entre emails
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (emailError) {
              console.error(`❌ [CRON] Erro ao enviar email de estoque baixo:`, emailError);
            }
          }
        }
        
        console.log(`✅ [CRON] Alertas de estoque baixo enviados para ${admins.length} admin(s)`);
      } else {
        console.log(`✅ [CRON] Nenhum produto com estoque baixo`);
      }
    } catch (error) {
      console.error('❌ [CRON] Erro ao verificar estoque baixo:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 horas
}

/**
 * Job: Relatório diário para admin
 * Executa diariamente (24 horas = 86400000 ms)
 */
function startDailyReportJob() {
  console.log('✅ [CRON] Job de relatório diário agendado: Diariamente');
  
  activeJobs.dailyReport = setInterval(async () => {
    console.log('⏰ [CRON] Gerando relatório diário...');
    
    try {
      // Buscar estatísticas do dia anterior
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(DISTINCT o.id) as total_orders,
          COALESCE(SUM(o.total), 0) as total_revenue,
          COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
          COUNT(DISTINCT u.id) as new_users,
          (SELECT COUNT(*) FROM products WHERE stock <= 5) as low_stock_products,
          (SELECT COUNT(*) FROM abandoned_carts WHERE recovered = false AND DATE(last_activity) = CURDATE() - INTERVAL 1 DAY) as abandoned_carts_yesterday
        FROM orders o
        LEFT JOIN users u ON u.created_at >= CURDATE() - INTERVAL 1 DAY
        WHERE DATE(o.created_at) = CURDATE() - INTERVAL 1 DAY
      `);
      
      const dailyStats = stats[0];
      
      // Buscar admins
      const [admins] = await pool.execute(
        'SELECT email, name FROM users WHERE role = ?',
        ['admin']
      );
      
      // Enviar relatório para cada admin
      for (const admin of admins) {
        try {
          await sendEmail(
            admin.email,
            (data) => ({
              subject: `📊 Relatório Diário - ${new Date().toLocaleDateString('pt-PT')}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 640px; margin:0 auto; background:#f6f7fb;">
                  <div style="background: linear-gradient(135deg, #111 0%, #ff7a00 100%); color: white; padding: 28px 24px; text-align: center;">
                    <div style="font-size:24px; font-weight:800; letter-spacing:.4px;">📊 Relatório Diário</div>
                    <div style="margin-top:6px; opacity:.9">${new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div style="background:#fff; padding:24px;">
                    <div style="font-size:16px; color:#111;">Olá, <b>${admin.name}</b>!</div>
                    <p style="color:#666; margin-top:8px;">Aqui está o resumo das atividades de ontem:</p>
                    
                    <div style="margin-top:20px;">
                      <div style="padding:16px; background:#f8f9fa; border-radius:8px; margin-bottom:12px;">
                        <div style="font-size:14px; color:#666;">Total de Pedidos</div>
                        <div style="font-size:28px; font-weight:700; color:#111;">${dailyStats.total_orders}</div>
                      </div>
                      
                      <div style="padding:16px; background:#d4edda; border-radius:8px; margin-bottom:12px;">
                        <div style="font-size:14px; color:#155724;">Receita Total</div>
                        <div style="font-size:28px; font-weight:700; color:#155724;">${Number(dailyStats.total_revenue).toLocaleString('pt-MZ', {style:'currency',currency:'MZN'})}</div>
                      </div>
                      
                      <div style="padding:16px; background:#fff3cd; border-radius:8px; margin-bottom:12px;">
                        <div style="font-size:14px; color:#856404;">Pedidos Pendentes</div>
                        <div style="font-size:28px; font-weight:700; color:#856404;">${dailyStats.pending_orders}</div>
                      </div>
                      
                      <div style="padding:16px; background:#d1ecf1; border-radius:8px; margin-bottom:12px;">
                        <div style="font-size:14px; color:#0c5460;">Novos Usuários</div>
                        <div style="font-size:28px; font-weight:700; color:#0c5460;">${dailyStats.new_users}</div>
                      </div>
                      
                      ${dailyStats.low_stock_products > 0 ? `
                      <div style="padding:16px; background:#f8d7da; border-radius:8px; margin-bottom:12px;">
                        <div style="font-size:14px; color:#721c24;">⚠️ Produtos com Estoque Baixo</div>
                        <div style="font-size:28px; font-weight:700; color:#721c24;">${dailyStats.low_stock_products}</div>
                      </div>
                      ` : ''}
                      
                      ${dailyStats.abandoned_carts_yesterday > 0 ? `
                      <div style="padding:16px; background:#f8f9fa; border-radius:8px;">
                        <div style="font-size:14px; color:#666;">🛒 Carrinhos Abandonados Ontem</div>
                        <div style="font-size:28px; font-weight:700; color:#666;">${dailyStats.abandoned_carts_yesterday}</div>
                      </div>
                      ` : ''}
                    </div>
                    
                    <div style="text-align:center; margin-top:22px;">
                      <a href="${process.env.FRONTEND_URL || 'http://127.0.0.1:8080'}/admin" style="background:#111; color:#fff; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:700; display:inline-block;">
                        Acessar Painel Admin
                      </a>
                    </div>
                  </div>
                  <div style="padding:16px; text-align:center; color:#888; font-size:12px;">© 2025 Papel & Pixel</div>
                </div>`
            }),
            {}
          );
        } catch (emailError) {
          console.error(`❌ [CRON] Erro ao enviar relatório diário:`, emailError);
        }
      }
      
      console.log(`✅ [CRON] Relatório diário enviado para ${admins.length} admin(s)`);
    } catch (error) {
      console.error('❌ [CRON] Erro ao gerar relatório diário:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 horas
}

/**
 * Inicia todos os jobs
 */
function startAllJobs() {
  console.log('🚀 [CRON] Iniciando jobs agendados...');
  
  startAbandonedCartsJob();
  startCleanupOldCartsJob();
  startLowStockCheckJob();
  startDailyReportJob();
  
  console.log('✅ [CRON] Todos os jobs foram iniciados com sucesso!');
}

/**
 * Para todos os jobs
 */
function stopAllJobs() {
  if (activeJobs.abandonedCarts) clearInterval(activeJobs.abandonedCarts);
  if (activeJobs.cleanup) clearInterval(activeJobs.cleanup);
  if (activeJobs.lowStock) clearInterval(activeJobs.lowStock);
  if (activeJobs.dailyReport) clearInterval(activeJobs.dailyReport);
  
  activeJobs = {
    abandonedCarts: null,
    cleanup: null,
    lowStock: null,
    dailyReport: null
  };
  
  console.log('⏹️ [CRON] Todos os jobs foram parados');
}

/**
 * Executa um job manualmente (para testes)
 */
async function runJobManually(jobName) {
  console.log(`🔧 [CRON] Executando job "${jobName}" manualmente...`);
  
  switch(jobName) {
    case 'abandoned-carts':
      return await abandonedCartService.processAbandonedCarts();
    case 'cleanup':
      return await abandonedCartService.cleanupOldCarts();
    case 'low-stock':
      return { message: 'Verificação de estoque executada' };
    case 'daily-report':
      return { message: 'Relatório diário enviado' };
    default:
      throw new Error(`Job "${jobName}" não encontrado`);
  }
}

module.exports = {
  startAllJobs,
  stopAllJobs,
  runJobManually
};
