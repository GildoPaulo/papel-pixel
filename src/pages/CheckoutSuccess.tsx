import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Package, Mail, Home, Receipt, Download, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSearchParams } from "react-router-dom";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { total, clearCart } = useCart();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const transactionId = (location.state as any)?.transactionId || searchParams.get('transaction');
  const orderId = searchParams.get('orderId') || (location.state as any)?.orderId;

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    // Buscar dados reais do pedido se tiver orderId
    if (orderId) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      fetch(`${API_URL}/orders/${orderId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Pedido não encontrado');
          }
          return res.json();
        })
        .then(data => {
          console.log('✅ Dados do pedido recebidos:', data);
          setOrder({
            id: data.id || orderId,
            total: parseFloat(data.total || 0),
            estimatedDelivery: "15-20 dias úteis",
            status: data.status || 'confirmed',
            created_at: data.created_at
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('❌ Erro ao buscar pedido:', err);
          // Fallback para dados mockados
          setOrder({
            id: orderId || `ORD-${Date.now()}`,
            total: total || 0,
            estimatedDelivery: "15-20 dias úteis"
          });
          setLoading(false);
        });
    } else {
      console.warn('⚠️ Nenhum orderId encontrado na URL');
      // Fallback para dados mockados se não tiver orderId
      setOrder({
        id: `ORD-${Date.now()}`,
        total: total || 0,
        estimatedDelivery: "15-20 dias úteis"
      });
      setLoading(false);
    }
  }, [orderId, total]);

  const handleViewReceipt = () => {
    setShowReceipt(true);
  };

  const handleDownloadReceipt = () => {
    if (orderId) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      window.open(`${API_URL}/receipt/${orderId}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold mb-2">
              Pedido Confirmado!
            </h1>
            <p className="text-muted-foreground">
              Obrigado pela sua compra. Recebemos o seu pedido e iniciaremos o processamento.
            </p>
          </div>

          {loading ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Carregando informações do pedido...</p>
                </div>
              </CardContent>
            </Card>
          ) : order ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Package className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h2 className="font-bold text-lg mb-1">Número do Pedido</h2>
                    <p className="text-2xl font-bold text-primary">{order.id}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Um e-mail de confirmação foi enviado para o seu endereço de e-mail.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total do Pedido</span>
                    <span className="font-bold text-lg">
                      {order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Previsão de Entrega</span>
                    <span className="font-semibold">{order.estimatedDelivery}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Erro ao carregar informações do pedido.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">O que acontece agora?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Você receberá atualizações por e-mail sobre o status do seu pedido.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>✓ Confirmação do pagamento</p>
                    <p>✓ Preparação do pedido</p>
                    <p>✓ Envio e rastreamento</p>
                    <p>✓ Confirmação de entrega</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            {(orderId || transactionId) && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleViewReceipt}
                disabled={loading}
              >
                <Receipt className="mr-2 h-4 w-4" />
                {loading ? 'Carregando...' : 'Ver Recibo do Pagamento (PDF)'}
              </Button>
            )}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/")}
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar ao Início
              </Button>
              <Button 
                className="flex-1 bg-gradient-accent"
                onClick={() => navigate("/products")}
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Dialog para mostrar recibo inline */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Recibo do Pagamento</DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownloadReceipt}
                  title="Baixar PDF"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowReceipt(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="w-full" style={{ height: 'calc(90vh - 100px)' }}>
            {orderId && (
              <iframe
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/receipt/${orderId}`}
                className="w-full h-full border-0"
                title="Recibo do Pagamento"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;

