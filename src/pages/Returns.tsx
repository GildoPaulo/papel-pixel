import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Package, FileText, MapPin, Info, HelpCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { useOrders } from "@/contexts/OrdersContext";
import { useReturns } from "@/contexts/ReturnsContext";
import { toast } from "sonner";
import { API_URL } from "@/config/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Returns = () => {
  const { user } = useAuth();
  const { loadUserOrders } = useOrders();
  const { returns, requestReturn, loadReturns } = useReturns();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [reasonType, setReasonType] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserOrders(user.id).then(setOrders);
      loadReturns(user.id);
    }
  }, [user, loadUserOrders, loadReturns]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_URL}/returns/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }
      
      const data = await response.json();
      setUploadingImage(false);
      return data.imageUrl;
    } catch (error: any) {
      setUploadingImage(false);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
      throw error;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande! Máximo 5MB.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleRequestReturn = async () => {
    if (!reason.trim()) {
      toast.error('Digite o motivo da devolução');
      return;
    }
    
    if (!reasonType) {
      toast.error('Selecione o tipo de motivo');
      return;
    }
    
    if (!selectedOrder) return;
    
    setLoading(true);
    
    try {
      let imageUrl: string | undefined;
      
      // Upload da imagem se houver
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }
      
      await requestReturn(selectedOrder.id, user?.id || 0, reason, reasonType, imageUrl);
      toast.success('Solicitação de devolução criada com sucesso!');
      setShowReturnDialog(false);
      setReason("");
      setReasonType("");
      setImageFile(null);
      setImagePreview(null);
      // Recarregar devoluções e pedidos
      if (user?.id) {
        loadReturns(user.id);
        loadUserOrders(user.id).then(setOrders);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao solicitar devolução');
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-500',
      analyzing: 'bg-blue-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
      received: 'bg-purple-500',
      processed: 'bg-blue-600',
      cancelled: 'bg-gray-500'
    };
    
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      analyzing: 'Em Análise',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      received: 'Recebido',
      processed: 'Reembolso Processado',
      cancelled: 'Cancelado'
    };
    
    return (
      <Badge className={colors[status] || 'bg-gray-500'}>
        {labels[status] || status}
      </Badge>
    );
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
          <h1 className="text-3xl font-heading font-bold">Solicitar Devolução</h1>
        </div>

        {/* Info Card - Como funciona */}
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Como Solicitar Devolução?</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/return-policy')}
                      className="ml-4"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Política Completa
                    </Button>
                  </div>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-primary">1.</span>
                      <span>Selecione um pedido abaixo que deseja devolver</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-primary">2.</span>
                      <span>Clique em "Solicitar Devolução" e informe o motivo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-primary">3.</span>
                      <span>Aguarde a análise da solicitação (até 48h)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-primary">4.</span>
                      <span>Após aprovação, receba instruções de envio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-primary">5.</span>
                      <span>Reembolso processado após recebimento do produto</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-4 border-t">
              <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Rastrear Pedido:</p>
                <p>Quer saber onde está seu pedido? Acesse a página de <a href="/tracking" className="text-primary hover:underline font-semibold">Rastreamento</a> ou vá em "Meus Pedidos" no seu perfil.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meus Pedidos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Meus Pedidos</CardTitle>
            <CardDescription>
              Selecione um pedido para solicitar devolução
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                      </TableCell>
                      <TableCell>
                        <Badge>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/tracking/${order.id}`)}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Rastrear
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowReturnDialog(true);
                            }}
                            disabled={order.status === 'cancelled' || order.status === 'delivered'}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Solicitar Devolução
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Minhas Devoluções */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Solicitações de Devolução</CardTitle>
            <CardDescription>
              Status das suas solicitações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {returns.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma solicitação de devolução.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reembolso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returns.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell className="font-medium">#{returnItem.order_id}</TableCell>
                      <TableCell>{returnItem.reason}</TableCell>
                      <TableCell>
                        {new Date(returnItem.requested_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(returnItem.status)}
                      </TableCell>
                      <TableCell>
                        {returnItem.refund_amount 
                          ? returnItem.refund_amount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog de Solicitação */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Devolução</DialogTitle>
            <DialogDescription>
              Pedido #{selectedOrder?.id} - {selectedOrder?.total?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reasonType">Tipo de Motivo *</Label>
              <Select value={reasonType} onValueChange={setReasonType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="produto_errado">Produto Errado</SelectItem>
                  <SelectItem value="defeito">Produto com Defeito</SelectItem>
                  <SelectItem value="diferente_descricao">Diferente da Descrição</SelectItem>
                  <SelectItem value="danificado">Produto Danificado</SelectItem>
                  <SelectItem value="tamanho_errado">Tamanho Errado</SelectItem>
                  <SelectItem value="nao_gostei">Não Gostei</SelectItem>
                  <SelectItem value="mudou_ideia">Mudei de Ideia</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Descrição do Problema *</Label>
              <Textarea
                id="reason"
                placeholder="Descreva detalhadamente o motivo da devolução..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Foto do Produto (Opcional)</Label>
              <div className="space-y-2">
                {!imagePreview ? (
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para fazer upload</span> ou arraste a imagem
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                      </div>
                      <Input
                        id="image"
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                      />
                    </Label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative border-2 border-gray-300 rounded-lg p-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-4 right-4"
                        onClick={handleRemoveImage}
                        disabled={uploadingImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                {uploadingImage && (
                  <p className="text-sm text-muted-foreground">Fazendo upload da imagem...</p>
                )}
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Política de Devolução:</strong><br />
                • Produto deve estar em condições originais<br />
                • Prazo máximo: 7 dias após recebimento<br />
                • Reembolso processado em até 5 dias úteis após recebimento<br />
                • Você receberá instruções de envio após aprovação
              </p>
            </div>
            
            <Button 
              onClick={handleRequestReturn} 
              className="w-full"
              disabled={loading || !reason.trim() || !reasonType || uploadingImage}
            >
              {loading ? 'Enviando...' : uploadingImage ? 'Fazendo Upload...' : 'Solicitar Devolução'}
            </Button>
        </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Returns;
