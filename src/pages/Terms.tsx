import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12 max-w-4xl">
        <h1 className="text-4xl font-heading font-bold mb-8 bg-gradient-hero bg-clip-text text-transparent">
          Termos e Condições
        </h1>

        <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
          {/* 1. Informações da Empresa */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">1. Informações da Empresa</h2>
            <div className="space-y-2">
              <p><strong>Nome da Loja:</strong> Papel & Pixel Store</p>
              <p><strong>Endereço:</strong> Cidade da Beira, Moçambique</p>
              <p><strong>Contato:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>E-mail: suporte.papelepixel@outlook.com</li>
                <li>Telefone: +258 874383621</li>
                <li>WhatsApp: +258 874383621</li>
              </ul>
              <p><strong>NIF:</strong> [A ser informado pela empresa]</p>
            </div>
          </section>

          {/* 2. Cadastro de Usuário */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">2. Cadastro de Usuário</h2>
            <div className="space-y-3">
              <p>
                Para realizar compras em nossa loja, é necessário criar uma conta de usuário fornecendo informações 
                verdadeiras, precisas e completas.
              </p>
              <p><strong>Dados Obrigatórios:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nome completo</li>
                <li>Endereço de e-mail válido</li>
                <li>Número de telefone</li>
                <li>Endereço de entrega completo</li>
                <li>Senha segura (mínimo 6 caracteres)</li>
              </ul>
              <p>
                <strong>Responsabilidade pelo Login e Senha:</strong> Você é totalmente responsável por manter a 
                confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta. Recomendamos que 
                você não compartilhe suas credenciais de acesso com terceiros.
              </p>
            </div>
          </section>

          {/* 3. Compra e Pagamento */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">3. Compra e Pagamento</h2>
            <div className="space-y-3">
              <p><strong>Formas de Pagamento Aceitas:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>M-Pesa (Mobile Money)</li>
                <li>PayPal</li>
                <li>Cartões Visa/Mastercard</li>
                <li>EMOLA</li>
                <li>Mkesh</li>
                <li>Transferência Bancária</li>
                <li>RIHA</li>
                <li>Dinheiro na Entrega (disponível para produtos físicos)</li>
              </ul>
              <p>
                <strong>Confirmação de Pedidos:</strong> Ao finalizar uma compra, você receberá um e-mail de confirmação 
                com os detalhes do pedido. O pedido será processado após a confirmação do pagamento.
              </p>
              <p>
                <strong>Política de Preços:</strong> Todos os preços estão em Meticais (MZN) e podem ser alterados 
                sem aviso prévio. Reservamo-nos o direito de corrigir erros de preço, mesmo após o pedido ser confirmado.
              </p>
              <p>
                <strong>Produtos Digitais vs Físicos:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Produtos Digitais:</strong> E-books, revistas online e materiais digitais são disponibilizados 
                para download imediatamente após a confirmação do pagamento.</li>
                <li><strong>Produtos Físicos:</strong> Livros impressos, papelaria e produtos físicos são enviados via 
                transportadora após a confirmação do pagamento.</li>
              </ul>
            </div>
          </section>

          {/* 4. Entrega e Rastreamento */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">4. Entrega e Rastreamento</h2>
            <div className="space-y-3">
              <p><strong>Prazos de Envio para Produtos Físicos:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Prazo estimado: 15-20 dias úteis após confirmação do pagamento</li>
                <li>O prazo pode variar conforme a localização do destino</li>
                <li>Entregas em áreas remotas podem levar mais tempo</li>
              </ul>
              <p>
                <strong>Código de Rastreamento Automático:</strong> Todos os pedidos de produtos físicos recebem 
                automaticamente um código único de rastreamento no formato <strong>PX-AAAAMMDD-XXXXXX</strong>, onde:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>PX:</strong> Prefixo da loja (Papel & Pixel)</li>
                <li><strong>AAAAMMDD:</strong> Data do envio</li>
                <li><strong>XXXXXX:</strong> Sequência aleatória alfanumérica</li>
              </ul>
              <p>
                Este código será enviado automaticamente por e-mail quando o pedido for marcado como "Enviado" e 
                estará disponível na área "Meus Pedidos" do seu perfil.
              </p>
              <p>
                <strong>Downloads de Produtos Digitais:</strong> Produtos digitais ficam disponíveis para download 
                imediato na área "Meus Pedidos" após a confirmação do pagamento. Você receberá um link de download 
                por e-mail.
              </p>
              <p>
                <strong>Frete Grátis:</strong> Aplicável para compras acima de 500 MZN em produtos físicos.
              </p>
            </div>
          </section>

          {/* 5. Política de Cancelamento e Reembolso */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">5. Política de Cancelamento e Reembolso</h2>
            <div className="space-y-3">
              <p><strong>Condições para Cancelamento:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Pedidos podem ser cancelados antes do envio</li>
                <li>Cancelamentos após o envio estão sujeitos à nossa Política de Devolução</li>
                <li>Produtos digitais podem ser cancelados dentro de 7 dias após a compra, exceto em casos específicos</li>
              </ul>
              <p><strong>Reembolsos:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Reembolsos serão processados no mesmo método de pagamento utilizado</li>
                <li>O prazo para crédito pode levar de 5 a 10 dias úteis</li>
                <li>Produtos devolvidos devem estar em perfeito estado, com embalagem original</li>
              </ul>
              <p>
                <strong>Produtos Digitais:</strong> Devido à natureza digital dos produtos, reembolsos podem não ser 
                aplicáveis após o download ou acesso ao conteúdo, exceto em casos de defeitos ou falhas técnicas 
                comprovadas.
              </p>
            </div>
          </section>

          {/* 6. Responsabilidade */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">6. Responsabilidade</h2>
            <div className="space-y-3">
              <p><strong>Responsabilidade da Loja:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Garantir a qualidade e descrição precisa dos produtos</li>
                <li>Processar pagamentos de forma segura</li>
                <li>Enviar produtos dentro dos prazos estabelecidos</li>
                <li>Manter informações pessoais protegidas conforme nossa Política de Privacidade</li>
              </ul>
              <p><strong>Responsabilidade do Cliente:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a segurança de sua conta e senha</li>
                <li>Usar os produtos de acordo com a finalidade para a qual foram adquiridos</li>
                <li>Respeitar direitos autorais e propriedade intelectual dos produtos digitais</li>
                <li>Notificar imediatamente qualquer uso não autorizado de sua conta</li>
              </ul>
            </div>
          </section>

          {/* 7. Modificações */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">7. Modificações</h2>
            <p>
              A Papel & Pixel Store reserva-se o direito de atualizar, modificar ou alterar estes Termos e Condições 
              a qualquer momento, sem aviso prévio. As alterações entrarão em vigor imediatamente após a publicação 
              no site.
            </p>
            <p>
              É sua responsabilidade revisar periodicamente estes termos. Ao continuar utilizando o site e realizando 
              compras após qualquer modificação, você concorda automaticamente com os novos termos. Se você não concordar 
              com as alterações, deve cessar o uso do site e poderá solicitar o cancelamento de pedidos pendentes, 
              sujeito à nossa política de cancelamento.
            </p>
          </section>

          {/* 8. Aceitação dos Termos */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">8. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o site da Papel & Pixel Store, você concorda em cumprir e estar vinculado a estes 
              Termos e Condições. Se você não concorda com qualquer parte destes termos, não deve usar nosso site 
              ou realizar compras através dele.
            </p>
          </section>

          {/* 9. Contato */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">9. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos e Condições, entre em contato conosco:
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

export default Terms;
