import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, CreditCard, Smartphone, Lock, Wallet, BanknoteIcon, QrCode, Loader2, ArrowRight, ChevronRight, Globe, ArrowLeft, HelpCircle } from "lucide-react";
import { SecurityBadge } from "@/components/SecurityBadge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { useOrders } from "@/contexts/OrdersContext";
import { useProducts } from "@/contexts/ProductsContextMySQL";
import { 
  initiatePayPalPayment, 
  initiateMpesaPayment, 
  initiateCardPayment,
  createCashOrder,
  initiateBankTransferPayment,
  uploadBankReceipt
} from "@/services/payments";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { calculateShipping, getEstimatedDelivery, MOZAMBIQUE_PROVINCES } from "@/utils/shippingCalculator";
import { useSearchParams } from "react-router-dom";

type CheckoutStep = 'info' | 'payment-selection' | 'card-form' | 'bank-transfer';

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [newsletterChecked, setNewsletterChecked] = useState(true);
  const [hasOnlyDigitalProducts, setHasOnlyDigitalProducts] = useState(false);
  const [bankTransferData, setBankTransferData] = useState({
    bankName: '',
    accountNumber: '',
    receiptFile: null as File | null
  });
  const navigate = useNavigate();
  const { items, clearCart, addItem, selectedItems } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrders();
  const { products } = useProducts();
  const [searchParams] = useSearchParams();
  
  // Card form data
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    documentType: "CPF",
    document: ""
  });
  
  // Load saved profile data
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "Moçambique"
  });

  // Determinar quais itens usar: do carrinho (selecionados) ou "Comprar Agora"
  const fromCart = searchParams.get('fromCart') === 'true';
  const checkoutItems = fromCart ? selectedItems : items;

  // Detectar se todos os produtos são digitais
  useEffect(() => {
    const onlyDigital = checkoutItems.every(item => {
      const product = products.find(p => p.id === item.id);
      return product && (product as any).isBook && (product as any).book_type === 'digital';
    });
    setHasOnlyDigitalProducts(onlyDigital);
  }, [checkoutItems, products]);

  // Handle "Buy Now" - adicionar produto diretamente do parâmetro da URL
  useEffect(() => {
    const productId = searchParams.get('product');
    const fromCart = searchParams.get('fromCart');
    const quantity = parseInt(searchParams.get('quantity') || '1');
    
    // Se vier do carrinho, não fazer nada - apenas renderizar o que já está no carrinho
    if (fromCart === 'true') {
      return;
    }
    
    // Só carregar produto se vier da URL "comprar agora" E o carrinho estiver vazio
    // E ainda não tiver iniciado o carregamento
    if (productId && items.length === 0 && !isLoadingProduct) {
      setIsLoadingProduct(true);
      
      // Timeout de segurança - máximo 10 segundos
      const timeoutId = setTimeout(() => {
        setIsLoadingProduct(false);
        toast({
          title: "Timeout",
          description: "Tempo de carregamento excedido. Tente novamente.",
          variant: "destructive"
        });
      }, 10000);

      // Buscar o produto via API e adicionar ao carrinho
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      fetch(`${API_URL}/products/${productId}`)
        .then(res => {
          if (!res.ok) throw new Error('Produto não encontrado');
          return res.json();
        })
        .then(product => {
          clearTimeout(timeoutId);
          if (product) {
            // Adicionar quantidade correta ao carrinho
            const itemToAdd = {
              id: product.id.toString(),
              name: product.name,
              price: product.price,
              originalPrice: product.original_price || product.originalPrice,
              image: product.image || product.images?.[0] || '/placeholder-product.jpg'
            };
            
            // Adicionar quantidade correta usando um loop controlado
            let added = 0;
            const addWithDelay = () => {
              if (added < quantity) {
                addItem(itemToAdd);
                added++;
                if (added < quantity) {
                  setTimeout(addWithDelay, 50); // Pequeno delay para evitar conflitos
                } else {
                  setIsLoadingProduct(false);
                }
              }
            };
            addWithDelay();
          }
        })
        .catch(err => {
          clearTimeout(timeoutId);
          console.error('Error loading product:', err);
          setIsLoadingProduct(false);
          // Se não conseguir carregar, redirecionar para produtos
          toast({
            title: "Erro",
            description: "Não foi possível carregar o produto. Redirecionando para produtos...",
            variant: "destructive"
          });
          setTimeout(() => navigate('/products'), 2000);
        });

      return () => clearTimeout(timeoutId);
    } else if (productId && items.length > 0) {
      // Produto já foi adicionado, parar de carregar
      setIsLoadingProduct(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('product'), searchParams.get('fromCart')]);

  useEffect(() => {
    // Load saved address from profile
    const savedData = localStorage.getItem(`profile_${user?.id}`);
    if (savedData) {
      const data = JSON.parse(savedData);
      setFormData({
        name: data.name || user?.name || "",
        email: data.email || user?.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        province: data.province || "",
        postalCode: data.postalCode || "",
        country: data.country || "Moçambique"
      });
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calcular frete baseado na província (ou usar padrão) - apenas para produtos físicos
  const shippingLocation = formData.province 
    ? { province: formData.province, city: formData.city }
    : { province: 'Maputo' }; // Default
  
  let shippingRate;
  let shipping = 0;
  let total = subtotal;
  let estimatedDeliveryDate = '';
  
  // Para produtos digitais, não calcular frete
  if (!hasOnlyDigitalProducts) {
    try {
      shippingRate = calculateShipping(shippingLocation, subtotal);
      shipping = shippingRate.cost;
      total = subtotal + shipping;
      
      // Calcular data de entrega
      if (shippingLocation.province) {
        try {
          estimatedDeliveryDate = getEstimatedDelivery(shippingLocation);
        } catch (error) {
          console.error('Error calculating delivery date:', error);
        }
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      // Fallback: frete padrão
      shipping = subtotal >= 500 ? 0 : 50;
      total = subtotal + shipping;
      shippingRate = { cost: shipping, estimatedDays: 5, description: 'Frete padrão' };
    }
  }

  const validateForm = () => {
    // Para produtos digitais, apenas name, email e phone são obrigatórios
    if (hasOnlyDigitalProducts) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast({
          title: "Formulário incompleto",
          description: "Por favor, preencha nome, email e telefone.",
          variant: "destructive"
        });
        return false;
      }
    } else {
      // Para produtos físicos, todos os campos são obrigatórios
      if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.province) {
        toast({
          title: "Formulário incompleto",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const validateCardForm = () => {
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv || !cardData.document) {
      toast({
        title: "Dados do cartão incompletos",
        description: "Por favor, preencha todos os campos do cartão.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleCardSubmit = () => {
    if (!validateCardForm()) return;
    handleProcessPayment('card');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleContinueToPayment = () => {
    if (!validateForm()) return;
    setCurrentStep('payment-selection');
  };

  const handleSelectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
    if (method === 'card') {
      setCurrentStep('card-form');
    } else if (method === 'bank_transfer') {
      setCurrentStep('bank-transfer');
    } else {
      handleProcessPayment(method);
    }
  };

  const handleProcessPayment = async (method?: string) => {
    const selectedMethod = method || paymentMethod;
    if (!selectedMethod) return;
    
    if (!user?.id) {
      toast({
        title: "Não autenticado",
        description: "Por favor, faça login para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const paymentRequest: any = {
        amount: total,
        items: checkoutItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        userId: user.id,
        // Só enviar shippingInfo se houver produtos físicos
        ...(hasOnlyDigitalProducts ? {} : {
          shippingInfo: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            province: formData.province
          }
        }),
        phone: formData.phone
      };

      // Add card details if paying with card
      if (selectedMethod === 'card') {
        paymentRequest.cardDetails = {
          number: cardData.number.replace(/\s/g, ''),
          expiry: cardData.expiry,
          cvv: cardData.cvv
        };
      }

      // Se o usuário marcou para receber novidades, adicionar à lista de marketing
      if (newsletterChecked && formData.email) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
          await fetch(`${API_URL}/subscribers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name || null,
              source: 'checkout'
            })
          });
        } catch (subscribeError) {
          // Não bloquear o checkout se falhar
          console.log('Não foi possível adicionar à newsletter:', subscribeError);
        }
      }

      let result;
      
      try {
        switch (selectedMethod) {
          case 'paypal':
            result = await initiatePayPalPayment(paymentRequest);
            break;
          case 'mpesa':
            result = await initiateMpesaPayment(paymentRequest);
            break;
          case 'card':
            result = await initiateCardPayment(paymentRequest);
            break;
          case 'bank_transfer':
            result = await initiateBankTransferPayment({
              ...paymentRequest,
              bankName: bankTransferData.bankName,
              accountNumber: bankTransferData.accountNumber
            });
            // Se sucesso, já redireciona (com opção de upload)
            if (result.success && result.orderId) {
              clearCart();
              const params = new URLSearchParams();
              params.set('orderId', result.orderId.toString());
              if (result.transactionId) params.set('transaction', result.transactionId.toString());
              params.set('uploadReceipt', 'true');
              navigate(`/checkout-success?${params.toString()}`);
              return;
            }
            break;
        case 'cash':
          result = await createCashOrder(paymentRequest);
          // Cash orders are immediately confirmed
          if (result.success) {
            // Criar pedido no banco
            try {
              const orderData = {
                user_id: user?.id,
                total: total,
                payment_method: 'cash',
                shipping_address: JSON.stringify({
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  province: formData.province,
                  postalCode: formData.postalCode
                }),
                billing_address: JSON.stringify({
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  province: formData.province
                }),
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                  notes: `Pedido via dinheiro. Método: ${selectedMethod}`,
                items: checkoutItems.map(item => ({
                  product_id: parseInt(item.id),
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity
                }))
              };
              
              await createOrder(orderData);
            } catch (orderError) {
              console.error('Error creating order:', orderError);
              // Não bloquear o fluxo se falhar
            }
            
            clearCart();
            navigate('/checkout-success', { state: { transactionId: result.transactionId } });
            return;
          }
          break;
          default:
            throw new Error('Método de pagamento inválido');
        }
      } catch (paymentError: any) {
        console.error('❌ Erro ao processar pagamento:', paymentError);
        throw new Error(paymentError.message || 'Erro ao processar pagamento');
      }

      // Verificar se resultado é válido
      if (!result || !result.success) {
        throw new Error(result?.error || 'Falha ao processar pagamento');
      }

      // Para PayPal e Cartão, redirecionar diretamente com orderId
      if ((selectedMethod === 'paypal' || selectedMethod === 'card')) {
        if (!result.orderId) {
          console.error('❌ Erro: orderId não retornado pelo backend');
          throw new Error('Erro: Pedido não foi criado. Tente novamente.');
        }
        
        // Redirecionar diretamente para a página de sucesso com orderId
        clearCart();
        const params = new URLSearchParams();
        params.set('orderId', result.orderId.toString());
        if (result.transactionId) params.set('transaction', result.transactionId.toString());
        navigate(`/checkout-success?${params.toString()}`);
        return;
      }
      
      // Para outros métodos, mostrar dialog
      setPaymentData({
        transactionId: result.transactionId,
        orderId: result.orderId, // IMPORTANTE: incluir orderId
        method: selectedMethod,
        amount: total,
        ...result
      });
      setShowPaymentDialog(true);

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Erro no pagamento",
        description: error.message || "Ocorreu um erro ao processar o pagamento.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setShowPaymentDialog(false);
    
    // Passar orderId e transactionId na URL
    const orderId = paymentData?.orderId;
    const transactionId = paymentData?.transactionId;
    
    if (orderId || transactionId) {
      const params = new URLSearchParams();
      if (orderId) params.set('orderId', orderId);
      if (transactionId) params.set('transaction', transactionId);
      navigate(`/checkout-success?${params.toString()}`);
    } else {
      navigate('/checkout-success');
    }
  };

  // Render Payment Selection Step
  const renderPaymentSelection = () => (
        <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Payment Selection */}
          <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentStep('info')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-heading font-bold">Como você prefere pagar?</h1>
                    </div>

            <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Payment methods organized like in the images */}
            <div className="space-y-4">
                  {/* PayPal */}
              <div 
                onClick={() => handleSelectPaymentMethod('paypal')}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                  <div>
                        <p className="font-semibold">PayPal</p>
                        <p className="text-sm text-muted-foreground">Cartão, débito ou saldo PayPal</p>
                      </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* M-Pesa */}
              <div 
                onClick={() => handleSelectPaymentMethod('mpesa')}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                      <Smartphone className="h-6 w-6 text-green-600" />
                  <div>
                        <p className="font-semibold">M-Pesa</p>
                        <p className="text-sm text-muted-foreground">Pagamento via móvel Moçambique</p>
                      </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Cartão de Crédito/Débito */}
              <div 
                onClick={() => handleSelectPaymentMethod('card')}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                      <CreditCard className="h-6 w-6 text-violet-600" />
                  <div>
                    <p className="font-semibold">Cartão de crédito</p>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard e outros</p>
                      </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Transferência Bancária */}
              <div 
                onClick={() => handleSelectPaymentMethod('bank_transfer')}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                      <Wallet className="h-6 w-6 text-blue-700" />
                  <div>
                        <p className="font-semibold">Transferência Bancária</p>
                        <p className="text-sm text-muted-foreground">Envie o comprovante após pagar</p>
                      </div>
                  </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>

                  {/* Dinheiro na Entrega */}
              <div 
                onClick={() => handleSelectPaymentMethod('cash')}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                      <BanknoteIcon className="h-6 w-6 text-green-600" />
                  <div>
                        <p className="font-semibold">Dinheiro na Entrega</p>
                        <p className="text-sm text-muted-foreground">Pague quando receber</p>
                      </div>
                  </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Payment Details Summary */}
      {renderOrderSummary()}
                  </div>
  );

  // Render Card Form Step
  const renderCardForm = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Card Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentStep('payment-selection')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-heading font-bold">Preencha os dados do seu cartão</h1>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="card-number">Número do cartão</Label>
              <div className="relative">
                <Input 
                  id="card-number"
                  value={cardData.number}
                  onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                  placeholder="1234 1234 1234 1234"
                  maxLength={19}
                  className="pr-10"
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="card-name">Nome do titular</Label>
              <Input 
                id="card-name"
                value={cardData.name}
                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                placeholder="Ex.: Maria Lopes"
              />
              <p className="text-sm text-muted-foreground">Conforme aparece no cartão.</p>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Vencimento</Label>
                <Input 
                  id="card-expiry"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cvv">Código de segurança</Label>
                <div className="relative">
                  <Input 
                    id="card-cvv"
                    value={cardData.cvv}
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                    placeholder="Ex.: 123"
                    maxLength={4}
                    className="pr-10"
                  />
                  <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground cursor-help" />
                </div>
              </div>
            </div>

            {/* Document */}
            <div className="space-y-2">
              <Label htmlFor="card-document">Documento do titular</Label>
              <div className="flex gap-2">
                <Select
                  value={cardData.documentType}
                  onValueChange={(value) => setCardData({...cardData, documentType: value})}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="BI">BI</SelectItem>
                    <SelectItem value="Passaporte">Passaporte</SelectItem>
                  </SelectContent>
                </Select>
                <Input 
                  id="card-document"
                  value={cardData.document}
                  onChange={(e) => setCardData({...cardData, document: e.target.value})}
                  placeholder={cardData.documentType === 'CPF' ? "999.999.999-99" : "Número do documento"}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setCurrentStep('payment-selection')}
              >
                Voltar
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCardSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Right: Payment Details Summary */}
      {renderOrderSummary()}
    </div>
  );

  // Render Bank Transfer Form
  const renderBankTransfer = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left: Bank Transfer Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCurrentStep('payment-selection')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-heading font-bold">Transferência Bancária</h1>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Informações da Conta</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Banco:</strong> BCI - Banco Comercial e de Investimentos</p>
                <p><strong>Conta:</strong> 000123456789</p>
                <p><strong>IBAN:</strong> MZ59000012345678912345678</p>
                <p><strong>Beneficiário:</strong> Papel & Pixel Lda</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nome do Banco</Label>
                <Input 
                  id="bank-name"
                  value={bankTransferData.bankName}
                  onChange={(e) => setBankTransferData({...bankTransferData, bankName: e.target.value})}
                  placeholder="Ex: BCI, Millennium BIM, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-number">Número da Conta</Label>
                <Input 
                  id="account-number"
                  value={bankTransferData.accountNumber}
                  onChange={(e) => setBankTransferData({...bankTransferData, accountNumber: e.target.value})}
                  placeholder="Número da conta que usará para transferir"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Após realizar a transferência, você poderá enviar o comprovante na página de confirmação do pedido. 
                  O pedido será confirmado após a verificação do comprovante (até 24 horas úteis).
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setCurrentStep('payment-selection')}
              >
                Voltar
              </Button>
              <Button 
                className="flex-1"
                onClick={() => handleProcessPayment('bank_transfer')}
                disabled={isProcessing || !bankTransferData.bankName || !bankTransferData.accountNumber}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Criar Pedido'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Payment Details Summary */}
      {renderOrderSummary()}
    </div>
  );

  // Render Order Summary (reusable component)
  const renderOrderSummary = (showContinueButton = false) => {
    // Calcular valores para o resumo
    const summarySubtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const summaryShippingLocation = formData.province 
      ? { province: formData.province, city: formData.city }
      : { province: 'Maputo' };
    
    let summaryShippingRate;
    let summaryShipping = 0;
    let summaryTotal = summarySubtotal;
    let summaryEstimatedDeliveryDate = '';
    
    // Para produtos digitais, não calcular frete
    if (!hasOnlyDigitalProducts) {
      try {
        summaryShippingRate = calculateShipping(summaryShippingLocation, summarySubtotal);
        summaryShipping = summaryShippingRate.cost;
        summaryTotal = summarySubtotal + summaryShipping;
        
        if (summaryShippingLocation.province) {
          try {
            summaryEstimatedDeliveryDate = getEstimatedDelivery(summaryShippingLocation);
          } catch (error) {
            console.error('Error calculating delivery date:', error);
          }
        }
      } catch (error) {
        console.error('Error calculating shipping:', error);
        summaryShipping = summarySubtotal >= 500 ? 0 : 50;
        summaryTotal = summarySubtotal + summaryShipping;
        summaryShippingRate = { cost: summaryShipping, estimatedDays: 5, description: 'Frete padrão' };
      }
    }

    return (
          <div>
            <Card className="sticky top-20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-purple-600">Papel</span>
              <span className="text-2xl font-bold">& Pixel</span>
            </div>
          </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                      </div>
                      </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                </div>
                <p className="font-semibold text-sm flex-shrink-0">
                        {(item.price * item.quantity).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{summarySubtotal.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Frete</span>
                      {summaryShippingLocation.province && summaryShippingRate && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {summaryShippingRate.description} • {summaryShippingRate.estimatedDays} dias úteis
                        </p>
                      )}
                    </div>
                    <span className={summaryShipping === 0 ? "text-green-600 font-semibold" : ""}>
                      {summaryShipping === 0 ? "Grátis" : summaryShipping.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{summaryTotal.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                  </div>
                </div>

                {/* Continue Button */}
                {showContinueButton && currentStep === 'info' && (
                  <>
                    <Separator />
                <Button 
                      className="w-full bg-primary hover:bg-primary/90" 
                  size="lg"
                      onClick={handleContinueToPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                          Pagar agora
                    </>
                  )}
                </Button>
                  </>
                )}

                {/* Security Badge */}
                {showContinueButton && (
                <div className="mt-4">
                  <SecurityBadge type="detailed" />
                </div>
                )}

                {/* Prazo de Entrega */}
                {summaryEstimatedDeliveryDate && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Previsão de Entrega:</strong>{' '}
                      {summaryEstimatedDeliveryDate}
                    </p>
                  </div>
                )}

                <div className="text-center">
                  <CheckCircle className="h-5 w-5 mx-auto mb-2 text-green-500" />
                  <p className="text-xs text-muted-foreground">
                    Receba entrega grátis por compras acima de 500 MZN
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 container py-12 max-w-7xl mx-auto px-4">

        {/* Loading state ao carregar produto do "Comprar Agora" */}
        {isLoadingProduct && checkoutItems.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-blue-900" />
            <p className="text-sm text-blue-900">Carregando produto...</p>
        </div>
        )}

        {/* Empty cart message - só mostrar se não estiver carregando E não vier do carrinho */}
        {!isLoadingProduct && checkoutItems.length === 0 && (
          <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-sm text-yellow-900 mb-4">Seu carrinho está vazio.</p>
            <Button onClick={() => navigate('/products')} variant="outline">
              Continuar Comprando
                </Button>
                  </div>
                )}

        {/* Formulário de Checkout - mostrar quando houver itens */}
        {checkoutItems.length > 0 && (
          <>
            {currentStep === 'info' && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Contato Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="seu@email.com" 
                        />
                </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="newsletter"
                          checked={newsletterChecked}
                          onCheckedChange={(checked) => setNewsletterChecked(checked === true)}
                        />
                        <Label htmlFor="newsletter" className="text-sm cursor-pointer">
                          Enviar novidades e ofertas para mim por e-mail
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pagamento Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Todas as transações são seguras e criptografadas.
                      </p>
                      
                      {/* Payment Method Selection Box */}
                      <div 
                        onClick={handleContinueToPayment}
                        className="border rounded-lg p-4 hover:bg-muted cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <QrCode className="h-4 w-4 text-green-600" />
                            </div>
                            <BanknoteIcon className="h-4 w-4 text-orange-600" />
                            <span className="text-xs text-muted-foreground">+3</span>
                          </div>
                          <span className="font-semibold">Escolher método de pagamento</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>

                      {/* Payment Flow Info */}
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 border-2 rounded bg-background flex items-center justify-center">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lock className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Depois de clicar em "Pagar agora", você escolherá o método de pagamento e finalizará sua compra com segurança.
                        </p>
                </div>
              </CardContent>
            </Card>

                  {/* Endereço de Faturamento Section - só mostrar se houver produtos físicos */}
                  {!hasOnlyDigitalProducts && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold">Endereço de faturamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="country">País/Região</Label>
                          <Select
                            value={formData.country}
                            onValueChange={(value) => setFormData({...formData, country: value})}
                          >
                            <SelectTrigger id="country">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Moçambique">Moçambique</SelectItem>
                            </SelectContent>
                          </Select>
          </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input 
                              id="name" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="Nome" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="surname">Sobrenome</Label>
                            <Input 
                              id="surname" 
                              value={formData.name.split(' ').slice(1).join(' ') || ''}
                              onChange={(e) => {
                                const firstName = formData.name.split(' ')[0];
                                setFormData({...formData, name: `${firstName} ${e.target.value}`.trim()})
                              }}
                              placeholder="Sobrenome" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Endereço</Label>
                          <Input 
                            id="address" 
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Endereço completo" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input 
                              id="city" 
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                              placeholder="Cidade" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="province">Província</Label>
                            <Select
                              value={formData.province}
                              onValueChange={(value) => setFormData({...formData, province: value})}
                            >
                              <SelectTrigger id="province">
                                <SelectValue placeholder="Selecione a província" />
                              </SelectTrigger>
                              <SelectContent>
                                {MOZAMBIQUE_PROVINCES.map((province) => (
                                  <SelectItem key={province} value={province}>
                                    {province}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="+258 84 XXX XXXX" 
                          />
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                  )}
                </div>

                {/* Order Summary */}
                {renderOrderSummary(true)}
        </div>
            )}

            {currentStep === 'payment-selection' && renderPaymentSelection()}
            {currentStep === 'card-form' && renderCardForm()}
            {currentStep === 'bank-transfer' && renderBankTransfer()}
          </>
        )}
      </main>

      <Footer />

      {/* Payment Processing Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Processando Pagamento</DialogTitle>
            <DialogDescription>
              {paymentData?.method === 'mpesa' && (
                <div className="space-y-4 mt-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Instruções M-Pesa:</h4>
                    <ul className="space-y-1 text-sm">
                      {paymentData?.instructions?.map((instruction: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="font-semibold text-primary">Valor: {paymentData?.amount?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                    <p className="text-sm text-muted-foreground">ID da Transação: {paymentData?.transactionId}</p>
                  </div>
                </div>
              )}
              
              {paymentData?.method === 'mkesh' && (
                <div className="space-y-4 mt-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Instruções Mkesh:</h4>
                    <ul className="space-y-1 text-sm">
                      {paymentData?.instructions?.map((instruction: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-100 p-4 rounded-lg">
                    <p className="font-semibold text-orange-700">Código de Pagamento: {paymentData?.paymentCode}</p>
                    <p className="text-sm text-orange-600">Valor: {paymentData?.amount?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                  </div>
                </div>
              )}

              {paymentData?.method === 'emola' && (
                <div className="space-y-4 mt-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm mb-2">{paymentData?.message}</p>
                    <p className="font-semibold">Referência: {paymentData?.reference}</p>
                    <p className="text-sm text-muted-foreground mt-2">Valor: {paymentData?.amount?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</p>
                  </div>
                </div>
              )}

              {['paypal', 'card'].includes(paymentData?.method || '') && (
                <div className="space-y-4 mt-4">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-sm">{paymentData?.message || 'Redirecionando para gateway de pagamento...'}</p>
                    <div className="mt-4">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePaymentSuccess}
              className="flex-1"
              disabled={paymentData?.method === 'paypal' || paymentData?.method === 'card'}
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;

