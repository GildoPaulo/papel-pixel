import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductCarouselProps {
  products: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    category: string;
    inStock: boolean;
  }>;
}

const ProductCarousel = ({ products }: ProductCarouselProps) => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
    e.stopPropagation();
    if (product.inStock) {
      addItem({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        originalPrice: product.originalPrice, 
        image: product.image 
      });
    }
  };

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };
  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product) => {
            const discount = product.originalPrice 
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
              : 0;

            return (
              <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300" onClick={() => handleProductClick(product.id)}>
                  <div className="relative h-56 overflow-hidden bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {discount > 0 && (
                      <Badge className="absolute top-3 right-3 bg-gradient-accent text-white border-0">
                        -{discount}%
                      </Badge>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Esgotado</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {product.category}
                    </Badge>
                    
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {product.rating > 0 ? product.rating.toFixed(1) : '(0)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through block">
                            {product.originalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                          </span>
                        )}
                        <span className="text-xl font-bold text-primary">
                          {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                        </span>
                      </div>

                      <Button 
                        size="icon" 
                        className="bg-gradient-accent hover:opacity-90 transition-opacity"
                        disabled={!product.inStock}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default ProductCarousel;


