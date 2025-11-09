import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, User, Eye, EyeOff, Phone, Store } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContextMySQL";
import { validatePassword } from "@/utils/passwordValidation";
import { PasswordStrength } from "@/components/PasswordStrength";
import TermsModal from "@/components/TermsModal";
import PrivacyModal from "@/components/PrivacyModal";
import categoryStationery from "@/assets/category-stationery.jpg";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<any>({ isValid: false, errors: [], strength: 'weak' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    
    // Validar senha em tempo real
    if (e.target.name === 'password') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      setLoading(false);
      return;
    }

    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      toast.error("Senha não atende aos requisitos de segurança");
      toast.info(validation.errors[0]);
      setLoading(false);
      return;
    }

    try {
      const success = await register(formData.name, formData.email, formData.password);

      if (success) {
        toast.success("Conta criada com sucesso!");
        navigate("/");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.message || "Erro ao criar conta. Tente novamente.";
      
      // Mensagens de erro mais específicas
      if (errorMessage.includes('already registered') || errorMessage.includes('already exists') || errorMessage.includes('User already registered')) {
        toast.error("Este email já está cadastrado. Tente fazer login.");
      } else if (errorMessage.includes('password') || errorMessage.includes('Password')) {
        toast.error("Senha muito fraca. Use pelo menos 6 caracteres.");
      } else if (errorMessage.includes('Email rate limit') || errorMessage.includes('rate limit')) {
        toast.error("Muitas tentativas. Aguarde alguns minutos.");
      } else if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        toast.error("Erro de conexão. Verifique sua conexão com o Supabase.");
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        toast.error("Tempo excedido. O Supabase pode estar indisponível. Tente novamente mais tarde.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: `url(${categoryStationery})` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-primary/80" />
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
            
            <div className="mx-auto mb-4 p-3 bg-secondary/10 rounded-full w-fit">
              <User className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-3xl font-heading font-bold bg-gradient-hero bg-clip-text text-transparent">
              Crie sua conta
            </CardTitle>
            <CardDescription>
              Preencha os dados abaixo para se registrar
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
                    name="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleChange}
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
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (Opcional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+258 XX XXX XXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && (
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
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2 text-sm">
                <input type="checkbox" id="terms" className="mt-1 rounded" required />
                <Label htmlFor="terms" className="leading-relaxed cursor-pointer">
                  Aceito os{" "}
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Termos e Condições
                  </button>{" "}
                  e a{" "}
                  <button
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Política de Privacidade
                  </button>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-accent"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </div>
  );
};

export default Register;
