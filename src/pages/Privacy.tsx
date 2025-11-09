import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 max-w-4xl">
        <h1 className="text-4xl font-heading font-bold mb-8 bg-gradient-hero bg-clip-text text-transparent">
          Política de Privacidade
        </h1>

        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          {/* 1. Dados Coletados */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">1. Dados Coletados</h2>
            <p className="mb-3">
              Coletamos as seguintes informações pessoais quando você utiliza nossa plataforma:
            </p>
            <p><strong>Informações Pessoais Básicas:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Número de telefone</li>
              <li>Endereço de entrega completo (rua, número, cidade, província, código postal)</li>
            </ul>
            <p><strong>Dados de Pagamento:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Informações de pagamento são processadas exclusivamente através de nossos parceiros seguros 
              (gateways de pagamento)</li>
              <li>Não armazenamos dados completos de cartão de crédito em nossos servidores</li>
              <li>Apenas informações necessárias para processamento são compartilhadas com processadores de pagamento</li>
            </ul>
            <p><strong>Dados de Navegação:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Endereço IP</li>
              <li>Informações do dispositivo e navegador</li>
              <li>Histórico de navegação e páginas visitadas</li>
              <li>Cookies e tecnologias similares</li>
            </ul>
          </section>

          {/* 2. Uso dos Dados */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">2. Uso dos Dados</h2>
            <p className="mb-3">
              Utilizamos suas informações pessoais para os seguintes propósitos:
            </p>
            <p><strong>Processamento de Pedidos:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Processar e concluir suas compras</li>
              <li>Confirmar e enviar pedidos</li>
              <li>Comunicar sobre status de pedidos e entregas</li>
              <li>Processar pagamentos e reembolsos</li>
            </ul>
            <p><strong>Envio de E-mails de Marketing:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Enviar newsletters e ofertas promocionais (apenas com seu consentimento)</li>
              <li>Você pode descadastrar-se a qualquer momento através do link presente em cada e-mail</li>
              <li>Página de descadastro disponível em: /unsubscribe</li>
            </ul>
            <p><strong>Suporte ao Cliente:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Responder a perguntas e solicitações</li>
              <li>Resolver problemas e reclamações</li>
              <li>Fornecer assistência técnica</li>
            </ul>
            <p><strong>Melhoria dos Serviços:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Analisar padrões de uso do site</li>
              <li>Melhorar a experiência do usuário</li>
              <li>Desenvolver novos produtos e serviços</li>
              <li>Prevenir fraudes e garantir segurança</li>
            </ul>
          </section>

          {/* 3. Compartilhamento */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">3. Compartilhamento</h2>
            <p className="mb-3">
              <strong>Não vendemos seus dados para terceiros.</strong> Compartilhamos informações apenas nas 
              seguintes situações:
            </p>
            <p><strong>Com Transportadoras:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Compartilhamos nome, endereço de entrega e telefone com transportadoras para processamento 
              e entrega de pedidos físicos</li>
              <li>Essas informações são essenciais para a entrega dos produtos</li>
            </ul>
            <p><strong>Com Gateways de Pagamento:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Compartilhamos dados de pagamento necessários com processadores seguros (PayPal, M-Pesa, 
              EMOLA, Mkesh, RIHA, etc.)</li>
              <li>Esses parceiros possuem políticas de privacidade próprias e proteções de segurança</li>
            </ul>
            <p><strong>Quando Exigido por Lei:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Podemos divulgar informações se exigido por lei ou ordem judicial</li>
              <li>Para proteger nossos direitos, propriedade ou segurança</li>
              <li>Para proteger os direitos de outros usuários ou do público em geral</li>
            </ul>
          </section>

          {/* 4. Segurança */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">4. Segurança</h2>
            <p className="mb-3">
              Implementamos medidas rigorosas de proteção de dados para garantir a segurança de suas informações:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Criptografia:</strong> Dados sensíveis são criptografados durante transmissão (HTTPS/SSL)</li>
              <li><strong>Backups:</strong> Realizamos backups regulares para proteger contra perda de dados</li>
              <li><strong>Controles de Acesso:</strong> Acesso restrito a informações pessoais apenas para funcionários 
              autorizados</li>
              <li><strong>Monitoramento:</strong> Monitoramento contínuo de sistemas para detectar e prevenir acessos 
              não autorizados</li>
              <li><strong>Atualizações de Segurança:</strong> Mantemos nossos sistemas atualizados com as melhores 
              práticas de segurança</li>
            </ul>
          </section>

          {/* 5. Cookies */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">5. Cookies</h2>
            <p className="mb-3">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência de navegação e análise de marketing:
            </p>
            <p><strong>Uso de Cookies para Navegação:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Lembrar suas preferências (idioma, moeda, etc.)</li>
              <li>Manter você logado em sua conta</li>
              <li>Melhorar o desempenho do site</li>
            </ul>
            <p><strong>Rastreamento de Marketing:</strong></p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Analisar como você usa nosso site</li>
              <li>Personalizar anúncios e ofertas</li>
              <li>Medir a eficácia de campanhas de marketing</li>
            </ul>
            <p>
              Você pode desabilitar cookies através das configurações do seu navegador, mas isso pode afetar 
              algumas funcionalidades do site.
            </p>
          </section>

          {/* 6. Direitos do Cliente */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">6. Direitos do Cliente</h2>
            <p className="mb-3">
              Você tem os seguintes direitos em relação aos seus dados pessoais:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acesso:</strong> Solicitar uma cópia dos dados pessoais que mantemos sobre você</li>
              <li><strong>Correção:</strong> Solicitar correção de dados incorretos ou desatualizados</li>
              <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais (sujeito a obrigações legais)</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados para fins específicos</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e legível</li>
              <li><strong>Opt-out de Newsletters:</strong> Descadastrar-se de comunicações de marketing a qualquer momento</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer um desses direitos, entre em contato conosco através dos canais informados 
              na seção "Contato" desta política.
            </p>
          </section>

          {/* 7. Retenção de Dados */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">7. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos 
              nesta política, ou conforme exigido por lei. Após o período de retenção, seus dados serão excluídos 
              ou anonimizados de forma segura.
            </p>
          </section>

          {/* 8. Menores de Idade */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">8. Menores de Idade</h2>
            <p>
              Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente informações 
              de crianças. Se você é pai/mãe ou responsável e acredita que seu filho nos forneceu informações pessoais, 
              entre em contato conosco para que possamos remover essas informações.
            </p>
          </section>

          {/* 9. Alterações à Política */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">9. Alterações à Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas 
              ou por outros motivos operacionais, legais ou regulamentares. Notificaremos sobre alterações significativas 
              através do site ou por e-mail. Recomendamos que você revise esta política periodicamente.
            </p>
          </section>

          {/* 10. Contato */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">10. Contato</h2>
            <p className="mb-3">
              Para questões sobre privacidade, exercer seus direitos ou solicitar informações sobre esta política, 
              entre em contato:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>E-mail:</strong> suporte.papelepixel@outlook.com</li>
              <li><strong>Telefone:</strong> +258 874383621</li>
              <li><strong>WhatsApp:</strong> +258 874383621</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Privacy;
