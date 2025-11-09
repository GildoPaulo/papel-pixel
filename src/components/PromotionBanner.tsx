import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Percent } from 'lucide-react';
import { Countdown } from './Countdown';

interface PromotionBannerProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    endDate?: string;
  };
}

export function PromotionBanner({ product }: PromotionBannerProps) {
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center py-6 lg:py-8">
      {/* Content */}
      <div className="text-white space-y-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-orange-500/30 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
          <Percent className="h-4 w-4" />
          <span className="font-bold">🔥 PROMOÇÃO ESPECIAL!</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold leading-tight">
          {product.name}
        </h1>
        
        <div className="flex items-center gap-4">
          {product.originalPrice && (
            <span className="text-2xl text-white/60 line-through">
              {product.originalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
            </span>
          )}
          <span className="text-4xl font-bold text-orange-300">
            {product.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
          </span>
          {product.originalPrice && (
            <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-bold">
              -{discount}% OFF
            </span>
          )}
        </div>

        {product.endDate && (
          <Countdown endDate={product.endDate} />
        )}
        
        <div className="flex flex-wrap gap-3 pt-2">
          <Button size="lg" variant="secondary" className="group" asChild>
            <Link to={`/product/${product.id}`}>
              Comprar Agora
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
            <Link to="/promotions">Ver todas promoções</Link>
          </Button>
        </div>
      </div>

      {/* Image */}
      <div className="relative animate-slide-up h-[350px]">
        <div className="absolute inset-0 bg-gradient-accent opacity-20 rounded-3xl blur-3xl" />
        <img
          src={product.image}
          alt={product.name}
          className="relative rounded-3xl shadow-2xl w-full h-full object-cover"
        />
      </div>
    </div>
  );
}



