import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  category: string;
  inStock: boolean;
}

const ProductCard = ({ 
  id,
  name, 
  price, 
  originalPrice, 
  image, 
  rating, 
  category,
  inStock 
}: ProductCardProps) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inStock) {
      addItem({ id, name, price, originalPrice, image });
    }
  };

  const handleClick = () => {
    // Redirect to login if not logged in
    navigate(`/product/${id}`);
  };

  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 animate-scale-in" onClick={handleClick}>
      <div className="relative h-56 overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 bg-gradient-accent text-white border-0">
            -{discount}%
          </Badge>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Esgotado</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2">
          {category}
        </Badge>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(rating) ? "fill-secondary text-secondary" : "text-muted-foreground"
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">
            {rating > 0 ? rating.toFixed(1) : '(0)'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through block">
                {originalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
              </span>
            )}
            <span className="text-xl font-bold text-primary">
              {price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
            </span>
          </div>

          <Button 
            size="icon" 
            className="bg-gradient-accent hover:opacity-90 transition-opacity"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
