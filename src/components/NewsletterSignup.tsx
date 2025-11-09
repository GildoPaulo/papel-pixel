import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

const NewsletterSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!name.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }

    if (!email.trim()) {
      toast.error("Por favor, digite seu email");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Email inválido");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/subscribers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim()
        }),
      });

      const data = await response.json();

      if (response.ok || response.status === 200) {
        toast.success(data.message || "Inscrição realizada com sucesso! Você receberá nossas promoções.");
        setEmail("");
        setName("");
      } else {
        toast.error(data.error || "Erro ao se inscrever. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao inscrever na newsletter:", error);
      toast.error("Erro ao se inscrever. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-bold text-lg">Receba nossas novidades</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Inscreva-se para receber ofertas exclusivas e novidades em primeira mão!
        </p>
        <form onSubmit={handleSubscribe} className="space-y-2">
          <Input
            placeholder="Seu nome"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-gray-900 placeholder:text-gray-500"
            disabled={loading}
            required
          />
          <div className="flex gap-2">
            <Input
              placeholder="Seu e-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 text-gray-900 placeholder:text-gray-500"
              disabled={loading}
              required
            />
            <Button
              type="submit"
              className="bg-gradient-accent"
              disabled={loading || !email.trim() || !name.trim()}
            >
              {loading ? "Inscrevendo..." : "Inscrever"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsletterSignup;
