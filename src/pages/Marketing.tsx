import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Users, 
  Send, 
  TrendingUp, 
  Target,
  Calendar,
  ClipboardList,
  AlertCircle,
  ShoppingCart,
  Sparkles,
  RefreshCw,
  Trash2,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useEmailMarketing } from "@/contexts/EmailMarketing";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Marketing = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { subscribers, campaigns, sendToAll, deleteCampaign } = useEmailMarketing();
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponText, setCouponText] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Ver Ofertas Agora 🛒");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingAbandonedCarts, setSendingAbandonedCarts] = useState(false);
  const [notifyingProducts, setNotifyingProducts] = useState(false);
  const [resendingCampaign, setResendingCampaign] = useState<string | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null);

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('banner', file);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/upload/banner`, {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fazer upload do banner');
      }
      
      const data = await response.json();
      setUploadingBanner(false);
      return data.url || data.imageUrl;
    } catch (error: any) {
      setUploadingBanner(false);
      toast.error(error.message || 'Erro ao fazer upload do banner');
      throw error;
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Imagem muito grande! Máximo 10MB.');
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
    setBannerUrl("");
  };

  const handleSendPromotion = async () => {
    if (!campaignTitle || !campaignMessage) {
      toast.error("Por favor, preencha título e mensagem");
      return;
    }

    setLoading(true);
    
    try {
      let finalBannerUrl = bannerUrl;
      
      // Upload do banner se houver arquivo
      if (bannerFile) {
        finalBannerUrl = await handleBannerUpload(bannerFile);
        setBannerUrl(finalBannerUrl);
      }
      
      const result = await sendToAll(
        campaignTitle, 
        campaignMessage,
        finalBannerUrl || undefined,
        couponCode || undefined,
        couponText || undefined,
        ctaLabel || undefined,
        destinationUrl || undefined
      );
    
    if (result?.success) {
      toast.success("Campanha enviada com sucesso!");
      setCampaignTitle("");
      setCampaignMessage("");
        setBannerUrl("");
        setBannerFile(null);
        setBannerPreview(null);
        setCouponCode("");
        setCouponText("");
        setCtaLabel("Ver Ofertas Agora 🛒");
        setDestinationUrl("");
    } else {
      toast.error(result?.error || "Erro ao enviar campanha");
      }
    } catch (error) {
      toast.error("Erro ao preparar ou enviar campanha");
    } finally {
      setLoading(false);
      setUploadingBanner(false);
    }
  };
  
  const handleSendAbandonedCarts = async () => {
    setSendingAbandonedCarts(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/marketing/send-abandoned-carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ hours: 24 })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Emails enviados: ${data.sent} | Erros: ${data.errors}`);
      } else {
        toast.error(data.message || "Erro ao enviar emails");
      }
    } catch (error: any) {
      toast.error("Erro ao enviar emails de carrinhos abandonados");
      console.error(error);
    } finally {
      setSendingAbandonedCarts(false);
    }
  };
  
  const handleNotifyNewProducts = async () => {
    setNotifyingProducts(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/marketing/notify-new-products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Notificações enviadas para ${data.notified} assinantes sobre ${data.products} produtos novos!`);
      } else {
        toast.error(data.message || "Erro ao enviar notificações");
      }
    } catch (error: any) {
      toast.error("Erro ao notificar produtos novos");
      console.error(error);
    } finally {
      setNotifyingProducts(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Tem certeza que deseja deletar esta campanha? Esta ação não pode ser desfeita.")) {
      return;
    }

    setDeletingCampaign(campaignId);
    try {
      const result = await deleteCampaign(campaignId);
      
      if (result.success) {
        toast.success("Campanha deletada com sucesso!");
      } else {
        toast.error(result.error || "Erro ao deletar campanha");
      }
    } catch (error: any) {
      toast.error("Erro ao deletar campanha");
      console.error(error);
    } finally {
      setDeletingCampaign(null);
    }
  };

  const handleResendCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      toast.error("Campanha não encontrada");
      return;
    }

    setResendingCampaign(campaignId);
    try {
      const result = await sendToAll(
        campaign.title,
        campaign.content,
        campaign.bannerUrl,      // Usa dados salvos
        campaign.couponCode,      // Usa dados salvos
        campaign.couponText,      // Usa dados salvos
        campaign.ctaLabel,        // Usa dados salvos
        campaign.destinationUrl   // Usa dados salvos
      );

      if (result?.success) {
        toast.success(`Campanha "${campaign.title}" reenviada com sucesso para ${result.stats?.total || 0} assinantes!`);
      } else {
        toast.error(result?.error || "Erro ao reenviar campanha");
      }
    } catch (error: any) {
      toast.error("Erro ao reenviar campanha");
      console.error(error);
    } finally {
      setResendingCampaign(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">Marketing & Promoções</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie newsletter, envie promoções e monitore resultados
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribers.length}</div>
              <p className="text-xs text-muted-foreground">Email cadastrado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground">Total enviadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Última campanha</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12%</div>
              <p className="text-xs text-muted-foreground">No último mês</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Criar Campanha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Enviar Promoção
              </CardTitle>
              <CardDescription>
                Crie e envie campanhas promocionais para seus assinantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-title">Título da Promoção</Label>
                <Input
                  id="campaign-title"
                  placeholder="Ex: Volta às Aulas - Até 40% OFF!"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="campaign-message">Mensagem</Label>
                <Textarea
                  id="campaign-message"
                  placeholder="Descreva a promoção, benefícios, prazo..."
                  rows={8}
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner">Banner da Campanha (opcional)</Label>
                <div className="space-y-2">
                  {!bannerPreview && !bannerUrl ? (
                    <div className="flex items-center justify-center w-full">
                      <Label
                        htmlFor="banner"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Clique para fazer upload</span> ou arraste a imagem
                          </p>
                          <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP até 10MB</p>
                        </div>
                        <Input
                          id="banner"
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/gif,image/webp"
                          onChange={handleBannerChange}
                          disabled={uploadingBanner}
                        />
                      </Label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative border-2 border-gray-300 rounded-lg p-2 bg-gray-50">
                        <img
                          src={bannerPreview || `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${bannerUrl}`}
                          alt="Preview do banner"
                          className="w-full h-48 object-contain rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-4 right-4"
                          onClick={handleRemoveBanner}
                          disabled={uploadingBanner}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {bannerUrl && !bannerFile && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📎 Banner atual: {bannerUrl}
                        </p>
                      )}
                    </div>
                  )}
                  {uploadingBanner && (
                    <p className="text-sm text-blue-600">Fazendo upload do banner...</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Banner será exibido no topo do email promocional
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coupon-code">Código do Cupom (opcional)</Label>
                  <Input
                    id="coupon-code"
                    placeholder="Ex: VOLTA40"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coupon-text">Texto do Cupom (opcional)</Label>
                  <Input
                    id="coupon-text"
                    placeholder="Use no checkout e ganhe desconto!"
                    value={couponText}
                    onChange={(e) => setCouponText(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta-label">Texto do Botão (opcional)</Label>
                  <Input
                    id="cta-label"
                    placeholder="Ver Ofertas Agora 🛒"
                    value={ctaLabel}
                    onChange={(e) => setCtaLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-url">URL de Destino (opcional)</Label>
                  <Input
                    id="destination-url"
                    placeholder="http://127.0.0.1:8080/promocoes"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Destinatários:</span>
                  <span className="font-semibold">{subscribers.length} assinantes</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline">Pronto para enviar</Badge>
                </div>
              </div>

              <Button 
                onClick={handleSendPromotion}
                className="w-full bg-gradient-accent"
                disabled={loading || uploadingBanner}
              >
                {loading || uploadingBanner ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {uploadingBanner ? "Fazendo Upload..." : "Enviando..."}
                  </>
                ) : (
                  <>
                <Send className="h-4 w-4 mr-2" />
                    Enviar Promoção
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Assinantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Assinantes da Newsletter
              </CardTitle>
              <CardDescription>
                Lista de clientes que receberão suas promoções
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {subscribers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum assinante ainda</p>
                    <p className="text-sm">Os clientes poderão se inscrever no rodapé do site</p>
                  </div>
                ) : (
                  subscribers.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-semibold">{sub.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Inscrito em {new Date(sub.createdAt).toLocaleDateString("pt-MZ")}
                        </p>
                      </div>
                      {sub.subscribed && (
                        <Badge variant="default">Ativo</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Automáticas */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinhos Abandonados
              </CardTitle>
              <CardDescription>
                Enviar emails para clientes com itens no carrinho há mais de 24h
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSendAbandonedCarts}
                className="w-full bg-gradient-accent"
                disabled={sendingAbandonedCarts}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {sendingAbandonedCarts ? "Enviando..." : "Enviar Emails de Recuperação"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Envia emails automáticos para clientes que abandonaram o carrinho
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Produtos Novos
              </CardTitle>
              <CardDescription>
                Notificar assinantes sobre produtos adicionados nas últimas 24h
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleNotifyNewProducts}
                className="w-full bg-gradient-accent"
                disabled={notifyingProducts}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {notifyingProducts ? "Enviando..." : "Notificar Produtos Novos"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Envia notificações para assinantes sobre produtos recém-adicionados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Campanhas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Histórico de Campanhas
            </CardTitle>
            <CardDescription>
              Campanhas enviadas anteriormente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma campanha enviada ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{campaign.title}</h3>
                      <div className="flex items-center gap-2">
                      <Badge>{campaign.status}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendCampaign(campaign.id)}
                          disabled={resendingCampaign === campaign.id}
                          className="gap-2"
                        >
                          <RefreshCw className={`h-4 w-4 ${resendingCampaign === campaign.id ? 'animate-spin' : ''}`} />
                          {resendingCampaign === campaign.id ? "Reenviando..." : "Reenviar"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          disabled={deletingCampaign === campaign.id}
                          className="gap-2"
                        >
                          <Trash2 className={`h-4 w-4 ${deletingCampaign === campaign.id ? 'animate-pulse' : ''}`} />
                          {deletingCampaign === campaign.id ? "Deletando..." : "Deletar"}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{campaign.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📧 {campaign.subscribers} destinatários</span>
                      <span>📅 {new Date(campaign.sendDate).toLocaleDateString("pt-MZ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Marketing;




