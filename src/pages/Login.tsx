import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, HelpCircle, Store } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContextMySQL";
import TermsModal from "@/components/TermsModal";
import ForgotPassword from "@/components/ForgotPassword";
import ForgotAccount from "@/components/ForgotAccount";
import categoryBooks from "@/assets/category-books.jpg";

type View = "login" | "forgotPassword" | "forgotAccount";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [view, setView] = useState<View>("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast.success("Login realizado com sucesso!");
        const redirectTo = (location.state as any)?.from?.pathname || "/";
        navigate(redirectTo);
      } else {
        toast.error("Credenciais inválidas. Verifique seu email e senha.");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Tratar conta bloqueada
      if (error?.blocked) {
        toast.error(error.message || "Sua conta está temporariamente bloqueada. Entre em contato com o administrador para saber os motivos.", {
          duration: 6000,
        });
        return;
      }
      
      // Tratar conta inativa
      if (error?.inactive) {
        toast.error(error.message || "Sua conta está inativa. Entre em contato com o administrador para reativá-la.", {
          duration: 6000,
        });
        return;
      }
      
      // Tratar diferentes tipos de erro
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('ERR_NAME_NOT_RESOLVED') ||
          error?.message?.includes('NetworkError')) {
        toast.error("Erro de conexão. Verifique sua internet e se o servidor está rodando.");
      } else if (error?.message?.includes('Credenciais') || 
                 error?.message?.includes('inválida') ||
                 error?.message?.includes('Invalid')) {
        toast.error(error.message || "Credenciais inválidas. Verifique seu email e senha.");
      } else {
        toast.error(error?.message || "Erro ao fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (view === "forgotPassword") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${categoryBooks})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80" />
        <div className="relative z-10 w-full">
          <ForgotPassword onBack={() => setView("login")} />
        </div>
      </div>
    );
  }

  if (view === "forgotAccount") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${categoryBooks})` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80" />
        <div className="relative z-10 w-full">
          <ForgotAccount onBack={() => setView("login")} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${categoryBooks})` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80" />
      <div className="relative z-10 w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1 text-center">
            {/* Logo e Nome da Loja */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Store className="h-8 w-8 text-primary" />
              <span className="text-2xl font-heading font-bold bg-gradient-hero bg-clip-text text-transparent">
                Papel & Pixel
              </span>
            </div>
            
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-heading font-bold bg-gradient-hero bg-clip-text text-transparent">
              Bem-vindo de volta!
            </CardTitle>
            <CardDescription>
              Entre na sua conta para continuar suas compras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="remember" className="rounded" />
                  <Label htmlFor="remember" className="cursor-pointer">
                    Lembrar-me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Termos
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-hero" 
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => setView("forgotPassword")}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Esqueci a senha
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => setView("forgotAccount")}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Esqueci a conta
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Criar conta
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
    </div>
  );
};

export default Login;
