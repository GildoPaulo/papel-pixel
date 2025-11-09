import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { useOrders } from "@/contexts/OrdersContext";
import { toast } from "sonner";
import { API_URL } from "@/config/api";
import ProtectedRoute from "@/components/ProtectedRoute";

interface TrackingEvent {
  id: number;
  status: string;
  location?: string;
  timestamp: string;
  description: string;
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loadUserOrders } = useOrders();
  const [trackingCode, setTrackingCode] = useState(orderId || "");
  const [order, setOrder] = useState<any>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId && user?.id) {
      loadTracking(orderId);
    }
  }, [orderId, user]);

  const loadTracking = async (id: string) => {
    setLoading(true);
    try {
      // Buscar pedido
      const response = await fetch(`${API_URL}/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Backend retorna { order: ... } ou direto o order
        const orderData = data.order || data;
        setOrder(orderData);
        
        // Gerar eventos de rastreamento baseado no status
        generateTrackingEvents(orderData);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Pedido não encontrado' }));
        toast.error(errorData.error || 'Pedido não encontrado');
      }
    } catch (error) {
      console.error('Error loading tracking:', error);
      toast.error('Erro ao carregar rastreamento');
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingEvents = (orderData: any) => {
    const events: TrackingEvent[] = [];
    const now = new Date();
    const createdDate = new Date(orderData.created_at);
    const shippedDate = orderData.shipped_at ? new Date(orderData.shipped_at) : null;

    // Sempre incluir: Pedido recebido
    events.push({
      id: 1,
      status: 'pending',
      location: 'Loja',
      timestamp: createdDate.toISOString(),
      description: 'Pedido recebido e aguardando confirmação',
    });

    // Status: confirmed ou superior
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(orderData.status)) {
      const confirmedDate = new Date(createdDate);
      confirmedDate.setHours(confirmedDate.getHours() + 2); // 2 horas após criação
      
      events.push({
        id: 2,
        status: 'confirmed',
        location: 'Centro de distribuição',
        timestamp: confirmedDate.toISOString(),
        description: 'Pedido confirmado e em preparação',
      });
    }

    // Status: processing ou superior
    if (['processing', 'shipped', 'delivered'].includes(orderData.status)) {
      const processingDate = new Date(createdDate);
      processingDate.setDate(processingDate.getDate() + 1); // 1 dia após criação
      
      events.push({
        id: 3,
        status: 'processing',
        location: 'Centro de distribuição',
        timestamp: processingDate.toISOString(),
        description: 'Pedido sendo preparado para envio',
      });
    }

    // Status: shipped ou delivered
    if (['shipped', 'delivered'].includes(orderData.status)) {
      const shipDate = shippedDate || (() => {
        const d = new Date(createdDate);
        d.setDate(d.getDate() + 2);
        return d;
      })();
      
      events.push({
        id: 4,
        status: 'shipped',
        location: 'Em trânsito',
        timestamp: shipDate.toISOString(),
        description: 'Pedido enviado para entrega',
      });

      // Evento adicional: Saiu do centro de distribuição
      const leftDate = new Date(shipDate);
      leftDate.setHours(leftDate.getHours() + 4);
      
      events.push({
        id: 5,
        status: 'shipped',
        location: 'Centro de distribuição regional',
        timestamp: leftDate.toISOString(),
        description: 'Pedido saiu do centro de distribuição',
      });
    }

    // Status: delivered
    if (orderData.status === 'delivered') {
      const deliveredDate = new Date(createdDate);
      deliveredDate.setDate(deliveredDate.getDate() + 5); // 5 dias após criação (padrão)
      
      events.push({
        id: 6,
        status: 'delivered',
        location: orderData.shipping_address || 'Destino',
        timestamp: deliveredDate.toISOString(),
        description: 'Pedido entregue ao destinatário',
      });
    }

    // Ordenar por timestamp (mais recente primeiro) e remover duplicatas
    const uniqueEvents = Array.from(
      new Map(events.map(e => [e.description + e.timestamp, e])).values()
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setTrackingEvents(uniqueEvents);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      navigate(`/tracking/${trackingCode}`);
      loadTracking(trackingCode);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      processing: 'Em Processamento',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      processing: 'bg-purple-500',
      shipped: 'bg-orange-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') return <CheckCircle className="h-5 w-5" />;
    if (status === 'shipped') return <Truck className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-heading font-bold">Rastrear Pedido</h1>
        </div>

        {/* Search Form */}
        {!orderId && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Buscar Pedido</CardTitle>
              <CardDescription>
                Digite o número do pedido para rastrear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="trackingCode">Número do Pedido</Label>
                  <Input
                    id="trackingCode"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ex: 123"
                    required
                  />
                </div>
                <Button type="submit" className="mt-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Rastrear
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando informações do pedido...</p>
          </div>
        )}

        {/* Order Info */}
        {order && !loading && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pedido #{order.id}</CardTitle>
                    <CardDescription>
                      Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Endereço de Entrega
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        try {
                          // Tentar parse se for JSON, senão usar direto
                          if (order.shipping_address) {
                            if (order.shipping_address.startsWith('{')) {
                              const parsed = JSON.parse(order.shipping_address);
                              return parsed.address || parsed || order.shipping_address;
                            }
                            return order.shipping_address;
                          }
                          return 'Não informado';
                        } catch (e) {
                          // Se falhar, usar o valor direto
                          return order.shipping_address || 'Não informado';
                        }
                      })()}
                      {order.shipping_city && `, ${order.shipping_city}`}
                      {order.shipping_province && `, ${order.shipping_province}`}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Total</h3>
                    <p className="text-2xl font-bold text-primary">
                      {order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </p>
                  </div>
                </div>

                {/* Tracking Code */}
                {order.tracking_code && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Código de Rastreamento</h4>
                        <p className="text-lg font-mono font-bold text-blue-700">{order.tracking_code}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(order.tracking_code);
                          toast.success('Código copiado!');
                        }}
                      >
                        📋 Copiar
                      </Button>
                    </div>
                    {order.tracking_url && (
                      <a 
                        href={order.tracking_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        🔗 Rastrear na transportadora
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Histórico de Rastreamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingEvents.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getStatusColor(event.status)}`}>
                          {getStatusIcon(event.status)}
                        </div>
                        {index < trackingEvents.length - 1 && (
                          <div className="w-1 h-16 bg-muted" />
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{event.description}</p>
                            {event.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!order && !loading && orderId && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Pedido não encontrado ou você não tem permissão para visualizá-lo.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

// Wrapper para proteger a rota
const ProtectedOrderTracking = () => {
  return (
    <ProtectedRoute>
      <OrderTracking />
    </ProtectedRoute>
  );
};

export default ProtectedOrderTracking;

