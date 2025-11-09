import { Shield, Lock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const SecurityBadge = ({ type = "simple" }: { type?: "simple" | "detailed" }) => {
  if (type === "simple") {
    return (
      <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
        <Shield className="h-3 w-3 mr-1" />
        HTTPS Seguro
      </Badge>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              Compra 100% Segura
              <CheckCircle className="h-4 w-4 text-green-600" />
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Lock className="h-3 w-3 text-green-600" />
                Protocolo HTTPS - Dados criptografados
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-green-600" />
                Senhas protegidas com hash bcrypt
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                APIs seguras (M-Pesa, E-Mola, Talk)
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


