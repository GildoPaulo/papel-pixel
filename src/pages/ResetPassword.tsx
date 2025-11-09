import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, ArrowLeft, Store } from "lucide-react";
import { toast } from "sonner";
import { validatePassword } from "@/utils/passwordValidation";
import { PasswordStrength } from "@/components/PasswordStrength";
import { API_URL } from "@/config/api";
import categoryBooks from "@/assets/category-books.jpg";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<any>({ isValid: false, errors: [], strength: 'weak' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !email) {
      toast.error('Link inválido ou expirado');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast.error('Senha não atende aos requisitos de segurança');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/password-reset/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Senha redefinida com sucesso!');
        navigate('/login');
      } else {
        toast.error(data.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

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
              Redefinir Senha
            </CardTitle>
            <CardDescription>
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {email && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      const validation = validatePassword(e.target.value);
                      setPasswordValidation(validation);
                    }}
                    required
                    className="pl-10"
                    placeholder="Digite sua nova senha"
                  />
                </div>
                {password && (
                  <div className="mt-2">
                    <PasswordStrength strength={passwordValidation.strength} />
                    {passwordValidation.errors.length > 0 && (
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                        {passwordValidation.errors.map((error: string, idx: number) => (
                          <li key={idx}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-gradient-accent" disabled={loading}>
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
