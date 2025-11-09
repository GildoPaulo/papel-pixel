import { Store, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Target, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Footer = () => {
  const employees = [
    "Gildo Paulo Correia Victor",
    "Armando da Maria Mendes",
    "Ozley Bata",
    "Crimilda Marcos Manuel"
  ];

  return (
    <footer className="bg-card border-t mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Store className="h-6 w-6 text-primary" />
              <span className="text-xl font-heading font-bold bg-gradient-hero bg-clip-text text-transparent">
                Papel & Pixel
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              Oferecendo produtos de qualidade e conteúdo educativo e criativo.
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="outline">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-heading font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contato</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Produtos</Link></li>
              <li><Link to="/promotions" className="hover:text-primary transition-colors">Promoções</Link></li>
            </ul>
          </div>

          {/* Suporte e Políticas */}
          <div>
            <h3 className="font-heading font-bold mb-4">Políticas</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/return-policy" className="hover:text-primary transition-colors">Política de Devolução</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Termos e Condições</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacidade</Link></li>
            </ul>
          </div>

          {/* Nossa Empresa */}
          <div>
            <h3 className="font-heading font-bold mb-4">Nossa Empresa</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Target className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Missão:</strong> Oferecer produtos de qualidade e conteúdo educativo e criativo.
                </div>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Eye className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Visão:</strong> Ser referência em inovação e confiabilidade no comércio digital.
                </div>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Heart className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <strong className="text-foreground">Valores:</strong> Transparência, confiança e qualidade.
                </div>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-heading font-bold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Moçambique</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+258874383621" className="hover:text-primary transition-colors">
                  +258 874383621
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:suporte.papelepixel@outlook.com" className="hover:text-primary transition-colors">
                  suporte.papelepixel@outlook.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Equipe */}
        <div className="mt-8 pt-8 border-t">
          <div className="mb-4">
            <h3 className="font-heading font-bold mb-3">Nossa Equipe</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {employees.map((emp, idx) => (
                <div key={idx} className="text-muted-foreground">
                  {emp}
                </div>
              ))}
            </div>
          </div>
        </div>

            {/* Newsletter */}
            <div className="mt-8 pt-8 border-t">
              <div className="max-w-md mx-auto">
                <h3 className="font-heading font-bold mb-2 text-center">Receba nossas novidades</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Inscreva-se para receber ofertas exclusivas e novidades
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Seu e-mail" type="email" id="newsletter-email" />
                  <Button className="bg-gradient-accent" onClick={() => {
                    const email = (document.getElementById("newsletter-email") as HTMLInputElement)?.value;
                    if (email) {
                      // Email será capturado no componente NewsletterSignup
                      alert("Obrigado! Você será notificado sobre nossas promoções!");
                    }
                  }}>Inscrever</Button>
                </div>
              </div>
            </div>

        {/* Payment info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            💳 Aceitamos: PayPal, M-Pesa, Visa/Mastercard, Transferência Bancária e Dinheiro na Entrega
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            🚚 Frete grátis acima de 500 MZN
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2025 Papel & Pixel Store. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
