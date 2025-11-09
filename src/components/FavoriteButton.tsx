import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FavoriteButton({ product, size = 'md', className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await toggleFavorite(product);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        sizeClasses[size],
        'rounded-full hover:bg-white/90 transition-all',
        favorite && 'text-red-500 hover:text-red-600',
        className
      )}
      onClick={handleClick}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          'transition-all',
          favorite && 'fill-current'
        )}
      />
    </Button>
  );
}

