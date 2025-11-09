import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, Printer, Loader2 } from "lucide-react";
import { getPaymentStatus } from "@/services/payments";

const PaymentReceipt = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactionId) {
      fetchPaymentStatus();
    }
  }, [transactionId]);

  const fetchPaymentStatus = async () => {
    try {
      const data = await getPaymentStatus(transactionId!);
      setPayment(data);
    } catch (error) {
      console.error('Error fetching payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receipt = document.getElementById('receipt-content');
    if (receipt) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(receipt.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Pagamento não encontrado</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const orderData = payment.order_data ? JSON.parse(payment.order_data) : { items: [], shippingInfo: {} };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto" id="receipt-content">
          {/* Receipt Header */}
          <Card className="mb-6 print:shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Recibo de Pagamento</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    ID da Transação: {payment.transaction_id}
                  </p>
                </div>
                <Badge 
                  variant={payment.status === 'completed' || payment.status === 'confirmed' ? 'default' : 'secondary'}
                  className="text-lg px-4 py-2"
                >
                  {payment.status === 'completed' || payment.status === 'confirmed' ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirmado
                    </>
                  ) : payment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Company Info */}
              <div className="bg-muted p-6 rounded-lg mb-6">
                <h3 className="font-bold text-lg mb-2">Papel & Pixel Store</h3>
                <p className="text-sm text-muted-foreground">
                  Cidade da Beira, Moçambique
                </p>
                <p className="text-sm text-muted-foreground">
                  +258 874383621
                </p>
                <p className="text-sm text-muted-foreground">
                  atendimento@papelepixel.co.mz
                </p>
              </div>

              <Separator className="my-6" />

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold">Itens do Pedido</h3>
                {orderData.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qtd: {item.quantity} × {item.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {(item.price * item.quantity).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Payment Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de Pagamento:</span>
                  <span className="font-semibold capitalize">{payment.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-semibold">
                    {new Date(payment.created_at).toLocaleString('pt-PT')}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                  <span>Total:</span>
                  <span>{payment.amount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                </div>
              </div>

              {/* Shipping Info */}
              {orderData.shippingInfo && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-2 mb-6">
                    <h3 className="font-semibold">Informações de Entrega</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="font-medium">{orderData.shippingInfo.name}</p>
                      <p className="text-sm text-muted-foreground">{orderData.shippingInfo.email}</p>
                      <p className="text-sm text-muted-foreground">{orderData.shippingInfo.phone}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {orderData.shippingInfo.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {orderData.shippingInfo.city}, {orderData.shippingInfo.province}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Status Message */}
              {(payment.status === 'completed' || payment.status === 'confirmed') && (
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Pedido Confirmado!</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Seu pagamento foi confirmado e seu pedido será processado em breve.
                      </p>
                      {orderData.shippingInfo?.address && (
                        <p className="text-sm text-green-700">
                          A entrega será feita no endereço informado.
                        </p>
                      )}
                      {payment.payment_method === 'cash' && (
                        <p className="text-sm text-yellow-700 font-medium mt-2">
                          Você pagará em dinheiro quando receber o pedido.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {payment.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Loader2 className="h-6 w-6 text-yellow-600 mt-0.5 animate-spin" />
                    <div>
                      <h4 className="font-semibold text-yellow-900 mb-2">Aguardando Pagamento</h4>
                      <p className="text-sm text-yellow-700">
                        Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail quando o pagamento for confirmado.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center print:hidden">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleDownload} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
            <Button onClick={() => navigate('/products')}>
              Continuar Comprando
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentReceipt;

