import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show banner after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 animate-slide-up">
      <div className="relative bg-gradient-school text-white rounded-xl shadow-2xl overflow-hidden p-6">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 rounded-full p-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Promoção Especial!</h3>
            <p className="text-sm text-white/90">Volta às Aulas</p>
          </div>
        </div>

        <p className="text-sm mb-4 text-white/90">
          <strong className="text-white text-base">30% OFF</strong> em materiais escolares!
          Cadernos, canetas, mochilas e muito mais.
        </p>

        <Button
          onClick={() => {
            navigate("/promotions");
            setIsVisible(false);
          }}
          variant="secondary"
          className="w-full"
          size="sm"
        >
          Ver Ofertas
        </Button>

        <p className="text-xs text-white/70 mt-3 text-center">
          ⚡ Oferta válida por tempo limitado
        </p>
      </div>
    </div>
  );
};

export default PromoBanner;













