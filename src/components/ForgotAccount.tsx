import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, ArrowLeft, CheckCircle, Store } from "lucide-react";
import { toast } from "sonner";

interface ForgotAccountProps {
  onBack: () => void;
}

const ForgotAccount = ({ onBack }: ForgotAccountProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock account recovery
    setTimeout(() => {
      toast.success("E-mail de recuperação enviado!");
      setSent(true);
      setLoading(false);
    }, 1000);
  };

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Store className="h-8 w-8 text-primary" />
            <span className="text-2xl font-heading font-bold bg-gradient-hero bg-clip-text text-transparent">
              Papel & Pixel
            </span>
          </div>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-heading font-bold">E-mail Enviado!</CardTitle>
          <CardDescription>
            Enviamos as instruções para recuperar sua conta para o e-mail informado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Login
          </Button>
        </CardContent>
      </Card>
    </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Store className="h-8 w-8 text-primary" />
          <span className="text-2xl font-heading font-bold bg-gradient-hero bg-clip-text text-transparent">
            Papel & Pixel
          </span>
        </div>
        <CardTitle className="text-2xl font-heading font-bold">Recuperar Conta</CardTitle>
        <CardDescription>
          Digite seu nome e e-mail para recuperar sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-hero" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Instruções"}
          </Button>
        </form>

        <Button variant="ghost" onClick={onBack} className="w-full mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Login
        </Button>
      </CardContent>
    </Card>
    </div>
  );
};

export default ForgotAccount;

