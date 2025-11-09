import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Save, LogOut, ShoppingBag, Package, Heart, Search, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { useOrders } from "@/contexts/OrdersContext";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user, logout } = useAuth();
  const { loadUserOrders } = useOrders();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [downloadingItems, setDownloadingItems] = useState<Record<string, boolean>>({});
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  });

  useEffect(() => {
    // Load saved profile data
    const savedData = localStorage.getItem(`profile_${user?.id}`);
    if (savedData) {
      setProfileData(JSON.parse(savedData));
    }

    // Load user orders
    if (user?.id) {
      loadUserOrdersList();
    }
  }, [user]);

  const loadUserOrdersList = async () => {
    if (!user?.id) {
      console.warn('⚠️ [PROFILE] User ID não disponível');
      return;
    }
    setOrdersLoading(true);
    try {
      console.log(`📦 [PROFILE] Carregando pedidos do usuário ${user.id}...`);
      const userOrders = await loadUserOrders(parseInt(user.id.toString()));
      console.log(`✅ [PROFILE] ${userOrders?.length || 0} pedidos carregados`);
      setOrders(userOrders || []);
    } catch (error) {
      console.error('❌ [PROFILE] Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Save to localStorage
    localStorage.setItem(`profile_${user?.id}`, JSON.stringify(profileData));
    
    toast.success("Perfil atualizado com sucesso!");
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logout realizado com sucesso!");
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

  const handleDownloadProduct = async (productId: string, productName: string) => {
    setDownloadingItems(prev => ({ ...prev, [productId]: true }));
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/products/${productId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer download');
      }

      // Se a resposta for um JSON com pdfUrl, fazer download via link
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.pdfUrl) {
          const pdfUrl = data.pdfUrl.startsWith('http') 
            ? data.pdfUrl 
            : `${API_URL.replace('/api', '')}${data.pdfUrl}`;
          window.open(pdfUrl, '_blank');
          toast.success('Download iniciado!');
          return;
        }
      }

      // Se for arquivo PDF direto, criar blob e baixar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${productName.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download concluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download. Tente novamente.');
    } finally {
      setDownloadingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold">Meu Perfil</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie suas informações pessoais
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center mb-4">
                      <User className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">{user?.name}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Menu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => window.scrollTo({top: 0})}>
                    <User className="h-4 w-4 mr-2" />
                    Informações Pessoais
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#pedidos">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Meus Pedidos
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#produtos-comprados">
                      <Package className="h-4 w-4 mr-2" />
                      Produtos Comprados
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/returns">
                      <Package className="h-4 w-4 mr-2" />
                      Devoluções
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoritos
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card id="personal">
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações de conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+258 XX XXX XXXX"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Separator />

                    <h3 className="font-semibold mb-3">Endereço de Entrega</h3>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          placeholder="Rua, número, bairro"
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="province">Província</Label>
                        <Input
                          id="province"
                          value={profileData.province}
                          onChange={(e) => setProfileData({...profileData, province: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-accent" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Orders History */}
              <Card id="pedidos">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Meus Pedidos</CardTitle>
                      <CardDescription>
                        Histórico de suas compras
                      </CardDescription>
                    </div>
                    {orders.length > 0 && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/tracking">
                          <Search className="h-4 w-4 mr-2" />
                          Rastrear Todos
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Carregando pedidos...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum pedido realizado ainda</p>
                      <Button className="mt-4" asChild>
                        <Link to="/products">Ver Produtos</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">Pedido #{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                              <p className="text-lg font-bold text-primary mt-1">
                                {order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                              </p>
                            </div>
                          </div>

                          {order.items && order.items.length > 0 && (
                            <div className="pt-3 border-t">
                              <p className="text-sm font-semibold mb-2">Itens:</p>
                              <div className="space-y-1">
                                {order.items.slice(0, 3).map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                                    <span>{item.quantity}x {item.product_name || item.name}</span>
                                    <span>{(item.subtotal || item.price * item.quantity).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                                  </div>
                                ))}
                                {order.items.length > 3 && (
                                  <p className="text-xs text-muted-foreground">+{order.items.length - 3} mais...</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Mostrar código de rastreamento APENAS se tiver produtos físicos */}
                          {(() => {
                            const hasPhysicalItems = order.items?.some((item: any) => !item.product_type || item.product_type === 'fisico');
                            return hasPhysicalItems && order.tracking_code ? (
                              <div className="pt-2 pb-2 border-b">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Código de Rastreamento</p>
                                    <p className="text-sm font-mono font-semibold">{order.tracking_code}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      navigator.clipboard.writeText(order.tracking_code);
                                      toast.success('Código copiado!');
                                    }}
                                  >
                                    📋
                                  </Button>
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {/* Separar produtos digitais e físicos */}
                          {(() => {
                            // Separar itens digitais e físicos
                            const digitalItems = order.items?.filter((item: any) => item.product_type === 'digital') || [];
                            const physicalItems = order.items?.filter((item: any) => !item.product_type || item.product_type === 'fisico') || [];
                            
                            // Se tem produtos digitais E o pagamento foi confirmado
                            if (digitalItems.length > 0 && (order.status === 'confirmed' || order.status === 'processing' || order.status === 'delivered')) {
                              return (
                                <div className="pt-2 space-y-2">
                                  {/* Botões de download para produtos digitais */}
                                  {digitalItems.map((item: any) => (
                                    <Button
                                      key={item.id}
                                      variant={item.product_gratuito ? "outline" : "default"}
                                      size="sm"
                                      onClick={() => handleDownloadProduct(item.product_id, item.product_name)}
                                      disabled={downloadingItems[item.product_id]}
                                      className="w-full"
                                    >
                                      <Download className={`h-4 w-4 mr-2 ${downloadingItems[item.product_id] ? 'animate-spin' : ''}`} />
                                      {downloadingItems[item.product_id] 
                                        ? 'Baixando...' 
                                        : item.product_gratuito 
                                          ? `📘 Baixar Grátis: ${item.product_name}`
                                          : `⬇️ Baixar Agora: ${item.product_name}`
                                      }
                                    </Button>
                                  ))}
                                  
                                  {/* Botões para produtos físicos (se houver) */}
                                  {physicalItems.length > 0 && (
                                    <div className="flex gap-2 pt-2 border-t">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/tracking/${order.id}`)}
                                        className="flex-1"
                                      >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {order.tracking_code ? 'Ver Rastreamento' : 'Rastrear'}
                                      </Button>
                                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => navigate('/returns')}
                                          className="flex-1"
                                        >
                                          <Package className="h-4 w-4 mr-2" />
                                          Devolver
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            
                            // Apenas produtos físicos - mostrar rastreamento e devolução
                            if (physicalItems.length > 0) {
                              return (
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/tracking/${order.id}`)}
                                    className="flex-1"
                                  >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {order.tracking_code ? 'Ver Rastreamento' : 'Rastrear'}
                                  </Button>
                                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate('/returns')}
                                      className="flex-1"
                                    >
                                      <Package className="h-4 w-4 mr-2" />
                                      Devolver
                                    </Button>
                                  )}
                                </div>
                              );
                            }
                            
                            // Produtos digitais pendentes
                            if (digitalItems.length > 0 && order.status === 'pending') {
                              return (
                                <div className="pt-2 text-center text-sm text-muted-foreground">
                                  ⏳ Aguardando pagamento...
                                </div>
                              );
                            }
                            
                            return null;
                          })()}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Purchased Products Section */}
              <Card id="produtos-comprados">
                <CardHeader>
                  <CardTitle>Produtos Comprados</CardTitle>
                  <CardDescription>
                    Seus produtos comprados em todos os pedidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Carregando produtos...</p>
                    </div>
                  ) : (() => {
                    // Obter todos os produtos únicos comprados
                    const purchasedProducts = new Map();
                    
                    orders.forEach(order => {
                      if (order.items && order.items.length > 0) {
                        order.items.forEach((item: any) => {
                          const productId = item.product_id || item.id;
                          if (productId) {
                            if (!purchasedProducts.has(productId)) {
                              purchasedProducts.set(productId, {
                                id: productId,
                                name: item.product_name || item.name || 'Produto',
                                image: item.product_image || item.image,
                                totalQuantity: 0,
                                totalSpent: 0,
                                lastPurchase: order.created_at,
                                orders: []
                              });
                            }
                            const product = purchasedProducts.get(productId);
                            product.totalQuantity += item.quantity || 0;
                            product.totalSpent += (item.subtotal || item.price * item.quantity || 0);
                            if (!product.orders.includes(order.id)) {
                              product.orders.push(order.id);
                            }
                          }
                        });
                      }
                    });

                    const productsArray = Array.from(purchasedProducts.values());

                    if (productsArray.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum produto comprado ainda</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {productsArray.map((product) => (
                          <div
                            key={product.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex gap-4">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">{product.name}</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>Quantidade total: <strong>{product.totalQuantity}</strong></p>
                                  <p>Total gasto: <strong className="text-primary">
                                    {product.totalSpent.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                  </strong></p>
                                  <p>Última compra: {new Date(product.lastPurchase).toLocaleDateString('pt-BR')}</p>
                                  <p>Em {product.orders.length} pedido{product.orders.length !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;




