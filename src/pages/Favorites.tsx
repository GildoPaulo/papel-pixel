import { useFavorites } from '@/contexts/FavoritesContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ShoppingCart, Trash2, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Favorites() {
  const { favorites, loading, toggleFavorite } = useFavorites();
  const { addItem } = useCart();

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success('Produto adicionado ao carrinho!');
  };

  const handleShare = () => {
    const url = `${window.location.origin}/favorites/shared`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado para área de transferência!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <div className="text-center">Carregando favoritos...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Meus Favoritos</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>
          {favorites.length > 0 && (
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Lista
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Nenhum favorito ainda</h2>
              <p className="text-muted-foreground mb-6 text-center">
                Adicione produtos aos favoritos para vê-los aqui
              </p>
              <Button onClick={() => window.location.href = '/products'}>
                Ver Produtos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500"
                    onClick={() => toggleFavorite(product)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {product.price.toLocaleString('pt-MZ', {
                      style: 'currency',
                      currency: 'MZN'
                    })}
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

