import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar se usuário já aceitou cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Cookie className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Uso de Cookies</CardTitle>
          </div>
          <CardDescription>
            Este site utiliza cookies para melhorar sua experiência de navegação e analisar o tráfego do site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Ao continuar navegando, você concorda com o uso de cookies. Para mais informações, consulte nossa{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAccept} className="flex-1 bg-gradient-hero">
              Aceitar Todos os Cookies
            </Button>
            <Button onClick={handleDecline} variant="outline" className="flex-1">
              Recusar
            </Button>
            <Link to="/privacy">
              <Button variant="ghost">Saber Mais</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;

