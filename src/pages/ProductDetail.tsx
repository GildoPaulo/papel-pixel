import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatBox from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import SellerInfo from "@/components/SellerInfo";
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, ArrowLeft, Download, MessageSquare, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductsContextMySQL";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { toast } from "sonner";

import categoryBooks from "@/assets/category-books.jpg";
import categoryMagazines from "@/assets/category-magazines.jpg";
import categoryStationery from "@/assets/category-stationery.jpg";

interface Review {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

interface ReviewStats {
  avg_rating: number;
  total_reviews: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { products } = useProducts();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  
  // Estados para avaliações
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ avg_rating: 0, total_reviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Buscar produto do banco de dados
  const productData = products.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Carregar avaliações do produto
  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      
      setLoadingReviews(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/reviews/product/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setReviews(data.reviews || []);
          setReviewStats(data.stats || { avg_rating: 0, total_reviews: 0 });
          
          // Verificar se o usuário já avaliou
          if (user) {
            const userReviewed = data.reviews?.some((r: Review) => r.user_id === Number(user.id));
            setUserHasReviewed(userReviewed);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviews();
  }, [id, user]);

  // Verificar se é livro digital e se o usuário já comprou
  useEffect(() => {
    const checkPurchase = async () => {
      if (!productData || !user) {
        setHasPurchased(false);
        return;
      }

      const isDigitalBook = (productData as any).isBook && 
                           (productData as any).book_type === 'digital' && 
                           (productData as any).access_type === 'paid';

      if (!isDigitalBook) {
        setHasPurchased(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/products/${id}/download`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setHasPurchased(true);
        } else {
          setHasPurchased(false);
        }
      } catch (error) {
        setHasPurchased(false);
      }
    };

    checkPurchase();
  }, [id, user, productData]);
  
  // Se não encontrou, carregar um produto padrão
  const product = productData ? {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    originalPrice: productData.originalPrice,
    description: productData.description,
    longDescription: undefined, // Não existe no banco de dados
    images: (() => {
      let img = productData.image || categoryStationery;
      // Se é URL relativa (/uploads/...), tornar absoluta
      if (img && typeof img === 'string') {
        if (img.startsWith('/uploads')) {
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
          img = `${baseUrl}${img}`;
        }
        // Se é base64 muito longo (>10000 chars), usar fallback
        else if (img.startsWith('data:image') && img.length > 10000) {
          console.warn('⚠️ [PRODUCT DETAIL] Imagem base64 muito longa, usando fallback:', productData.id);
          img = categoryStationery;
        }
        // Se é base64 válido ou URL completa, usar direto
      }
      return [img];
    })(),
    category: productData.category,
    rating: 0,
    totalReviews: 0,
    inStock: productData.stock > 0,
    stock: productData.stock,
    sku: `SKU-${productData.id}`,
    brand: "Papel & Pixel",
    specifications: {}
  } : {
    id: id || "1",
    name: "Produto não encontrado",
    price: 0,
    originalPrice: undefined,
    description: "Produto não encontrado",
    longDescription: "Este produto não está disponível no momento.",
    images: [categoryStationery],
    category: "Papelaria",
    rating: 0,
    totalReviews: 0,
    inStock: false,
    stock: 0,
    sku: "N/A",
    brand: "Papel & Pixel",
    specifications: {}
  };

  // Função para enviar avaliação
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Faça login para avaliar produtos');
      navigate('/login');
      return;
    }

    if (reviewRating === 0) {
      toast.error('Selecione uma avaliação');
      return;
    }

    if (!id) return;

    setSubmittingReview(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/reviews/product/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim() || null
        })
      });

      if (response.ok) {
        toast.success('Avaliação enviada com sucesso!');
        setShowReviewForm(false);
        setReviewRating(0);
        setReviewComment("");
        setUserHasReviewed(true);
        
        // Recarregar avaliações
        const data = await response.json();
        const reviewsResponse = await fetch(`${API_URL}/reviews/product/${id}`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData.reviews || []);
          setReviewStats(reviewsData.stats || { avg_rating: 0, total_reviews: 0 });
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao enviar avaliação');
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const relatedProducts = [
    {
      id: "2",
      name: "Kit Canetas Coloridas Profissionais",
      price: 280,
      originalPrice: 350,
      image: categoryStationery,
      rating: 0,
      category: "Papelaria",
      inStock: true
    },
    {
      id: "7",
      name: "Planner Anual 2025",
      price: 380,
      originalPrice: 480,
      image: categoryStationery,
      rating: 0,
      category: "Papelaria",
      inStock: true
    },
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0]
      });
    }
    toast.success(`${quantity} ${quantity === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho!`);
  };

  const handleBuyNow = () => {
    navigate(`/checkout?product=${product.id}&quantity=${quantity}`);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };

  // Detectar se é livro digital
  const isDigitalBook = productData && (productData as any).isBook && 
                        (productData as any).book_type === 'digital';
  const isFreeBook = isDigitalBook && (productData as any).access_type === 'free';
  const isPaidBook = isDigitalBook && (productData as any).access_type === 'paid';

  // Função para fazer download do livro
  const handleDownload = async () => {
    if (!user) {
      toast.error('Faça login para baixar o livro');
      navigate('/login');
      return;
    }

    if (!productData || !id) {
      toast.error('Erro: produto não encontrado');
      return;
    }

    setDownloading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/products/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        
        if (response.status === 403) {
          toast.error('Você precisa comprar este livro para baixá-lo');
          return;
        }
        
        if (response.status === 401) {
          toast.error('Faça login para baixar o livro');
          navigate('/login');
          return;
        }

        toast.error(errorData.error || 'Erro ao fazer download');
        return;
      }

      // Se a resposta for um JSON com pdfUrl, fazer download via link
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.pdfUrl) {
          // Se for URL externa ou local, abrir diretamente
          const pdfUrl = data.pdfUrl.startsWith('http') 
            ? data.pdfUrl 
            : `${API_URL.replace('/api', '')}${data.pdfUrl}`;
          
          window.open(pdfUrl, '_blank');
          toast.success('Download iniciado!');
          setHasPurchased(true);
          return;
        }
      }

      // Se for arquivo PDF direto, criar blob e baixar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Download concluído com sucesso!');
      setHasPurchased(true);
    } catch (error: any) {
      console.error('Erro ao fazer download:', error);
      toast.error('Erro ao fazer download. Tente novamente.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <span>/</span>
          <a href="/products">Produtos</a>
          <span>/</span>
          <a href="/products?category=Papelaria">{product.category}</a>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3">{product.category}</Badge>
              <h1 className="text-4xl font-heading font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(parseFloat(reviewStats.avg_rating || product.rating)) ? "fill-secondary text-secondary" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg font-semibold">
                    {reviewStats.avg_rating ? parseFloat(reviewStats.avg_rating).toFixed(1) : product.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({reviewStats.total_reviews || product.totalReviews} avaliações)
                  </span>
                </div>
              </div>

              {/* Preço - esconder se for livro digital grátis */}
              {!(isFreeBook && isDigitalBook) && (
                <div className="mb-6">
                  {product.originalPrice && (
                    <span className="text-2xl text-muted-foreground line-through mr-3">
                      {product.originalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-primary">
                    {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                  </span>
                  {product.originalPrice && (
                    <Badge className="ml-3 bg-green-500">
                      Economia de {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Badge GRATUITO para livro digital grátis */}
              {isFreeBook && isDigitalBook && (
                <div className="mb-6">
                  <Badge className="bg-green-600 text-white text-2xl px-6 py-3">
                    🆓 GRATUITO
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {product.longDescription && (
                <div>
                  <h3 className="font-semibold mb-2">Descrição Completa</h3>
                  <div 
                    className="text-muted-foreground prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.longDescription }}
                  />
                </div>
              )}

              {Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Especificações</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector (apenas para produtos físicos) */}
            {!isDigitalBook && (
              <div className="flex items-center gap-4">
                <span className="font-semibold">Quantidade:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={decrementQuantity}>
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={incrementQuantity}>
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">({product.stock} disponíveis)</span>
              </div>
            )}

            {/* Informações do Livro */}
            {productData && (productData as any).isBook && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">📘 Informações do Livro</h3>
                <div className="space-y-2 text-sm">
                  {(productData as any).book_title && (
                    <p><strong>Título:</strong> {(productData as any).book_title}</p>
                  )}
                  {(productData as any).book_author && (
                    <p><strong>Autor:</strong> {(productData as any).book_author}</p>
                  )}
                  {(productData as any).publisher && (
                    <p><strong>Editora:</strong> {(productData as any).publisher}</p>
                  )}
                  {(productData as any).publication_year && (
                    <p><strong>Ano:</strong> {(productData as any).publication_year}</p>
                  )}
                  {(productData as any).book_type && (
                    <p>
                      <strong>Tipo:</strong> {(productData as any).book_type === 'digital' ? '📱 Digital (PDF)' : '📚 Físico'}
                    </p>
                  )}
                  {(productData as any).access_type && (
                    <p>
                      <strong>Acesso:</strong> {(productData as any).access_type === 'free' ? '🆓 Grátis' : '💰 Pago'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {/* Botões para Livros Digitais */}
              {isDigitalBook && (
                <>
                  {isFreeBook && (
                    <>
                      {user ? (
                        <Button 
                          size="lg" 
                          className="flex-1 bg-gradient-accent"
                          onClick={handleDownload}
                          disabled={downloading}
                        >
                          <Download className={`mr-2 h-5 w-5 ${downloading ? 'animate-spin' : ''}`} />
                          {downloading ? 'Baixando...' : '📥 Baixar Agora'}
                        </Button>
                      ) : (
                        <Button 
                          size="lg" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            toast.info('Faça login para baixar este livro grátis');
                            navigate('/login');
                          }}
                        >
                          <Download className="mr-2 h-5 w-5" />
                          Fazer Login para Baixar
                        </Button>
                      )}
                    </>
                  )}
                  
                  {isPaidBook && (
                    <>
                      {hasPurchased ? (
                        <Button 
                          size="lg" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleDownload}
                          disabled={downloading}
                        >
                          <Download className={`mr-2 h-5 w-5 ${downloading ? 'animate-spin' : ''}`} />
                          {downloading ? 'Baixando...' : 'Fazer Download do Seu Livro'}
                        </Button>
                      ) : (
                        <Button 
                          size="lg" 
                          className="flex-1 bg-gradient-accent"
                          onClick={handleBuyNow}
                          disabled={!product.inStock}
                        >
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Comprar e Baixar
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Botões para Produtos Normais */}
              {!isDigitalBook && (
                <>
                  <Button 
                    size="lg" 
                    className="flex-1 bg-gradient-accent"
                    onClick={handleBuyNow}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Comprar Agora
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Adicionar ao Carrinho
                  </Button>
                </>
              )}

              {/* Botões auxiliares (sempre visíveis) */}
              <Button 
                variant="outline" 
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  toast.success(`"${product.name}" adicionado aos favoritos!`);
                }}
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.description,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copiado para compartilhar!');
                  }
                }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Mensagem para livro digital grátis sem login */}
            {isFreeBook && !user && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                ⚠️ Faça login para baixar o livro grátis
              </p>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-semibold">Entrega Grátis</p>
                <p className="text-xs text-muted-foreground">Acima de 500 MZN</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-semibold">Garantia</p>
                <p className="text-xs text-muted-foreground">30 dias</p>
              </div>
              <div className="text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-semibold">Ótima Qualidade</p>
                <p className="text-xs text-muted-foreground">Aprovado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold">Avaliações dos Clientes</h2>
              {user && !userHasReviewed && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Avaliar Produto
                </Button>
              )}
            </div>

            {/* Formulário de Avaliação */}
            {showReviewForm && user && !userHasReviewed && (
              <div className="mb-8 p-6 bg-muted rounded-lg border">
                <h3 className="font-semibold mb-4">Sua Avaliação</h3>
                
                {/* Seleção de Estrelas */}
                <div className="mb-4">
                  <p className="text-sm mb-2">Nota:</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= reviewRating 
                              ? "fill-secondary text-secondary" 
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comentário */}
                <div className="mb-4">
                  <p className="text-sm mb-2">Comentário (opcional):</p>
                  <Textarea
                    placeholder="Conte-nos sua experiência com este produto..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {reviewComment.length}/500 caracteres
                  </p>
                </div>

                {/* Botões */}
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewRating(0);
                      setReviewComment("");
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || submittingReview}
                  >
                    {submittingReview ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Avaliações */}
            <div className="space-y-6">
              {loadingReviews ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando avaliações...
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary">
                            {review.user_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{review.user_name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-secondary text-secondary" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground mt-3">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seller Information */}
        <div className="mb-12">
          <SellerInfo />
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <ChatBox />
    </div>
  );
};

export default ProductDetail;

