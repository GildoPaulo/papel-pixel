import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WhatsAppButton = () => {
  const whatsappNumber = "258874383621";
  const message = encodeURIComponent("👋 Olá! Bem-vindo à PixelStore. Em que posso ajudar hoje?");
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 animate-scale-in"
    >
      <Button
        size="lg"
        className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] shadow-lg hover:shadow-xl transition-all"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    </a>
  );
};

export default WhatsAppButton;
