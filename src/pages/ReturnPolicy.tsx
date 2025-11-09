import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, Shield, AlertCircle, FileText, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReturnPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-heading font-bold">Política de Devolução e Reembolso</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Garantimos sua satisfação total. Entenda como funciona nosso processo de devolução.
            </p>
          </div>

          {/* Garantia de Satisfação */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Garantia de Satisfação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Na <strong>Papel & Pixel</strong>, sua satisfação é nossa prioridade. Oferecemos uma política de devolução 
                flexível e transparente para garantir que você fique 100% satisfeito com sua compra.
              </p>
            </CardContent>
          </Card>

          {/* Prazo para Devolução */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Prazo para Solicitar Devolução
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">⏰ Prazo de 30 dias</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Você tem até <strong>30 dias</strong> após o recebimento do produto para solicitar a devolução.
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>Contagem do prazo:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Inicia no dia do recebimento do pedido</li>
                  <li>Válido apenas para produtos em perfeito estado</li>
                  <li>Produtos usados ou danificados não se enquadram nesta política</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Condições para Devolução */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Condições para Devolução
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Produtos que PODEM ser devolvidos:
                </h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Produtos <strong>não utilizados</strong> e em <strong>embalagem original</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Produtos com <strong>defeito de fabricação</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Produtos <strong>diferentes</strong> do que foi solicitado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Produtos <strong>danificados durante o transporte</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Produtos que chegaram <strong>incompletos</strong></span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Produtos que NÃO podem ser devolvidos:
                </h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✗</span>
                    <span>Produtos <strong>utilizados</strong> ou <strong>sem embalagem original</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✗</span>
                    <span>Produtos <strong>personalizados</strong> ou <strong>sob medida</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✗</span>
                    <span>Produtos <strong>danificados pelo cliente</strong> (sem defeito original)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✗</span>
                    <span>Produtos <strong>digitais</strong> já baixados (livros PDF, softwares)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">✗</span>
                    <span>Produtos comprados há <strong>mais de 30 dias</strong></span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Processo de Devolução - Passo a Passo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Como Solicitar uma Devolução? (Passo a Passo)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Acesse "Meus Pedidos"</h3>
                    <p className="text-muted-foreground text-sm">
                      Faça login na sua conta e vá em <strong>"Meu Perfil" → "Meus Pedidos"</strong> ou 
                      acesse diretamente <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/returns')}>Solicitar Devolução</Button>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Selecione o Pedido</h3>
                    <p className="text-muted-foreground text-sm">
                      Encontre o pedido que deseja devolver na lista e clique em <strong>"Solicitar Devolução"</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Informe o Motivo</h3>
                    <p className="text-muted-foreground text-sm">
                      Preencha o formulário explicando o motivo da devolução. Seja específico para agilizar o processo.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Aguarde a Análise</h3>
                    <p className="text-muted-foreground text-sm">
                      Nossa equipe analisará sua solicitação em até <strong>2 dias úteis</strong>. Você receberá um email 
                      com a resposta e instruções para envio do produto.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      5
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Envie o Produto (se aprovado)</h3>
                    <p className="text-muted-foreground text-sm">
                      Se sua devolução for aprovada, você receberá instruções para enviar o produto. 
                      Em caso de defeito, podemos cobrir o frete de retorno.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      6
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Receba o Reembolso</h3>
                    <p className="text-muted-foreground text-sm">
                      Após recebermos e inspecionarmos o produto, processaremos o reembolso em até <strong>5 dias úteis</strong> 
                      no mesmo método de pagamento utilizado.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reembolso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Política de Reembolso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">✅ O que será reembolsado:</h3>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>• Valor total do produto</li>
                    <li>• Frete (se produto veio com defeito)</li>
                    <li>• Taxas de pagamento (quando aplicável)</li>
                  </ul>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">⚠️ O que NÃO será reembolsado:</h3>
                  <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                    <li>• Frete de retorno (salvo defeito)</li>
                    <li>• Produtos danificados pelo cliente</li>
                    <li>• Produtos fora do prazo</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>⏱️ Prazo de Reembolso:</strong> Após aprovação e recebimento do produto, 
                  o reembolso será processado em até <strong>5 dias úteis</strong>. O valor aparecerá na sua conta 
                  em até <strong>7-14 dias úteis</strong>, dependendo do método de pagamento.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transporte e Envio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-primary" />
                Envio e Transporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">Quem paga o frete de retorno?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span><strong>Cliente paga:</strong> Quando a devolução é por motivo do cliente (ex: mudou de ideia, não gostou)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span><strong>Loja paga:</strong> Quando o produto veio com defeito, errado ou danificado no transporte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span><strong>Loja paga:</strong> Em caso de erro da loja (produto errado, incompleto)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  <strong>Importante:</strong> Embalagem adequada é essencial! Produtos devolvidos mal embalados 
                  podem ser recusados ou ter o reembolso parcial.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Exceções e Casos Especiais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-primary" />
                Casos Especiais e Exceções
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">📚 Livros Digitais (PDF)</h3>
                <p className="text-sm text-muted-foreground">
                  Livros digitais <strong>não podem ser devolvidos</strong> após download. Certifique-se de que o produto 
                  atende suas necessidades antes de fazer o download. Se o arquivo estiver corrompido ou diferente do anunciado, 
                  entre em contato conosco imediatamente.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎁 Produtos em Promoção</h3>
                <p className="text-sm text-muted-foreground">
                  Produtos comprados em promoção seguem a mesma política de devolução, mas o reembolso será do 
                  valor pago (não do valor original).
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📦 Produtos Danificados no Transporte</h3>
                <p className="text-sm text-muted-foreground">
                  Se o produto chegou danificado, <strong>não aceite a entrega</strong> ou tire fotos imediatamente. 
                  Entre em contato conosco no mesmo dia para processarmos a devolução e reembolso sem custos para você.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contato e Suporte */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Precisa de Ajuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Nossa equipe de suporte está pronta para ajudar você com qualquer dúvida sobre devoluções.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Email</p>
                    <a href="mailto:atendimento@papelepixel.co.mz" className="text-sm text-muted-foreground hover:text-primary">
                      atendimento@papelepixel.co.mz
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Telefone</p>
                    <a href="tel:+258874383621" className="text-sm text-muted-foreground hover:text-primary">
                      +258 874383621
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={() => navigate('/returns')} className="w-full md:w-auto">
                  Solicitar Devolução Agora
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Última Atualização */}
          <div className="text-center text-sm text-muted-foreground py-4">
            <p>Última atualização: {new Date().toLocaleDateString('pt-MZ', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="mt-2">
              Esta política pode ser atualizada periodicamente. Recomendamos verificar regularmente.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;

