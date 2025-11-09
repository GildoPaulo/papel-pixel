import { Card, CardContent } from "@/components/ui/card";
import { Store, MapPin, Phone, Mail, Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SellerInfo = () => {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Store className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-heading font-bold">Informações do Vendedor</h3>
          <Badge className="bg-green-500 ml-auto">
            <CheckCircle className="h-3 w-3 mr-1" />
            Vendedor Verificado
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Nome Comercial */}
          <div>
            <p className="font-semibold text-sm text-muted-foreground mb-1">Nome Comercial</p>
            <p className="text-lg font-bold text-primary">Papel & Pixel</p>
          </div>

          {/* Localização */}
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-1">Localização Física</p>
              <p className="text-sm">Moçambique</p>
              <p className="text-xs text-muted-foreground mt-1">Comércio 100% online - Entrega em todo o país</p>
            </div>
          </div>

          {/* Contato Telefônico */}
          <div className="flex items-start gap-2">
            <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-1">Telefone</p>
              <a 
                href="tel:+258874383621" 
                className="text-sm hover:text-primary transition-colors"
              >
                +258 874383621
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-2">
            <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-1">E-mail</p>
              <a 
                href="mailto:atendimento@papelepixel.co.mz" 
                className="text-sm hover:text-primary transition-colors"
              >
                atendimento@papelepixel.co.mz
              </a>
            </div>
          </div>

          {/* Segurança */}
          <div className="flex items-start gap-2 pt-2 border-t">
            <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-1">Segurança</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                  <Shield className="h-3 w-3 mr-1" />
                  HTTPS Seguro
                </Badge>
                <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">
                  🔒 Dados Criptografados
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInfo;


