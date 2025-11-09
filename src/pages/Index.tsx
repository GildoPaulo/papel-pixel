import Hero from "@/components/Hero";
import Header from "@/components/Header";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import ProductCarousel from "@/components/ProductCarousel";
import NewsletterSignup from "@/components/NewsletterSignup";
import ChatBox from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductsContextMySQL";

import categoryBooks from "@/assets/category-books.jpg";
import categoryMagazines from "@/assets/category-magazines.jpg";
import categoryStationery from "@/assets/category-stationery.jpg";

const Index = () => {
  const { products } = useProducts();
  
  // Produtos em DESTAQUE (do banco)
  const featuredProducts = products
    .filter(p => p.isFeatured)
    .slice(0, 4)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image || categoryStationery,
      rating: p.avg_rating || 0,
      category: p.category,
      inStock: p.stock > 0
    }));

  // Produtos em PROMOÇÃO (do banco)
  const promotionalProducts = products
    .filter(p => p.isPromotion)
    .slice(0, 4)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image || categoryStationery,
      rating: p.avg_rating || 0,
      category: p.category,
      inStock: p.stock > 0
    }));

  // MAIS VENDIDOS (simulado - ordem por estoque vendido)
  const bestSellers = products
    .filter(p => p.stock > 0)
    .sort((a, b) => b.stock - a.stock) // Ordenar por estoque (simulando vendas)
    .slice(0, 4)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.image || categoryStationery,
      rating: p.avg_rating || 0,
      category: p.category,
      inStock: true
    }));

  const categories = [
    {
      title: "Livros & E-books",
      description: "Explore nossa vasta coleção de literatura, ficção, não-ficção e muito mais",
      image: categoryBooks,
      productsCount: 1240,
      category: "livros"
    },
    {
      title: "Revistas",
      description: "As últimas edições de revistas de tecnologia, moda, entretenimento e lifestyle",
      image: categoryMagazines,
      productsCount: 380,
      category: "revistas"
    },
    {
      title: "Papelaria Premium",
      description: "Cadernos, canetas, marcadores e acessórios de alta qualidade",
      image: categoryStationery,
      productsCount: 520,
      category: "papelaria"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />

        {/* Categorias Section */}
        <section id="categorias" className="container py-6 scroll-mt-20">
          <div className="text-center mb-4 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
              Nossas Categorias
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre exatamente o que você procura
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section id="produtos" className="container py-6 scroll-mt-20">
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <h2 className="text-2xl md:text-3xl font-heading font-bold">
                  Produtos em Destaque
                </h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Os produtos mais populares e com as melhores ofertas
              </p>
            </div>
              <Button variant="outline" size="sm" className="hidden md:flex" asChild>
                <Link to="/products">Ver todos</Link>
              </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-accent md:hidden" asChild>
              <Link to="/products">Ver todos os produtos</Link>
            </Button>
          </div>
        </section>

        {/* Promo Banner */}
        <section className="container py-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-6 md:p-10 text-white animate-scale-in">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Promoção de Lançamento
              </h2>
              <p className="text-lg text-white/90 mb-6">
                Até 40% de desconto em produtos selecionados. Aproveite enquanto durar o estoque!
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/promotions">
                Ver promoções
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        <section className="container py-6">
          <div className="flex items-center justify-between mb-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-secondary" />
              <h2 className="text-2xl md:text-3xl font-heading font-bold">
                Mais Vendidos
              </h2>
            </div>
            <Button variant="outline" className="hidden md:flex" asChild>
              <Link to="/products">Ver todos</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-accent md:hidden" asChild>
              <Link to="/products">Ver todos os produtos</Link>
            </Button>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="container py-6">
          <NewsletterSignup />
        </section>

        {/* Call to Action */}
        <section className="container py-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-accent p-6 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3">
              Pronto para começar sua jornada?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Explore nossa vasta coleção de livros, revistas e papelaria premium. 
              Entrega grátis para compras acima de 500 MZN.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/products">
                  Ver Produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Entrar em Contato
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatBox />
    </div>
  );
};

export default Index;
