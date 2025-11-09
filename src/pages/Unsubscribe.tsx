import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se veio via link do email
    const emailFromUrl = searchParams.get("email");
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
    }

    if (successParam === "true") {
      setSuccess(true);
      setEmail(searchParams.get("email") || "");
    }

    if (errorParam) {
      const errorMessages: { [key: string]: string } = {
        invalid: "Email inválido",
        notfound: "Este email não está inscrito na nossa newsletter",
        server: "Erro no servidor. Tente novamente mais tarde."
      };
      setError(errorMessages[errorParam] || "Erro desconhecido");
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Digite seu email");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/subscribers/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        toast.success(data.message || "Inscrição cancelada com sucesso!");
      } else {
        setError(data.error || "Erro ao cancelar inscrição");
        toast.error(data.error || "Erro ao cancelar inscrição");
      }
    } catch (error: any) {
      console.error("Erro ao cancelar inscrição:", error);
      setError("Erro ao conectar com o servidor");
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {success ? (
              <>
                <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Inscrição Cancelada</CardTitle>
                <CardDescription>
                  Você foi removido da nossa lista de newsletter
                </CardDescription>
              </>
            ) : error ? (
              <>
                <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-full w-fit">
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl">Erro</CardTitle>
                <CardDescription className="text-destructive">
                  {error}
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Mail className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Cancelar Inscrição</CardTitle>
                <CardDescription>
                  Digite seu email para cancelar o recebimento de nossos emails promocionais
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="space-y-4 text-center">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Email:</strong> {email}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Você não receberá mais nossos emails promocionais.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : error && error.includes("não está inscrito") ? (
              <div className="space-y-4 text-center">
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {error}
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/")}
                  className="w-full"
                >
                  Voltar para a Página Inicial
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUnsubscribe} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
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
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && !error.includes("não está inscrito") && (
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Cancelando..." : "Cancelar Inscrição"}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => navigate("/")}
                    className="text-sm"
                  >
                    Voltar para a Página Inicial
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Unsubscribe;

