import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatBox from "@/components/ChatBox";
import ProductCard from "@/components/ProductCard";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/contexts/ProductsContextMySQL";

import categoryBooks from "@/assets/category-books.jpg";
import categoryMagazines from "@/assets/category-magazines.jpg";
import categoryStationery from "@/assets/category-stationery.jpg";

const Products = () => {
  const { products, loading } = useProducts();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    window.scrollTo(0, 0);
    // Atualizar searchQuery quando o parâmetro da URL mudar
    const urlSearch = searchParams.get("search") || "";
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // Map products from database to ProductCard format
  const allProducts = products.map(product => {
    let img = product.image || categoryBooks;
    
    // Se é URL relativa (/uploads/...), tornar absoluta
    if (img && typeof img === 'string') {
      if (img.startsWith('/uploads')) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
        img = `${baseUrl}${img}`;
      }
      // Se é base64 muito longo (>10000 chars), usar fallback
      else if (img.startsWith('data:image') && img.length > 10000) {
        console.warn('⚠️ [PRODUCTS] Imagem base64 muito longa, usando fallback:', product.id);
        img = categoryBooks; // Usar imagem padrão
      }
      // Se é base64 válido, usar direto
      else if (img.startsWith('data:image')) {
        img = img; // Manter base64
      }
    }
    
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: img,
      rating: product.avg_rating || 0, // Rating dinâmico baseado em avaliações reais
      category: product.category,
      inStock: product.stock > 0,
      description: product.description
    };
  });

  const categories = ["all", "Livros", "Revistas", "Papelaria"];

  // Busca semântica melhorada
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return allProducts.filter((product) => 
        selectedCategory === "all" || product.category === selectedCategory
      );
    }

    // Importar busca semântica dinamicamente
    let searchResults: any[] = [];
    try {
      const { semanticSearch } = require('@/utils/productSearch');
      searchResults = semanticSearch(searchQuery, allProducts, {
        threshold: 0.2,
        limit: 100,
      });
    } catch (e) {
      console.warn('Busca semântica não disponível, usando busca simples');
    }

    let results = searchResults.length > 0
      ? searchResults.map(r => r.product).filter((product: any) => 
          selectedCategory === "all" || product.category === selectedCategory
        )
      : [];

    // Fallback para busca simples se semântica não encontrar
    if (results.length === 0) {
      return allProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
    }

    return results;
  }, [searchQuery, selectedCategory, allProducts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-white py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Nossos Produtos
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Explore nossa vasta coleção de livros, revistas e papelaria premium
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="container py-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex-1 flex gap-4 w-full">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Livros">Livros</SelectItem>
                  <SelectItem value="Revistas">Revistas</SelectItem>
                  <SelectItem value="Papelaria">Papelaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Carregando produtos...</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
                : "grid-cols-1"
            }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhum produto encontrado. Tente outra busca.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <ChatBox />
    </div>
  );
};

export default Products;


