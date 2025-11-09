import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Bot, User, Phone, ShoppingBag, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./ProductCard";
import { useChatBot } from "@/contexts/ChatBotContext";
import { toast } from "sonner";

const ChatBox = () => {
  const { messages, sendMessage, clearMessages, isTyping } = useChatBot();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openWhatsApp = () => {
    const whatsappNumber = "258874383621";
    const message = encodeURIComponent("Olá! Preciso de ajuda com a Papel & Pixel.");
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const handleProductClick = (productId: string | number) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
    toast.success("Produto carregado!");
  };

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all animate-scale-in group"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] shadow-2xl animate-scale-in flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-5 w-5 text-primary animate-pulse" />
                <Sparkles className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <CardTitle className="text-base">Assistente IA</CardTitle>
              <Badge variant="outline" className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                IA Ativo
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={clearMessages}
                title="Limpar conversa"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "bot" 
                        ? "bg-gradient-to-br from-primary to-secondary text-white" 
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {message.sender === "bot" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`flex-1 space-y-2 ${message.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`rounded-lg p-3 ${
                        message.sender === "bot" 
                          ? "bg-muted" 
                          : "bg-primary text-primary-foreground"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString("pt-MZ", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </p>
                      </div>
                      
                      {/* Mostrar produtos sugeridos */}
                      {message.sender === "bot" && message.products && message.products.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">Produtos encontrados:</p>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {message.products.map((product) => (
                              <div
                                key={product.id}
                                onClick={() => handleProductClick(product.id)}
                                className="cursor-pointer p-2 bg-background border rounded-lg hover:bg-accent transition-colors group"
                              >
                                <div className="flex gap-3">
                                  {product.image && (
                                    <img 
                                      src={product.image} 
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {product.price?.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                                    </p>
                                  </div>
                                  <ShoppingBag className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex-1 rounded-lg p-3 bg-muted">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="border-t p-3 bg-muted/30 flex-shrink-0">
              <Button
                variant="outline"
                className="w-full mb-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                onClick={openWhatsApp}
              >
                <Phone className="h-4 w-4 mr-2" />
                Falar com Atendente
              </Button>
            </div>

            {/* Input Area */}
            <div className="border-t p-3 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Pergunte sobre produtos, preços, envio..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                  disabled={!input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                ✨ Exemplo: "Quero comprar um caderno azul" ou "Tens livros?"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBox;
