import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  productsCount: number;
  category?: string; // Adicionar prop para a categoria
}

const CategoryCard = ({ title, description, image, productsCount, category }: CategoryCardProps) => {
  return (
    <Link to={`/products${category ? `?category=${category}` : ''}`} className="block">
      <Card className="group cursor-pointer overflow-hidden border-2 hover:border-primary transition-all duration-300 hover:shadow-lg animate-scale-in">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-heading font-bold text-xl mb-1">
              {title}
            </h3>
            <p className="text-white/80 text-sm">{productsCount} produtos</p>
          </div>
        </div>
        
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm mb-3">{description}</p>
          <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
            <span>Ver todos</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
