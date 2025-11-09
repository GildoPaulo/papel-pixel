import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBox from "@/components/ChatBox";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timer, Percent, Truck, Sparkles, Star } from "lucide-react";
import { useProducts } from "@/contexts/ProductsContextMySQL";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const Promotions = () => {
  const { products } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Buscar produtos em promoção e destacados
    const promotional = products
      .filter(p => p.isPromotion && p.originalPrice)
      .map(p => {
        const discount = p.originalPrice
          ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
          : 0;
        return { ...p, discount, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() };
      })
      .sort((a, b) => b.discount - a.discount);

    const featured = products
      .filter(p => p.isFeatured)
      .slice(0, 99); // Até 99 produtos em destaque

    setFeaturedProducts([...promotional, ...featured]);
  }, [products]);

  // Calcular dias restantes
  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Separar produtos em promoção e destacados
  const promotionalProducts = featuredProducts.filter(p => p.isPromotion && p.discount);
  const featuredOnly = featuredProducts.filter(p => p.isFeatured && !p.isPromotion);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-accent text-white py-16">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <Percent className="h-8 w-8" />
              <h1 className="text-4xl md:text-5xl font-heading font-bold">
                Promoções e Descontos
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl">
              Aproveite nossas melhores ofertas! Economia real em produtos de qualidade
            </p>
          </div>
        </section>

        {/* Carrossel Principal de Promoções Dinâmico */}
        {promotionalProducts.length > 0 && (
          <section className="container py-8">
            <Carousel 
              className="w-full" 
              opts={{ 
                loop: true, 
                align: "start",
                skipSnaps: false
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {promotionalProducts.slice(0, 10).map((product, index) => {
                  const daysRemaining = getDaysRemaining(product.endDate);
                  
                  return (
                    <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full">
                      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 text-white min-h-[400px] flex items-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                        <div className="relative z-10 w-full">
                          <div className="grid md:grid-cols-2 gap-8 items-center">
                            {/* Imagem do Produto */}
                            <div className="relative">
                              <div className="aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm">
                                <img 
                                  src={product.image || '/placeholder-product.jpg'} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* Badge de desconto na imagem */}
                              <div className="absolute top-4 right-4">
                                <Badge className="bg-red-600 text-white border-0 text-2xl px-6 py-3">
                                  -{product.discount}% OFF
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Informações da Promoção */}
                            <div className="text-center md:text-left">
                              <div className="mb-4">
                                <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                                  OFERTA ESPECIAL #{index + 1}
                </Badge>
              </div>
                              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
                                {product.name}
              </h2>
                              <p className="text-xl text-white/90 mb-6">
                                {product.description?.substring(0, 150) || 
                                 `Economize ${product.discount}% em ${product.name}! Produto de alta qualidade com garantia.`}
                                {product.description && product.description.length > 150 && '...'}
                              </p>
                              
                              {/* Preços */}
                              <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
                                {product.originalPrice && (
                                  <span className="text-2xl line-through text-white/60">
                                    {product.originalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                  </span>
                                )}
                                <span className="text-4xl font-bold">
                                  {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                </span>
                              </div>
                              
                              {/* Features */}
                              <div className="flex items-center justify-center md:justify-start gap-4 mb-6 flex-wrap">
                                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                  <Truck className="h-5 w-5" />
                                  <span className="font-semibold">Frete Grátis</span>
                                </div>
                                {daysRemaining > 0 && (
                                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Timer className="h-5 w-5" />
                                    <span className="font-semibold">
                                      {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"} restantes
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* CTA Button */}
                              <div className="flex justify-center md:justify-start">
                                <Button 
                                  size="lg"
                                  className="bg-white text-primary hover:bg-white/90"
                                  onClick={() => window.location.href = `/product/${product.id}`}
                                >
                                  Comprar Agora
                                </Button>
                              </div>
                              
                              {/* Stock info */}
                              <p className="text-sm text-white/80 mt-4 text-center md:text-left">
                                {product.stock > 0 ? (
                                  <span className="flex items-center justify-center md:justify-start gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    {product.stock} unidades disponíveis
                                  </span>
                                ) : (
                                  <span className="text-red-200">Fora de estoque</span>
                                )}
                </p>
              </div>
            </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-12 bg-white/10 hover:bg-white/20 text-white border-white/20" />
              <CarouselNext className="hidden md:flex -right-12 bg-white/10 hover:bg-white/20 text-white border-white/20" />
            </Carousel>
            
            {/* Indicadores de slide */}
            <div className="flex justify-center gap-2 mt-4">
              {promotionalProducts.slice(0, 10).map((_, index) => (
                <div 
                  key={index}
                  className="h-2 w-2 rounded-full bg-primary/30"
                />
              ))}
          </div>
        </section>
        )}

        {/* Grid de Produtos em Promoção (secundário) */}
        {promotionalProducts.length > 10 && (
        <section className="container py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl md:text-4xl font-heading font-bold">
                🔥 Mais Promoções
          </h2>
              <Badge className="bg-gradient-accent text-white text-lg px-4 py-2">
                +{promotionalProducts.length - 10} produtos em promoção
              </Badge>
            </div>

            <Carousel className="w-full" opts={{ loop: true, align: "start" }}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {promotionalProducts.slice(10).map((product) => {
              const daysRemaining = getDaysRemaining(product.endDate);
              
              return (
                    <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                      <div className="relative">
                        {/* Badge de desconto grande */}
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-red-600 text-white border-0 text-lg px-4 py-2">
                            -{product.discount}% OFF
                          </Badge>
                        </div>
                  {daysRemaining > 0 && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-orange-500 text-white border-0">
                        <Timer className="h-3 w-3 mr-1" />
                        {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
                      </Badge>
                    </div>
                        )}
                        <ProductCard 
                          id={product.id.toString()}
                          name={product.name}
                          price={product.price}
                          originalPrice={product.originalPrice}
                          image={product.image || '/placeholder.jpg'}
                          rating={5}
                          category={product.category}
                          inStock={product.stock > 0}
                        />
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </section>
        )}

        {/* Produtos em Destaque - Grid */}
        {featuredOnly.length > 0 && (
          <section className="container py-12 bg-muted/30 rounded-3xl mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                  Produtos em Destaque
                </h2>
                <p className="text-muted-foreground">
                  {featuredOnly.length} produtos selecionados especialmente para você
                </p>
              </div>
              <Badge className="bg-primary text-white text-lg px-4 py-2">
                {featuredOnly.length} produtos
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {featuredOnly.slice(0, 99).map((product) => (
                <div key={product.id} className="relative">
                  <ProductCard
                    id={product.id.toString()}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image || '/placeholder.jpg'}
                    rating={5}
                    category={product.category}
                    inStock={product.stock > 0}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Anúncio de Frete Grátis */}
        <section className="container py-12">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-4 rounded-full">
                    <Truck className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-heading font-bold mb-2">
                      Frete Grátis
                    </h3>
                    <p className="text-xl text-white/90">
                      Para compras acima de 500 MZN em todo Moçambique!
                    </p>
                  </div>
                </div>
                <Button size="lg" variant="secondary" className="text-green-600 font-bold">
                  Aproveitar Agora
                </Button>
          </div>
            </CardContent>
          </Card>
        </section>

        {/* Informações */}
        <section className="container py-12">
          <div className="bg-card rounded-2xl border p-8">
            <h3 className="text-2xl font-heading font-bold mb-4">
              Como funcionam nossas promoções?
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="font-bold text-primary">✓</span>
                <span>Descontos são aplicados diretamente no preço final</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-primary">✓</span>
                <span>Promoções são válidas enquanto durar o estoque</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-primary">✓</span>
                <span>Produtos podem sair de promoção a qualquer momento</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-primary">✓</span>
                <span>Entrega grátis para compras acima de 500 MZN</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-primary">✓</span>
                <span>Garantia de qualidade em todos os produtos</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
      <ChatBox />
    </div>
  );
};

export default Promotions;
