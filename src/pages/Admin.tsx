import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { useProducts } from "@/contexts/ProductsContextMySQL";
import { useOrders } from "@/contexts/OrdersContext";
import { useUsers } from "@/contexts/UsersContext";
import { useReturns } from "@/contexts/ReturnsContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Percent, 
  Users, 
  ShoppingCart,
  LogOut,
  Shield,
  Video,
  AlertTriangle,
  Search,
  UserCircle,
  Receipt,
  CheckCircle,
  XCircle,
  RotateCcw,
  DollarSign,
  Clock,
  RefreshCw,
  Warehouse,
  TrendingDown,
  TrendingUp,
  History,
  Eye,
  Ban,
  Unlock,
  Mail,
  Gift,
  Star,
  Calendar,
  Filter
} from "lucide-react";
import { ImageUpload, MultipleImageUpload } from "@/components/ImageUpload";
import AbandonedCartsAnalytics from "@/components/admin/AbandonedCartsAnalytics";
import CouponsManagement from "@/components/admin/CouponsManagement";
import { toast } from "sonner";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { 
    products, 
    videos, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addVideo, 
    updateVideo, 
    deleteVideo 
  } = useProducts();
  
  const { orders, loading: ordersLoading, loadOrders, updateOrderStatus, cancelOrder, deleteOrder } = useOrders();
  const { users, loading: usersLoading, loadUsers } = useUsers();
  const { returns, loading: returnsLoading, loadReturns, updateReturnStatus } = useReturns();

  // Returns management state
  const [processingRefund, setProcessingRefund] = useState<number | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedReturnForRefund, setSelectedReturnForRefund] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState("");

  // Stock management state
  const [stockLoading, setStockLoading] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [selectedProductForStock, setSelectedProductForStock] = useState<any>(null);
  const [newStockQuantity, setNewStockQuantity] = useState("");
  const [stockReason, setStockReason] = useState("");
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const handleReturnStatusChange = async (id: number, status: string, refundAmount?: number, notes?: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/returns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, refund_amount: refundAmount, notes })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar devolução');
      }
      
      await loadReturns();
      toast.success('Status da devolução atualizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar devolução');
    }
  };

  const handleMarkAsReceived = async (id: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/returns/${id}/mark-received`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao marcar como recebida');
      }
      
      await loadReturns();
      toast.success('Devolução marcada como recebida!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao marcar como recebida');
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedReturnForRefund) return;
    
    setProcessingRefund(selectedReturnForRefund.id);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const amount = refundAmount ? parseFloat(refundAmount) : undefined;
      
      const response = await fetch(`${API_URL}/returns/${selectedReturnForRefund.id}/process-refund`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ refund_amount: amount })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar reembolso');
      }
      
      const data = await response.json();
      await loadReturns();
      setShowRefundDialog(false);
      setSelectedReturnForRefund(null);
      setRefundAmount("");
      toast.success(`Reembolso de ${Number(data.refundAmount || selectedReturnForRefund.total || 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} processado com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar reembolso');
    } finally {
      setProcessingRefund(null);
    }
  };

  // Payments state
  const [payments, setPayments] = useState<any[]>([]);
  const [pendingReceipts, setPendingReceipts] = useState<any[]>([]);
  const [pendingSimulations, setPendingSimulations] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Load payments
  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const [paymentsRes, receiptsRes, simulationsRes] = await Promise.allSettled([
        fetch(`${API_URL}/payments?limit=100`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/payments/pending-receipts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/payments/pending-simulate`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      // Processar pagamentos
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
        const paymentsData = await paymentsRes.value.json();
        if (paymentsData.success) {
          const allPayments = paymentsData.payments || (paymentsData.count ? paymentsData.payments : []);
          setPayments(Array.isArray(allPayments) ? allPayments : []);
          console.log('📊 [PAYMENTS] Pagamentos carregados:', allPayments.length);
        }
      } else {
        console.error('❌ [PAYMENTS] Erro ao carregar pagamentos:', paymentsRes.status === 'rejected' ? paymentsRes.reason : 'Resposta não OK');
      }
      
      // Processar comprovantes pendentes
      if (receiptsRes.status === 'fulfilled' && receiptsRes.value.ok) {
        const receiptsData = await receiptsRes.value.json();
        if (receiptsData.success) {
          const receipts = receiptsData.payments || (receiptsData.count ? receiptsData.payments : []);
          setPendingReceipts(Array.isArray(receipts) ? receipts : []);
          console.log('📊 [PAYMENTS] Comprovantes pendentes:', receipts.length);
        }
      } else {
        console.error('❌ [PAYMENTS] Erro ao carregar comprovantes:', receiptsRes.status === 'rejected' ? receiptsRes.reason : 'Resposta não OK');
      }
      
      // Processar simulações pendentes
      if (simulationsRes.status === 'fulfilled' && simulationsRes.value.ok) {
        const simulationsData = await simulationsRes.value.json();
        if (simulationsData.success) {
          const simulations = simulationsData.payments || (simulationsData.count ? simulationsData.payments : []);
          setPendingSimulations(Array.isArray(simulations) ? simulations : []);
          console.log('📊 [PAYMENTS] Simulações pendentes:', simulations.length);
        } else {
          console.error('❌ [PAYMENTS] Erro ao carregar simulações:', simulationsData);
        }
      } else {
        console.error('❌ [PAYMENTS] Erro ao carregar simulações:', simulationsRes.status === 'rejected' ? simulationsRes.reason : 'Resposta não OK');
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Simulate payment approval/rejection
  const handleSimulatePayment = async (paymentId: number, action: 'approve' | 'reject') => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/payments/${paymentId}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(action === 'approve' ? 'Pagamento aprovado e pedido confirmado!' : 'Pagamento rejeitado');
        loadPayments();
        loadOrders();
      } else {
        throw new Error(data.error || 'Erro ao simular pagamento');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao simular pagamento');
    }
  };

  // Verify receipt
  const handleVerifyReceipt = async (paymentId: number, verified: boolean, reason?: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/payments/${paymentId}/verify-receipt`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verified, reason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(verified ? 'Comprovante aprovado!' : 'Comprovante rejeitado');
        loadPayments();
        loadOrders(); // Recarregar pedidos também
      } else {
        throw new Error(data.error || 'Erro ao verificar comprovante');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao verificar comprovante');
    }
  };

  // Stock management functions
  const loadLowStockProducts = async () => {
    setStockLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/stock/low`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setLowStockProducts(data.products || []);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos com estoque baixo:', error);
      toast.error('Erro ao carregar estoque baixo');
    } finally {
      setStockLoading(false);
    }
  };

  const loadStockHistory = async (productId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      // Encontrar o produto para mostrar o nome no diálogo
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProductForStock(product);
      }
      
      const response = await fetch(`${API_URL}/stock/history/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setStockHistory(data.history || []);
        setShowHistoryDialog(true);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de estoque:', error);
      toast.error('Erro ao carregar histórico');
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProductForStock || !newStockQuantity) {
      toast.error('Preencha a quantidade');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/stock/${selectedProductForStock.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: parseInt(newStockQuantity),
          reason: stockReason || 'Atualização manual de estoque'
        })
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Sessão expirada. Faça login novamente.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao atualizar estoque');
      }
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Estoque atualizado para ${newStockQuantity} unidades`);
        setShowStockDialog(false);
        setSelectedProductForStock(null);
        setNewStockQuantity("");
        setStockReason("");
        // Recarregar estoque baixo sem recarregar a página
        loadLowStockProducts();
        // Recarregar produtos usando o contexto
        if (products && Array.isArray(products)) {
          // Atualizar o produto específico na lista localmente
          const productIndex = products.findIndex(p => p.id === selectedProductForStock?.id);
          if (productIndex !== -1) {
            const updatedProducts = [...products];
            updatedProducts[productIndex] = { ...updatedProducts[productIndex], stock: parseInt(newStockQuantity) };
            // Não podemos modificar diretamente, mas podemos forçar um re-render atualizando o estado
          }
        }
      } else {
        throw new Error(data.error || 'Erro ao atualizar estoque');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar estoque');
    }
  };

  const openStockDialog = (product: any) => {
    setSelectedProductForStock(product);
    setNewStockQuantity(product.stock.toString());
    setStockReason("");
    setShowStockDialog(true);
  };

  // Client management functions
  const loadClientProfile = async (userId: number) => {
    setClientLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erro ao carregar perfil');
      
      const clientData = await response.json();
      setSelectedClient(clientData);
      setClientOrders(clientData.orders || []);
      setShowClientProfile(true);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar perfil do cliente');
    } finally {
      setClientLoading(false);
    }
  };

  const handleEditClient = (user: any) => {
    setEditingClient({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status || 'active'
    });
    setShowEditClient(true);
  };

  const handleSaveClient = async () => {
    if (!editingClient) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/users/${editingClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingClient.name,
          email: editingClient.email,
          phone: editingClient.phone,
          status: editingClient.status
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        toast.success('Cliente atualizado com sucesso!');
        setShowEditClient(false);
        setEditingClient(null);
        loadUsers();
      } else {
        throw new Error(data.error || 'Erro ao atualizar cliente');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar alterações');
    }
  };

  // Block client dialog state
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [selectedUserToBlock, setSelectedUserToBlock] = useState<{id: number, name: string, isBlocked: boolean} | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const handleBlockClient = async (userId: number, block: boolean) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const body: any = {};
      if (block && blockReason.trim()) {
        body.reason = blockReason.trim();
      }
      
      const response = await fetch(`${API_URL}/users/${userId}/${block ? 'block' : 'unblock'}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        toast.success(`Cliente ${block ? 'bloqueado' : 'desbloqueado'} com sucesso!`);
        loadUsers();
        setShowBlockDialog(false);
        setBlockReason("");
        setSelectedUserToBlock(null);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao bloquear/desbloquear cliente');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar solicitação');
    }
  };

  const handleDeleteClient = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Cliente excluído com sucesso!');
        loadUsers();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir cliente');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir cliente');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPayments();
      loadLowStockProducts();
    }
  }, [isAdmin]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Search queries for each tab
  const [searchPromotions, setSearchPromotions] = useState("");
  const [searchClients, setSearchClients] = useState("");
  const [searchOrders, setSearchOrders] = useState("");
  const [searchPayments, setSearchPayments] = useState("");
  const [searchReturns, setSearchReturns] = useState("");
  const [searchStock, setSearchStock] = useState("");
  const [searchCoupons, setSearchCoupons] = useState("");
  
  // Coupon management state
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [selectedCouponForStats, setSelectedCouponForStats] = useState<any>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [couponStats, setCouponStats] = useState<any>(null);
  
  // New coupon form state
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: 0,
    category: "",
    productId: null,
    expiresAt: "",
    usageLimit: "",
    active: true,
    minPurchase: "",
    description: ""
  });
  
  // Client management state
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  
  // Client filters
  const [clientStatusFilter, setClientStatusFilter] = useState<string>("all");
  const [clientDateFilter, setClientDateFilter] = useState<string>("all");
  
  // Dialog de tracking
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  
  // Form state for adding product
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Papelaria",
    price: "",
    originalPrice: "",
    description: "",
    longDescription: "",
    image: "",
    images: [] as string[],
    stock: "",
    isPromotion: false,
    isFeatured: false,
    // Campos de livros
    isBook: false,
    bookTitle: "",
    bookAuthor: "",
    publisher: "",
    publicationYear: "",
    bookType: "" as "physical" | "digital" | "",
    accessType: "" as "free" | "paid" | "",
    pdfUrl: ""
  });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const handleLogout = () => {
    // Logout is handled by Header
  };

  // Carregar pedidos e clientes quando o componente monta (só uma vez)
  useEffect(() => {
    loadOrders();
    loadUsers();
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio = executa só uma vez

  // Funções para pedidos
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

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      processing: 'bg-purple-500',
      shipped: 'bg-green-500',
      delivered: 'bg-green-600',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      // Se mudou para "shipped", gerar código automaticamente
      if (status === 'shipped') {
        const order = orders.find(o => o.id === orderId);
        // Se já tem tracking_code, perguntar se quer atualizar
        if (order?.tracking_code) {
          if (confirm('Este pedido já tem código de rastreamento. Deseja atualizar?')) {
            setSelectedOrderId(orderId);
            setTrackingCode(order.tracking_code || "");
            setTrackingUrl(order.tracking_url || "");
            setShowTrackingDialog(true);
            return; // Não atualizar ainda, aguardar Dialog
          }
        }
        // Se não tem código, o backend vai gerar automaticamente
      }
      
      await updateOrderStatus(orderId, status);
      toast.success('Status atualizado com sucesso!');
      loadOrders(); // Recarregar pedidos
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrderId) return;
    
    if (!trackingCode.trim()) {
      toast.error('Por favor, informe o código de rastreamento');
      return;
    }
    
    try {
      await updateOrderStatus(selectedOrderId, 'shipped', undefined, trackingCode.trim(), trackingUrl.trim() || undefined);
      toast.success('Pedido marcado como enviado com código de rastreamento!');
      setShowTrackingDialog(false);
      setSelectedOrderId(null);
      setTrackingCode("");
      setTrackingUrl("");
      loadOrders(); // Recarregar pedidos
    } catch (error) {
      toast.error('Erro ao salvar código de rastreamento');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\nTem certeza que deseja DELETAR PERMANENTEMENTE este pedido?\n\nEsta ação não pode ser desfeita e todos os dados relacionados serão perdidos.')) {
      return;
    }
    
    try {
      await deleteOrder(orderId);
      toast.success('Pedido deletado permanentemente!');
      loadOrders(); // Recarregar lista
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar pedido');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
      try {
        await cancelOrder(orderId);
        alert('Pedido cancelado com sucesso!');
      } catch (error) {
        alert('Erro ao cancelar pedido');
      }
    }
  };

  const handlePdfUpload = async (file: File) => {
    setUploadingPdf(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setNewProduct({...newProduct, pdfUrl: data.pdfUrl});
        toast.success('PDF enviado com sucesso!');
        return data.pdfUrl;
      } else {
        toast.error('Erro ao enviar PDF');
        return null;
      }
    } catch (error) {
      toast.error('Erro ao enviar PDF');
      return null;
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const isFreeDigitalBook = newProduct.category === "Livros" && 
                               newProduct.bookType === "digital" && 
                               newProduct.accessType === "free";
    
    if (!newProduct.name) {
      toast.error('Preencha o nome!');
      return;
    }
    
    // Preço é obrigatório exceto para livros digitais gratuitos
    if (!isFreeDigitalBook && !newProduct.price) {
      toast.error('Preencha o preço!');
      return;
    }

    // Validação para livros
    if (newProduct.category === "Livros") {
      if (!newProduct.bookTitle || !newProduct.bookAuthor) {
        toast.error('Para livros, preencha Título e Autor!');
        return;
      }
      if (newProduct.bookType === "digital" && !newProduct.accessType) {
        toast.error('Para livros digitais, selecione Acesso: Grátis ou Pago!');
        return;
      }
      if (newProduct.bookType === "digital" && newProduct.accessType === "paid" && !newProduct.pdfUrl) {
        toast.error('Para livros digitais pagos, faça upload do PDF!');
        return;
      }
    }
    
    // Criar objeto de produto (SEM id ao criar novo)
    // Para imagens, usar newProduct.image (pode ser URL ou vazio)
    // Se estiver editando e não tiver nova imagem, preservar a existente
    let imageUrl = newProduct.image || '';
    
    if (editingProduct && !imageUrl) {
      // Se está editando e não tem imagem nova, buscar a imagem atual do produto
      const currentProduct = products.find(p => p.id === editingProduct);
      if (currentProduct && currentProduct.image) {
        imageUrl = currentProduct.image;
        console.log('📝 [ADMIN] Preservando imagem existente ao editar');
      }
    }
    
    console.log('💾 [ADMIN] Salvando produto:', {
      name: newProduct.name,
      editingProduct: editingProduct,
      hasImage: !!imageUrl,
      imageLength: imageUrl ? imageUrl.length : 0,
      imagePreview: imageUrl ? (imageUrl.length > 100 ? imageUrl.substring(0, 100) + '...' : imageUrl) : 'SEM IMAGEM',
      bookType: newProduct.bookType,
      category: newProduct.category
    });
    
    const productData: any = {
      name: newProduct.name,
      category: newProduct.category,
      price: isFreeDigitalBook ? 0 : parseFloat(newProduct.price || "0"),
      originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : undefined,
      description: newProduct.description,
      image: imageUrl, // Sempre enviar (URL ou string vazia)
      stock: parseInt(newProduct.stock || "0"),
      isPromotion: newProduct.isPromotion,
      isFeatured: newProduct.isFeatured
    };

    // Se for livro, adicionar campos extras
    if (newProduct.category === "Livros") {
      productData.isBook = true;
      productData.bookTitle = newProduct.bookTitle;
      productData.bookAuthor = newProduct.bookAuthor;
      productData.publisher = newProduct.publisher || undefined;
      productData.publicationYear = newProduct.publicationYear ? parseInt(newProduct.publicationYear) : undefined;
      productData.bookType = newProduct.bookType || undefined;
      productData.accessType = newProduct.accessType || undefined;
      productData.pdfUrl = newProduct.pdfUrl || undefined;
    } else {
      productData.isBook = false;
    }
    
    console.log('📦 [ADMIN] Dados enviados:', productData);

    try {
      if (editingProduct) {
        console.log('📝 [ADMIN] Atualizando produto:', editingProduct);
        // Ao editar, NÃO passar id no body, apenas no parâmetro da URL
        await updateProduct(editingProduct, productData);
        toast.success('Produto atualizado com sucesso!');
        setEditingProduct(null);
      } else {
        console.log('➕ [ADMIN] Adicionando novo produto');
        await addProduct(productData);
        toast.success('Produto adicionado com sucesso!');
      }
      
      setShowAddProduct(false);
      setNewProduct({
        name: "",
        category: "Papelaria",
        price: "",
        originalPrice: "",
        description: "",
        longDescription: "",
        image: "",
        images: [],
        stock: "",
        isPromotion: false,
        isFeatured: false,
        isBook: false,
        bookTitle: "",
        bookAuthor: "",
        publisher: "",
        publicationYear: "",
        bookType: "",
        accessType: "",
        pdfUrl: ""
      });
    } catch (error: any) {
      console.error('❌ [ADMIN] Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto: ' + (error.message || 'Erro desconhecido'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie produtos, promoções e pedidos
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              {products.filter(p => p.stock < 10).length > 0 && (
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {products.filter(p => p.stock < 10).length} com estoque baixo
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Promoção</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter(p => p.isPromotion).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              {orders.filter(o => o.status === 'pending').length > 0 && (
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  {orders.filter(o => o.status === 'pending').length} pendentes
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vídeos Ativos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.filter(v => v.active).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="promotions">
              <Percent className="h-4 w-4 mr-2" />
              Promoções
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="users">
              <UserCircle className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="returns">
              <Package className="h-4 w-4 mr-2" />
              Devoluções
            </TabsTrigger>
            <TabsTrigger value="payments">
              <Receipt className="h-4 w-4 mr-2" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="stock">
              <Warehouse className="h-4 w-4 mr-2" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="coupons">
              <Percent className="h-4 w-4 mr-2" />
              Cupons
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>
                    Gerencie todos os produtos da loja
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddProduct(true)} className="bg-gradient-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produto por nome, categoria..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtered Products Count */}
                {(() => {
                  const filteredProducts = products.filter(p => 
                    searchQuery === "" || 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                  
                  return (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground">
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                      </p>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Estoque</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell><Badge>{product.category}</Badge></TableCell>
                        <TableCell>
                          {product.originalPrice ? (
                            <>
                              <span className="line-through text-muted-foreground mr-2">
                                {product.originalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                              </span>
                              <span className="font-bold text-primary">
                                {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                              </span>
                            </>
                          ) : (
                            <span>{product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                          )}
                        </TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                            {product.stock > 0 ? "Em Estoque" : "Esgotado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="mr-2"
                            onClick={() => {
                              setEditingProduct(product.id);
                              setNewProduct({
                                name: product.name,
                                category: product.category,
                                price: product.price.toString(),
                                originalPrice: product.originalPrice?.toString() || "",
                                description: product.description || "",
                                longDescription: "",
                                image: product.image || "",
                                images: (product as any).images || [],
                                stock: product.stock.toString(),
                                isPromotion: product.isPromotion || false,
                                isFeatured: product.isFeatured || false,
                                isBook: (product as any).isBook || false,
                                bookTitle: (product as any).book_title || "",
                                bookAuthor: (product as any).book_author || "",
                                publisher: (product as any).publisher || "",
                                publicationYear: (product as any).publication_year?.toString() || "",
                                bookType: (product as any).book_type || "",
                                accessType: (product as any).access_type || "",
                                pdfUrl: (product as any).pdf_url || ""
                              });
                              setShowAddProduct(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={async () => {
                              if (window.confirm("Tem certeza que deseja remover este produto?")) {
                                try {
                                  console.log('🗑️ [ADMIN] Deletando produto:', product.id);
                                  await deleteProduct(product.id);
                                  toast.success('Produto removido com sucesso!');
                                } catch (error: any) {
                                  console.error('❌ [ADMIN] Erro ao deletar:', error);
                                  toast.error('Erro ao remover produto: ' + (error.message || 'Erro desconhecido'));
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Promoções Ativas</CardTitle>
                  <CardDescription>
                    Gerencie as promoções e descontos dos produtos
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500">
                    {products.filter(p => p.isPromotion).length} em promoção
                  </Badge>
                  <Button onClick={() => setShowAddProduct(true)} className="bg-gradient-accent">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Promoção
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar for Promotions */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Buscar promoção por nome, categoria..."
                    value={searchPromotions}
                    onChange={(e) => setSearchPromotions(e.target.value)}
                  />
                </div>
                
                {products.filter(p => p.isPromotion).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Nenhuma promoção ativa no momento</p>
                    <Button onClick={() => setShowAddProduct(true)} className="bg-gradient-accent">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Promoção
                    </Button>
                  </div>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Preço Original</TableHead>
                      <TableHead>Preço com Desconto</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.filter(p => 
                      p.isPromotion && 
                      (searchPromotions === "" || 
                       p.name.toLowerCase().includes(searchPromotions.toLowerCase()) ||
                       p.category.toLowerCase().includes(searchPromotions.toLowerCase()))
                    ).map((product) => {
                      const discount = product.originalPrice 
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : 0;
                      
                      return (
                        <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">-{discount}%</Badge>
                        </TableCell>
                        <TableCell>
                          {product.originalPrice?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="mr-2"
                            onClick={() => {
                              setEditingProduct(product.id);
                              setNewProduct({
                                name: product.name,
                                category: product.category,
                                price: product.price.toString(),
                                originalPrice: product.originalPrice?.toString() || "",
                                description: product.description || "",
                                longDescription: "",
                                image: product.image || "",
                                images: (product as any).images || [],
                                stock: product.stock.toString(),
                                isPromotion: product.isPromotion || false,
                                isFeatured: product.isFeatured || false,
                                isBook: (product as any).isBook || false,
                                bookTitle: (product as any).book_title || "",
                                bookAuthor: (product as any).book_author || "",
                                publisher: (product as any).publisher || "",
                                publicationYear: (product as any).publication_year?.toString() || "",
                                bookType: (product as any).book_type || "",
                                accessType: (product as any).access_type || "",
                                pdfUrl: (product as any).pdf_url || ""
                              });
                              setShowAddProduct(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja remover a promoção de "${product.name}"?`)) {
                                const updatedProduct = {
                                  ...product,
                                  isPromotion: false,
                                  price: product.originalPrice || product.price
                                };
                                updateProduct(product.id, updatedProduct);
                                alert('Promoção removida!');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Vídeos de Publicidade</CardTitle>
                  <CardDescription>
                    Gerencie os vídeos promocionais exibidos na loja
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddVideo(true)} className="bg-gradient-accent">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Vídeo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videos.map((video) => (
                    <Card key={video.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
                            <div className="flex gap-2 mb-3">
                              <Badge>{video.type}</Badge>
                              <Badge variant={video.active ? "default" : "secondary"}>
                                {video.active ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground break-all">{video.url}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteVideo(video.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {videos.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum vídeo cadastrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pedidos</CardTitle>
                  <CardDescription>
                    Visualize e gerencie os pedidos dos clientes
                  </CardDescription>
                </div>
                <Badge className="bg-green-500">
                  {orders.length} pedido{orders.length !== 1 ? 's' : ''}
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Search Bar for Orders */}
                {!ordersLoading && orders.length > 0 && (
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Buscar pedido por ID, cliente, status..."
                      value={searchOrders}
                      onChange={(e) => setSearchOrders(e.target.value)}
                    />
                  </div>
                )}
                
                {ordersLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.filter(order => 
                      searchOrders === "" ||
                      order.id.toString().includes(searchOrders) ||
                      order.customer_name?.toLowerCase().includes(searchOrders.toLowerCase()) ||
                      order.customer_email?.toLowerCase().includes(searchOrders.toLowerCase()) ||
                      order.status?.toLowerCase().includes(searchOrders.toLowerCase())
                    ).map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.customer_name || 'Cliente'} - {order.customer_email}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusBadgeColor(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                              <p className="text-xl font-bold text-primary mt-2">
                                {order.total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                              </p>
                            </div>
                          </div>

                          {/* Items do pedido */}
                          {order.items && order.items.length > 0 && (
                            <div className="border-t pt-4 mb-4">
                              <h4 className="font-semibold mb-2">Itens:</h4>
                              <div className="space-y-2">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.product_name}</span>
                                    <span className="font-medium">
                                      {(item.subtotal).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Endereço e informações */}
                          <div className="border-t pt-4 mb-4">
                            <h4 className="font-semibold mb-2">Endereço de Entrega:</h4>
                            <p className="text-sm text-muted-foreground">
                              {order.shipping_address || 'Não informado'}
                              {order.shipping_city && `, ${order.shipping_city}`}
                              {order.shipping_province && `, ${order.shipping_province}`}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Método de Pagamento: <strong>{order.payment_method || 'N/A'}</strong>
                            </p>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-2 flex-wrap">
                            <Select value={order.status} onValueChange={(status) => handleStatusChange(order.id, status)}>
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                <SelectItem value="processing">Em Processamento</SelectItem>
                                <SelectItem value="shipped">Enviado</SelectItem>
                                <SelectItem value="delivered">Entregue</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                            {order.status === 'pending' && (
                              <Button 
                                onClick={() => handleStatusChange(order.id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                ✓ Aprovar Pedido
                              </Button>
                            )}
                            {order.tracking_code && (
                              <Badge variant="outline" className="text-xs">
                                📦 {order.tracking_code}
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/tracking/${order.id}`)}
                            >
                              📦 Rastrear
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                                window.open(`${API_URL}/receipt/${order.id}`, '_blank');
                              }}
                            >
                              <Receipt className="h-4 w-4 mr-2" />
                              Ver Recibo
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={order.status === 'cancelled'}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Deletar Permanentemente
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Clientes Cadastrados</CardTitle>
                  <CardDescription>
                    Gerencie os clientes da loja
                  </CardDescription>
                </div>
                <Badge className="bg-blue-500">
                  {users.length} cliente{users.length !== 1 ? 's' : ''}
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Search Bar for Clients */}
                {!usersLoading && users.length > 0 && (
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Buscar cliente por nome, email, telefone..."
                      value={searchClients}
                      onChange={(e) => setSearchClients(e.target.value)}
                    />
                  </div>
                )}
                
                {usersLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando clientes...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum cliente encontrado</p>
                    <p className="text-sm mt-2">Clientes aparecerão aqui após registro ou primeiro pedido</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Status:</Label>
                        <Select value={clientStatusFilter} onValueChange={setClientStatusFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="blocked">Bloqueado</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Período:</Label>
                        <Select value={clientDateFilter} onValueChange={setClientDateFilter}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="today">Hoje</SelectItem>
                            <SelectItem value="week">Esta Semana</SelectItem>
                            <SelectItem value="month">Este Mês</SelectItem>
                            <SelectItem value="year">Este Ano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Total Gasto</TableHead>
                          <TableHead>Pedidos</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data Registro</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.filter(user => {
                          // Search filter
                          const matchesSearch = searchClients === "" ||
                            user.name?.toLowerCase().includes(searchClients.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchClients.toLowerCase()) ||
                            user.phone?.toLowerCase().includes(searchClients.toLowerCase());
                          
                          // Status filter
                          const matchesStatus = clientStatusFilter === "all" ||
                            (clientStatusFilter === "active" && (!user.status || user.status === 'active')) ||
                            (clientStatusFilter === "blocked" && user.status === 'blocked') ||
                            (clientStatusFilter === "inactive" && user.status === 'inactive');
                          
                          // Date filter
                          let matchesDate = true;
                          if (clientDateFilter !== "all" && user.created_at) {
                            const userDate = new Date(user.created_at);
                            const now = new Date();
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                            
                            switch (clientDateFilter) {
                              case "today":
                                matchesDate = userDate >= today;
                                break;
                              case "week":
                                const weekAgo = new Date(today);
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                matchesDate = userDate >= weekAgo;
                                break;
                              case "month":
                                const monthAgo = new Date(today);
                                monthAgo.setMonth(monthAgo.getMonth() - 1);
                                matchesDate = userDate >= monthAgo;
                                break;
                              case "year":
                                const yearAgo = new Date(today);
                                yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                                matchesDate = userDate >= yearAgo;
                                break;
                            }
                          }
                          
                          return matchesSearch && matchesStatus && matchesDate;
                        }).map((user) => {
                          const isBlocked = user.status === 'blocked';
                          const isActive = !user.status || user.status === 'active';
                          const loyaltyLevel = user.totalSpent 
                            ? user.totalSpent >= 10000 ? 'Ouro' 
                              : user.totalSpent >= 5000 ? 'Prata' 
                              : user.totalSpent >= 1000 ? 'Bronze' 
                              : 'Normal'
                            : 'Normal';
                          
                          return (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">#{user.id}</TableCell>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.phone || '-'}</TableCell>
                              <TableCell>
                                <Badge className={
                                  loyaltyLevel === 'Ouro' ? 'bg-yellow-500' :
                                  loyaltyLevel === 'Prata' ? 'bg-gray-400' :
                                  loyaltyLevel === 'Bronze' ? 'bg-orange-600' :
                                  'bg-blue-500'
                                }>
                                  <Star className="h-3 w-3 mr-1 inline" />
                                  {loyaltyLevel}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold">
                                {user.totalSpent 
                                  ? user.totalSpent.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
                                  : '0 MZN'}
                              </TableCell>
                              <TableCell>
                                <Badge>{user.totalOrders || 0} pedidos</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  isBlocked ? 'bg-red-500' :
                                  isActive ? 'bg-green-500' :
                                  'bg-gray-500'
                                }>
                                  {isBlocked ? 'Bloqueado' : isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(user.created_at).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => loadClientProfile(user.id)}
                                    title="Ver Perfil Completo"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditClient(user)}
                                    title="Editar Cliente"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedUserToBlock({id: user.id, name: user.name, isBlocked: isBlocked});
                                      setShowBlockDialog(true);
                                    }}
                                    title={isBlocked ? "Desbloquear" : "Bloquear"}
                                    className={isBlocked ? "text-green-600" : "text-red-600"}
                                  >
                                    {isBlocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteClient(user.id)}
                                    title="Excluir Cliente"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns Tab */}
          <TabsContent value="returns" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Devoluções</CardTitle>
                  <CardDescription>
                    Analise, aprove ou recuse solicitações de devolução e processe reembolsos
                  </CardDescription>
                </div>
                <Badge className="bg-orange-500">
                  {returns.filter((r: any) => r.status === 'pending' || r.status === 'analyzing').length} pendente{returns.filter((r: any) => r.status === 'pending' || r.status === 'analyzing').length !== 1 ? 's' : ''}
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Search Bar for Returns */}
                {!returnsLoading && returns.length > 0 && (
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Buscar devolução por ID, pedido, cliente, status..."
                      value={searchReturns}
                      onChange={(e) => setSearchReturns(e.target.value)}
                    />
                  </div>
                )}
                
                {returnsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando devoluções...</p>
                  </div>
                ) : returns.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma solicitação de devolução</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {returns.filter((returnItem: any) => 
                      searchReturns === "" ||
                      returnItem.id.toString().includes(searchReturns) ||
                      returnItem.order_id.toString().includes(searchReturns) ||
                      returnItem.customer_name?.toLowerCase().includes(searchReturns.toLowerCase()) ||
                      returnItem.customer_email?.toLowerCase().includes(searchReturns.toLowerCase()) ||
                      returnItem.status?.toLowerCase().includes(searchReturns.toLowerCase()) ||
                      returnItem.reason_type?.toLowerCase().includes(searchReturns.toLowerCase())
                    ).map((returnItem: any) => {
                      const canApprove = returnItem.status === 'pending' || returnItem.status === 'analyzing';
                      const canReject = returnItem.status === 'pending' || returnItem.status === 'analyzing';
                      const canMarkReceived = returnItem.status === 'approved';
                      const canProcessRefund = returnItem.status === 'received';
                      
                      return (
                        <Card key={returnItem.id} className={returnItem.status === 'pending' || returnItem.status === 'analyzing' ? 'border-yellow-300' : ''}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-lg">Devolução #{returnItem.id}</h3>
                                  <Badge className={getStatusBadgeColor(returnItem.status)}>
                                    {returnItem.status === 'pending' ? 'Pendente' :
                                     returnItem.status === 'analyzing' ? 'Em Análise' :
                                     returnItem.status === 'approved' ? 'Aprovado' :
                                     returnItem.status === 'rejected' ? 'Rejeitado' :
                                     returnItem.status === 'received' ? 'Recebido' :
                                     returnItem.status === 'processed' ? 'Reembolso Processado' :
                                     returnItem.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                  <p><strong>Pedido:</strong> #{returnItem.order_id}</p>
                                  <p><strong>Cliente:</strong> {returnItem.customer_name || 'N/A'}</p>
                                  <p><strong>Email:</strong> {returnItem.customer_email || 'N/A'}</p>
                                  <p><strong>Data:</strong> {new Date(returnItem.requested_at).toLocaleString('pt-BR')}</p>
                                  {returnItem.total && (
                                    <p><strong>Total do Pedido:</strong> {Number(returnItem.total).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                                  )}
                                  {returnItem.reason_type && (
                                    <p><strong>Tipo de Motivo:</strong> {
                                      returnItem.reason_type === 'produto_errado' ? 'Produto Errado' :
                                      returnItem.reason_type === 'defeito' ? 'Produto com Defeito' :
                                      returnItem.reason_type === 'diferente_descricao' ? 'Diferente da Descrição' :
                                      returnItem.reason_type === 'danificado' ? 'Produto Danificado' :
                                      returnItem.reason_type === 'tamanho_errado' ? 'Tamanho Errado' :
                                      returnItem.reason_type === 'nao_gostei' ? 'Não Gostei' :
                                      returnItem.reason_type === 'mudou_ideia' ? 'Mudei de Ideia' :
                                      returnItem.reason_type === 'outro' ? 'Outro' :
                                      returnItem.reason_type
                                    }</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold mb-2">Motivo da Devolução:</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{returnItem.reason}</p>
                            </div>

                            {returnItem.image_url && (
                              <div className="mb-4">
                                <h4 className="font-semibold mb-2">Foto do Produto:</h4>
                                <div className="relative inline-block">
                                  <a 
                                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${returnItem.image_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img 
                                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${returnItem.image_url}`}
                                      alt="Foto do produto devolvido"
                                      className="max-w-xs max-h-48 rounded-lg border-2 border-gray-200 hover:border-primary transition"
                                    />
                                  </a>
                                </div>
                              </div>
                            )}

                            {returnItem.refund_amount && (
                              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm">
                                  <strong className="text-green-700">Valor do Reembolso:</strong> {' '}
                                  <span className="text-green-700 font-bold">
                                    {Number(returnItem.refund_amount).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                  </span>
                                </p>
                                {returnItem.refund_processed_at && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Processado em: {new Date(returnItem.refund_processed_at).toLocaleString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            )}

                            {returnItem.notes && (
                              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm"><strong>Observações:</strong></p>
                                <p className="text-sm text-muted-foreground">{returnItem.notes}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 mt-4">
                              {canApprove && (
                                <Button
                                  onClick={() => {
                                    if (confirm('Deseja aprovar esta devolução? O cliente receberá instruções de envio por email.')) {
                                      handleReturnStatusChange(returnItem.id, 'approved', undefined, 'Devolução aprovada pelo administrador.');
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar
                                </Button>
                              )}
                              {canReject && (
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    const reason = prompt('Motivo da rejeição (será enviado ao cliente):');
                                    if (reason) {
                                      handleReturnStatusChange(returnItem.id, 'rejected', undefined, reason);
                                    }
                                  }}
                                  size="sm"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Recusar
                                </Button>
                              )}
                              {!canApprove && !canReject && returnItem.status === 'pending' && (
                                <Button
                                  onClick={() => handleReturnStatusChange(returnItem.id, 'analyzing', undefined, 'Devolução em análise.')}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Marcar como Em Análise
                                </Button>
                              )}
                              {canMarkReceived && (
                                <Button
                                  onClick={() => {
                                    if (confirm('Confirmar recebimento do produto? O cliente será notificado e o reembolso poderá ser processado.')) {
                                      handleMarkAsReceived(returnItem.id);
                                    }
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700"
                                  size="sm"
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Marcar como Recebido
                                </Button>
                              )}
                              {canProcessRefund && (
                                <Button
                                  onClick={() => {
                                    setSelectedReturnForRefund(returnItem);
                                    setRefundAmount(returnItem.total?.toString() || '');
                                    setShowRefundDialog(true);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                  size="sm"
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Processar Reembolso
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pagamentos</CardTitle>
                  <CardDescription>
                    Gerencie pagamentos e comprovantes de transferência bancária
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500">
                    {pendingSimulations.length} simulação{pendingSimulations.length !== 1 ? 'ões' : ''} pendente{pendingSimulations.length !== 1 ? 's' : ''}
                  </Badge>
                  <Badge className="bg-yellow-500">
                    {pendingReceipts.length} comprovante{pendingReceipts.length !== 1 ? 's' : ''} pendente{pendingReceipts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar for Payments */}
                {!paymentsLoading && (payments.length > 0 || pendingReceipts.length > 0 || pendingSimulations.length > 0) && (
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Buscar pagamento por ID, cliente, método, status..."
                      value={searchPayments}
                      onChange={(e) => setSearchPayments(e.target.value)}
                    />
                  </div>
                )}
                
                {paymentsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando pagamentos...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Pending Payment Simulations Section */}
                    {pendingSimulations && pendingSimulations.filter(payment => 
                      searchPayments === "" ||
                      payment.id.toString().includes(searchPayments) ||
                      payment.order_id_ref?.toString().includes(searchPayments) ||
                      payment.user_name?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                      payment.user_email?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                      payment.payment_method?.toLowerCase().includes(searchPayments.toLowerCase())
                    ).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          💳 Pagamentos Pendentes de Simulação (M-Pesa, eMola, Mkesh, Cartão, PayPal)
                        </h3>
                        <div className="space-y-4">
                          {pendingSimulations.filter(payment => 
                            searchPayments === "" ||
                            payment.id.toString().includes(searchPayments) ||
                            payment.order_id_ref?.toString().includes(searchPayments) ||
                            payment.user_name?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                            payment.user_email?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                            payment.payment_method?.toLowerCase().includes(searchPayments.toLowerCase())
                          ).map((payment) => (
                            <Card key={payment.id} className="border-blue-200 bg-blue-50">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-lg">Pagamento #{payment.id}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Pedido: #{payment.order_id_ref}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Cliente: {payment.user_name || 'N/A'} - {payment.user_email || 'N/A'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Produtos: {payment.products_names || 'N/A'}
                                    </p>
                                    <p className="text-sm font-semibold text-primary">
                                      Valor: {Number(payment.amount).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Método: <Badge variant="outline">
                                        {payment.payment_method === 'mpesa' ? 'M-Pesa' :
                                         payment.payment_method === 'emola' ? 'eMola' :
                                         payment.payment_method === 'mkesh' ? 'Mkesh' :
                                         payment.payment_method === 'card' ? 'Cartão' :
                                         payment.payment_method === 'paypal' ? 'PayPal' :
                                         payment.payment_method?.toUpperCase() || 'N/A'}
                                      </Badge>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Criado em: {new Date(payment.created_at).toLocaleString('pt-BR')}
                                    </p>
                                  </div>
                                  <Badge className="bg-blue-500">
                                    Aguardando Simulação
                                  </Badge>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleSimulatePayment(payment.id, 'approve')}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                  >
                                    ✓ Aprovar Pagamento
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      if (confirm('Tem certeza que deseja rejeitar este pagamento?')) {
                                        handleSimulatePayment(payment.id, 'reject');
                                      }
                                    }}
                                    size="sm"
                                  >
                                    ✗ Rejeitar Pagamento
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Pending Receipts Section */}
                    {pendingReceipts.filter(payment => 
                      searchPayments === "" ||
                      payment.id.toString().includes(searchPayments) ||
                      payment.order_id_ref?.toString().includes(searchPayments) ||
                      payment.user_name?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                      payment.user_email?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                      payment.payment_method?.toLowerCase().includes(searchPayments.toLowerCase())
                    ).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-yellow-700">
                          ⚠️ Comprovantes Pendentes de Verificação
                        </h3>
                        <div className="space-y-4">
                          {pendingReceipts.filter(payment => 
                            searchPayments === "" ||
                            payment.id.toString().includes(searchPayments) ||
                            payment.order_id_ref?.toString().includes(searchPayments) ||
                            payment.user_name?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                            payment.user_email?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                            payment.payment_method?.toLowerCase().includes(searchPayments.toLowerCase())
                          ).map((payment) => (
                            <Card key={payment.id} className="border-yellow-200">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="font-semibold text-lg">Pagamento #{payment.id}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Pedido: #{payment.order_id_ref}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Cliente: {payment.user_name || 'N/A'} - {payment.user_email || 'N/A'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Valor: {Number(payment.amount).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Enviado em: {payment.receipt_uploaded_at ? new Date(payment.receipt_uploaded_at).toLocaleString('pt-BR') : 'N/A'}
                                    </p>
                                  </div>
                                  <Badge className="bg-yellow-500">
                                    Aguardando Verificação
                                  </Badge>
                                </div>
                                
                                {payment.receipt_url && (
                                  <div className="mb-4">
                                    <Label className="mb-2 block">Comprovante:</Label>
                                    <a 
                                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${payment.receipt_url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline flex items-center gap-2"
                                    >
                                      <Receipt className="h-4 w-4" />
                                      Ver Comprovante
                                    </a>
                                  </div>
                                )}
                                
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleVerifyReceipt(payment.id, true)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    ✓ Aprovar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      const reason = prompt('Motivo da rejeição:');
                                      if (reason) handleVerifyReceipt(payment.id, false, reason);
                                    }}
                                  >
                                    ✗ Rejeitar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* All Payments */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Todos os Pagamentos</h3>
                      {payments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum pagamento encontrado</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID do Pedido</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Produto</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Método de Pagamento</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.filter(payment => 
                              searchPayments === "" ||
                              payment.id.toString().includes(searchPayments) ||
                              payment.order_id_ref?.toString().includes(searchPayments) ||
                              payment.order_id?.toString().includes(searchPayments) ||
                              payment.user_name?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                              payment.user_email?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                              payment.payment_method?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                              payment.status?.toLowerCase().includes(searchPayments.toLowerCase()) ||
                              payment.products_names?.toLowerCase().includes(searchPayments.toLowerCase())
                            ).map((payment) => {
                              // Determinar tipo de produto
                              const productTypes = payment.products_types ? payment.products_types.split('||') : [];
                              const hasDigital = productTypes.some((type: string) => {
                                const [isBook, bookType] = type.split('|');
                                return isBook === '1' || isBook === 1 || bookType === 'digital';
                              });
                              const productType = hasDigital ? 'Digital' : 'Físico';
                              
                              return (
                                <TableRow key={payment.id}>
                                  <TableCell className="font-medium">#{payment.order_id_ref || payment.order_id}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{payment.user_name || 'N/A'}</div>
                                      <div className="text-sm text-muted-foreground">{payment.user_email || 'N/A'}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="max-w-xs truncate" title={payment.products_names || 'N/A'}>
                                      {payment.products_names || 'N/A'}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{productType}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {payment.payment_method === 'bank_transfer' ? 'Transferência Bancária' :
                                       payment.payment_method === 'cash_on_delivery' ? 'Dinheiro na Entrega' :
                                       payment.payment_method === 'mpesa' ? 'M-Pesa' :
                                       payment.payment_method === 'riha' ? 'RIHA' :
                                       payment.payment_method === 'paypal' ? 'PayPal' :
                                       payment.payment_method === 'card' ? 'Cartão' :
                                       payment.payment_method?.toUpperCase() || 'N/A'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={
                                      payment.status === 'paid' || payment.status === 'completed' ? 'bg-green-500' :
                                      payment.status === 'pending' || payment.status === 'processing' ? 'bg-yellow-500' :
                                      payment.status === 'failed' || payment.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                                    }>
                                      {payment.status === 'paid' || payment.status === 'completed' ? 'Aprovado' :
                                       payment.status === 'pending' ? 'Pendente' :
                                       payment.status === 'processing' ? 'Processando' :
                                       payment.status === 'failed' ? 'Recusado' :
                                       payment.status === 'cancelled' ? 'Cancelado' : payment.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(payment.created_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                                          window.open(`${API_URL}/receipt/${payment.order_id_ref || payment.order_id}`, '_blank');
                                        }}
                                        title="Ver Detalhes / Recibo"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      {(payment.status === 'pending' || payment.status === 'processing') && (
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => {
                                            // Se for de simulação, usar handleSimulatePayment
                                            if (payment.payment_method && ['mpesa', 'emola', 'mkesh', 'card', 'paypal'].includes(payment.payment_method)) {
                                              handleSimulatePayment(payment.id, 'approve');
                                            } else {
                                              handleVerifyReceipt(payment.id, true);
                                            }
                                          }}
                                          title="Confirmar Pagamento"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                          try {
                                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                                            const token = localStorage.getItem('token');
                                            
                                            // Aqui você pode implementar o reenvio de recibo
                                            toast.success('Recibo reenviado por email com sucesso!');
                                          } catch (error: any) {
                                            toast.error('Erro ao reenviar recibo');
                                          }
                                        }}
                                        title="Reenviar Recibo"
                                      >
                                        <Mail className="h-4 w-4" />
                                      </Button>
                                      {(payment.status === 'paid' || payment.status === 'completed') && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-orange-600"
                                          onClick={() => {
                                            // Aqui você pode implementar o reembolso
                                            if (confirm('Tem certeza que deseja processar o reembolso deste pagamento?')) {
                                              toast.info('Funcionalidade de reembolso será implementada em breve');
                                            }
                                          }}
                                          title="Processar Reembolso"
                                        >
                                          <DollarSign className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Management Tab */}
          <TabsContent value="stock" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestão de Estoque</CardTitle>
                  <CardDescription>
                    Visualize e gerencie o estoque de todos os produtos
                  </CardDescription>
                </div>
                <Badge className={lowStockProducts.length > 0 ? "bg-orange-500" : "bg-green-500"}>
                  {lowStockProducts.length} produto{lowStockProducts.length !== 1 ? 's' : ''} com estoque baixo
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Search Bar for Stock */}
                {!stockLoading && (products.length > 0 || lowStockProducts.length > 0) && (
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Buscar produto por nome, categoria..."
                      value={searchStock}
                      onChange={(e) => setSearchStock(e.target.value)}
                    />
                  </div>
                )}
                
                {stockLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Carregando estoque...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Low Stock Alert */}
                    {lowStockProducts.filter(product => 
                      searchStock === "" ||
                      product.name?.toLowerCase().includes(searchStock.toLowerCase()) ||
                      product.category?.toLowerCase().includes(searchStock.toLowerCase())
                    ).length > 0 && (
                      <Card className="border-orange-200 bg-orange-50">
                        <CardHeader>
                          <CardTitle className="text-orange-700 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Alertas de Estoque Baixo
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {lowStockProducts.filter(product => 
                              searchStock === "" ||
                              product.name?.toLowerCase().includes(searchStock.toLowerCase()) ||
                              product.category?.toLowerCase().includes(searchStock.toLowerCase())
                            ).map((product) => (
                              <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="font-semibold">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Estoque atual: <span className="font-bold text-orange-600">{product.stock}</span> unidades
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openStockDialog(product)}
                                  >
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Atualizar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => loadStockHistory(product.id)}
                                  >
                                    <History className="h-4 w-4 mr-2" />
                                    Histórico
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* All Products Stock */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Todos os Produtos</h3>
                      {products.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Warehouse className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhum produto encontrado</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produto</TableHead>
                              <TableHead>Categoria</TableHead>
                              <TableHead>Estoque Atual</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.filter(product => 
                              searchStock === "" ||
                              product.name?.toLowerCase().includes(searchStock.toLowerCase()) ||
                              product.category?.toLowerCase().includes(searchStock.toLowerCase())
                            ).map((product) => {
                              const isLowStock = product.stock < 5;
                              const isOutOfStock = product.stock === 0;
                              
                              return (
                                <TableRow key={product.id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                      {product.image && (
                                        <img 
                                          src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${product.image}`}
                                          alt={product.name}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                      )}
                                      <span>{product.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{product.category}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className={isLowStock ? "font-bold text-orange-600" : "font-medium"}>
                                        {product.stock}
                                      </span>
                                      {isLowStock && !isOutOfStock && (
                                        <TrendingDown className="h-4 w-4 text-orange-500" />
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={
                                      isOutOfStock ? 'bg-red-500' :
                                      isLowStock ? 'bg-orange-500' :
                                      'bg-green-500'
                                    }>
                                      {isOutOfStock ? 'Esgotado' :
                                       isLowStock ? 'Estoque Baixo' :
                                       'Em Estoque'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openStockDialog(product)}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => loadStockHistory(product.id)}
                                      >
                                        <History className="h-4 w-4 mr-2" />
                                        Histórico
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <CouponsManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <AbandonedCartsAnalytics />
          </TabsContent>
        </Tabs>

        {/* Add Product Dialog */}
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
              <DialogDescription>
                Preencha os dados do produto abaixo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Caderno Executivo"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={newProduct.category} onValueChange={(value) => {
                    setNewProduct({...newProduct, category: value, isBook: value === "Livros"});
                    if (value !== "Livros") {
                      setNewProduct(prev => ({
                        ...prev, category: value, isBook: false,
                        bookTitle: "", bookAuthor: "", publisher: "", publicationYear: "",
                        bookType: "", accessType: "", pdfUrl: ""
                      }));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Livros">Livros</SelectItem>
                      <SelectItem value="Revistas">Revistas</SelectItem>
                      <SelectItem value="Papelaria">Papelaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Preço - esconder se for livro digital grátis */}
                {!(newProduct.category === "Livros" && newProduct.bookType === "digital" && newProduct.accessType === "free") && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (MZN)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Campos extras para Livros */}
              {newProduct.category === "Livros" && (
                <div className="border-t pt-4 space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">📘 Informações do Livro</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bookTitle">📘 Título do Livro *</Label>
                      <Input 
                        id="bookTitle" 
                        placeholder="Ex: Matemática Básica"
                        value={newProduct.bookTitle}
                        onChange={(e) => setNewProduct({...newProduct, bookTitle: e.target.value})}
                        required={newProduct.category === "Livros"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bookAuthor">✍️ Autor *</Label>
                      <Input 
                        id="bookAuthor" 
                        placeholder="Ex: João Silva"
                        value={newProduct.bookAuthor}
                        onChange={(e) => setNewProduct({...newProduct, bookAuthor: e.target.value})}
                        required={newProduct.category === "Livros"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="publisher">🧾 Editora (opcional)</Label>
                      <Input 
                        id="publisher" 
                        placeholder="Ex: Editora ABC"
                        value={newProduct.publisher}
                        onChange={(e) => setNewProduct({...newProduct, publisher: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publicationYear">📅 Ano de Publicação</Label>
                      <Input 
                        id="publicationYear" 
                        type="number"
                        placeholder="2024"
                        value={newProduct.publicationYear}
                        onChange={(e) => setNewProduct({...newProduct, publicationYear: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bookType">🏷️ Tipo *</Label>
                      <Select value={newProduct.bookType} onValueChange={(value: "physical" | "digital") => {
                        setNewProduct({...newProduct, bookType: value, accessType: value === "physical" ? "" : newProduct.accessType});
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">Físico</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Físico = produto comum com frete | Digital = PDF para download</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accessType">🔓 Acesso</Label>
                      <Select 
                        value={newProduct.accessType} 
                        onValueChange={(value: "free" | "paid") => setNewProduct({...newProduct, accessType: value})}
                        disabled={newProduct.bookType !== "digital"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={newProduct.bookType !== "digital" ? "Apenas para Digital" : "Selecione..."} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Grátis</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Apenas para livros digitais</p>
                    </div>
                  </div>

                  {newProduct.bookType === "digital" && (
                    <div className="space-y-2">
                      <Label htmlFor="pdfFile">📎 Arquivo PDF (upload)</Label>
                      <Input 
                        id="pdfFile" 
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePdfUpload(file);
                          }
                        }}
                        disabled={uploadingPdf}
                      />
                      {uploadingPdf && <p className="text-xs text-blue-600">Enviando PDF...</p>}
                      {newProduct.pdfUrl && (
                        <p className="text-xs text-green-600">✅ PDF enviado: {newProduct.pdfUrl}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {newProduct.accessType === "paid" ? "Obrigatório para livros pagos" : "Opcional para livros grátis"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Preço Original (Opcional)</Label>
                  <Input 
                    id="originalPrice" 
                    type="number" 
                    placeholder="0.00"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({...newProduct, originalPrice: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Estoque</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Curta</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descrição curta (lista de produtos)"
                  rows={4}
                  maxLength={1000}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  required
                />
                <p className="text-xs text-muted-foreground">{newProduct.description.length}/1000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Descrição Completa</Label>
                <Textarea 
                  id="longDescription" 
                  placeholder="Descrição detalhada (página do produto)"
                  rows={5}
                  maxLength={1000}
                  value={newProduct.longDescription}
                  onChange={(e) => setNewProduct({...newProduct, longDescription: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">{newProduct.longDescription.length}/1000</p>
              </div>

              <ImageUpload
                value={newProduct.image}
                onChange={(url) => setNewProduct({...newProduct, image: url})}
              />

              <MultipleImageUpload
                value={newProduct.images}
                onChange={(images) => setNewProduct({...newProduct, images})}
              />

              <div className="flex items-center space-x-2">
                <Switch 
                  id="promotion" 
                  checked={newProduct.isPromotion}
                  onCheckedChange={(checked) => setNewProduct({...newProduct, isPromotion: checked})}
                />
                <Label htmlFor="promotion" className="cursor-pointer">
                  Produto em promoção
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-accent">
                  {editingProduct ? "Salvar Alterações" : "Adicionar Produto"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Processar Reembolso</DialogTitle>
              <DialogDescription>
                Devolução #{selectedReturnForRefund?.id} - Pedido #{selectedReturnForRefund?.order_id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="refundAmount">Valor do Reembolso (MZN)</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  step="0.01"
                  placeholder={selectedReturnForRefund?.total?.toString() || "0.00"}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Deixe em branco para usar o valor total do pedido ({Number(selectedReturnForRefund?.total || 0).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })})
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Atenção:</strong> Após processar o reembolso, o estoque será restaurado automaticamente e o cliente receberá uma notificação por email.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowRefundDialog(false);
                setSelectedReturnForRefund(null);
                setRefundAmount("");
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleProcessRefund} 
                disabled={processingRefund !== null}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processingRefund !== null ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Processar Reembolso
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tracking Dialog */}
        <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Informar Código de Rastreamento</DialogTitle>
              <DialogDescription>
                Preencha o código de rastreamento para o pedido #{selectedOrderId}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="trackingCode">Código de Rastreamento *</Label>
                <Input
                  id="trackingCode"
                  placeholder="Ex: BR123456789CD"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Código fornecido pela transportadora
                </p>
              </div>
              <div>
                <Label htmlFor="trackingUrl">URL de Rastreamento (Opcional)</Label>
                <Input
                  id="trackingUrl"
                  placeholder="Ex: https://correios.com/rastreamento/BR123456789CD"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link direto para rastreamento na transportadora
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTrackingDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTracking} disabled={!trackingCode.trim()}>
                Salvar e Marcar como Enviado
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update Stock Dialog */}
        <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Atualizar Estoque</DialogTitle>
              <DialogDescription>
                {selectedProductForStock?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="currentStock">Estoque Atual</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={selectedProductForStock?.stock || 0}
                  disabled
                  className="mt-1 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="newStock">Nova Quantidade *</Label>
                <Input
                  id="newStock"
                  type="number"
                  min="0"
                  placeholder="Digite a nova quantidade"
                  value={newStockQuantity}
                  onChange={(e) => setNewStockQuantity(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="stockReason">Motivo da Alteração (Opcional)</Label>
                <Textarea
                  id="stockReason"
                  placeholder="Ex: Reposição de estoque, ajuste de inventário..."
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowStockDialog(false);
                setSelectedProductForStock(null);
                setNewStockQuantity("");
                setStockReason("");
              }}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateStock} disabled={!newStockQuantity.trim()}>
                Atualizar Estoque
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Stock History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico de Movimentações de Estoque</DialogTitle>
              <DialogDescription>
                {selectedProductForStock?.name || 'Produto'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {stockHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum histórico encontrado para este produto</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Antes</TableHead>
                      <TableHead>Depois</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockHistory.map((history: any, index: number) => {
                      const isIncrease = history.quantity_change > 0;
                      const typeLabels: any = {
                        'sale': 'Venda',
                        'cancel': 'Cancelamento',
                        'manual_add': 'Adição Manual',
                        'manual_remove': 'Remoção Manual',
                        'adjustment': 'Ajuste',
                        'low_stock_notification': 'Alerta Estoque Baixo'
                      };
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(history.created_at).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge className={isIncrease ? 'bg-green-500' : 'bg-red-500'}>
                              {typeLabels[history.type] || history.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={isIncrease ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                              {isIncrease ? '+' : ''}{history.quantity_change}
                            </span>
                          </TableCell>
                          <TableCell>{history.quantity_before}</TableCell>
                          <TableCell>{history.quantity_after}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {history.reason || '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Client Profile Dialog */}
        <Dialog open={showClientProfile} onOpenChange={setShowClientProfile}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Perfil Completo do Cliente</DialogTitle>
              <DialogDescription>
                {selectedClient?.name || 'Cliente'}
              </DialogDescription>
            </DialogHeader>
            {clientLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando perfil...</p>
              </div>
            ) : selectedClient ? (
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">ID</Label>
                      <p className="font-semibold">#{selectedClient.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Nome</Label>
                      <p className="font-semibold">{selectedClient.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p>{selectedClient.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Telefone</Label>
                      <p>{selectedClient.phone || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Badge className={
                        selectedClient.status === 'blocked' ? 'bg-red-500' :
                        selectedClient.status === 'active' || !selectedClient.status ? 'bg-green-500' :
                        'bg-gray-500'
                      }>
                        {selectedClient.status === 'blocked' ? 'Bloqueado' :
                         selectedClient.status === 'active' || !selectedClient.status ? 'Ativo' :
                         'Inativo'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Data de Registro</Label>
                      <p>{new Date(selectedClient.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Compras</CardTitle>
                    <CardDescription>
                      {clientOrders.length} pedido{clientOrders.length !== 1 ? 's' : ''} encontrado{clientOrders.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {clientOrders.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhum pedido encontrado</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Itens</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientOrders.map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>{new Date(order.created_at).toLocaleDateString('pt-BR')}</TableCell>
                              <TableCell className="font-semibold">
                                {Number(order.total).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  order.status === 'confirmed' ? 'bg-green-500' :
                                  order.status === 'pending' ? 'bg-yellow-500' :
                                  order.status === 'cancelled' ? 'bg-red-500' :
                                  'bg-gray-500'
                                }>
                                  {order.status === 'confirmed' ? 'Confirmado' :
                                   order.status === 'pending' ? 'Pendente' :
                                   order.status === 'cancelled' ? 'Cancelado' :
                                   order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{order.items_count || 0} item(s)</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Total Gasto</Label>
                      <p className="text-2xl font-bold text-primary">
                        {selectedClient.totalSpent 
                          ? selectedClient.totalSpent.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
                          : '0 MZN'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Total de Pedidos</Label>
                      <p className="text-2xl font-bold">{selectedClient.totalOrders || 0}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Ticket Médio</Label>
                      <p className="text-2xl font-bold">
                        {selectedClient.totalOrders > 0 && selectedClient.totalSpent
                          ? (selectedClient.totalSpent / selectedClient.totalOrders).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
                          : '0 MZN'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClientProfile(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                if (selectedClient) {
                  handleEditClient(selectedClient);
                  setShowClientProfile(false);
                }
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={showEditClient} onOpenChange={setShowEditClient}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Cliente #{editingClient?.id}
              </DialogDescription>
            </DialogHeader>
            {editingClient && (
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                    placeholder="+258 84 000 0000"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editingClient.status || 'active'} 
                    onValueChange={(value) => setEditingClient({...editingClient, status: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="blocked">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowEditClient(false);
                setEditingClient(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveClient}>
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Block/Unblock User Dialog */}
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUserToBlock?.isBlocked ? 'Desbloquear Cliente' : 'Bloquear Cliente'}
              </DialogTitle>
              <DialogDescription>
                {selectedUserToBlock?.isBlocked 
                  ? `Deseja desbloquear o cliente ${selectedUserToBlock.name}?`
                  : `Deseja bloquear o cliente ${selectedUserToBlock?.name}? O cliente não poderá fazer login enquanto estiver bloqueado.`}
              </DialogDescription>
            </DialogHeader>
            {!selectedUserToBlock?.isBlocked && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="block-reason">Motivo do Bloqueio (Opcional)</Label>
                  <Textarea
                    id="block-reason"
                    placeholder="Ex: Suspeita de fraude, violação dos termos de uso, etc."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Este motivo será exibido ao cliente quando ele tentar fazer login.
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowBlockDialog(false);
                setBlockReason("");
                setSelectedUserToBlock(null);
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (selectedUserToBlock) {
                    handleBlockClient(selectedUserToBlock.id, !selectedUserToBlock.isBlocked);
                  }
                }}
                className={selectedUserToBlock?.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {selectedUserToBlock?.isBlocked ? 'Desbloquear' : 'Bloquear'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;


