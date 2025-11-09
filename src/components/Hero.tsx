import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Percent } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import categoryBooks from "@/assets/category-books.jpg";
import categoryMagazines from "@/assets/category-magazines.jpg";
import categoryStationery from "@/assets/category-stationery.jpg";
import { useProducts } from "@/contexts/ProductsContextMySQL";

const Hero = () => {
  const { products } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Buscar promoções especiais (produtos com >20% desconto)
  const promotionalProducts = products
    .filter(p => p.isPromotion && p.originalPrice)
    .map(p => {
      const discount = p.originalPrice 
        ? ((p.originalPrice - p.price) / p.originalPrice) * 100
        : 0;
      return { ...p, discount };
    })
    .filter(p => p.discount > 20) // Só promoções com mais de 20%
    .sort((a, b) => b.discount - a.discount);
  
  // Preparar slides na ordem correta
  const slides = [];
  
  // 1. SEMPRE PRIMEIRO: Imagem padrão "Bem-vindo"
  slides.push({
    type: 'message',
    title: "Bem-vindo à Papel & Pixel!",
    subtitle: "Materiais de qualidade para sua educação",
    image: heroBanner
  });
  
  // 2. SEMPRE SEGUNDO E TERCEIRO: Duas imagens antigas
  const defaultMessages = [
    "Tudo para sua Educação",
    "Materiais de Qualidade"
  ];
  const defaultImages = [categoryStationery, categoryBooks];
  
  defaultMessages.forEach((msg, idx) => {
    slides.push({
      type: 'message',
      title: msg,
      subtitle: "Materiais escolares de qualidade",
      image: defaultImages[idx]
    });
  });
  
  // 3. POR FIM: Até 3 promoções
  if (promotionalProducts.length > 0) {
    promotionalProducts.slice(0, 3).forEach(product => {
      slides.push({
        type: 'promotion',
        product,
        title: product.name,
        subtitle: `Economia de ${Math.round(product.discount)}%`,
        image: product.image || categoryStationery
      });
    });
  }

  useEffect(() => {
    if (slides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // Alterna a cada 5 segundos

    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[currentIndex] || (slides.length > 0 ? slides[0] : null);
  
  if (!currentSlide) {
    return null; // Evitar erro se slides estiver vazio
  }

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center py-6 lg:py-8">
          {/* Content */}
          <div className="text-white space-y-4 animate-fade-in">
            {currentSlide.type === 'promotion' ? (
              <>
                <div className="inline-flex items-center gap-2 bg-orange-500/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm border border-orange-400">
                  <Percent className="h-4 w-4" />
                  <span className="font-bold">🔥 PROMOÇÃO ESPECIAL!</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold leading-tight">
                  {currentSlide.title}
                </h1>
                
                <div className="flex items-center gap-4">
                  {currentSlide.product.originalPrice && (
                    <span className="text-2xl text-white/60 line-through">
                      {currentSlide.product.originalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-orange-300">
                    {currentSlide.product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                  </span>
                  <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-bold">
                    -{Math.round(currentSlide.product.discount)}% OFF
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button size="lg" variant="secondary" className="group" asChild>
                    <a href={`/product/${currentSlide.product.id}`}>
                      Comprar Agora
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                    <a href="/promotions">Ver todas promoções</a>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                  <Truck className="h-4 w-4" />
                  <span>🚚 Frete grátis acima de 500 MZN</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold leading-tight">
                  {currentSlide.title}
                </h1>
                
                <p className="text-base md:text-lg text-white/90 max-w-lg">
                  Materiais escolares de qualidade, livros educativos, cadernos premium e muito mais. 
                  Entrega em todo Moçambique!
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button size="lg" variant="secondary" className="group" asChild>
                    <a href="#produtos">
                      Explorar produtos
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                    <a href="#categorias">Ver categorias</a>
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Image - Fixed height container */}
          <div className="relative animate-slide-up h-[350px]">
            <div className="absolute inset-0 bg-gradient-accent opacity-20 rounded-3xl blur-3xl" />
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="relative rounded-3xl shadow-2xl w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
