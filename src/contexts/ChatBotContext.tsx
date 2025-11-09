import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useProducts } from '@/contexts/ProductsContextMySQL';
import { detectIntent, extractEntities } from '@/utils/nlp';
import { semanticSearch } from '@/utils/productSearch';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  products?: any[];
  intent?: string;
}

interface ChatBotContextType {
  messages: Message[];
  sendMessage: (text: string) => void;
  clearMessages: () => void;
  isTyping: boolean;
}

const ChatBotContext = createContext<ChatBotContextType | undefined>(undefined);

export function ChatBotProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o assistente virtual da Papel & Pixel. 😊\n\nPosso ajudar você a:\n• Encontrar produtos\n• Informações sobre preços e promoções\n• Dúvidas sobre envio e pagamento\n\nO que você está procurando hoje?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const generateResponse = useCallback((userMessage: string): { text: string; products?: any[] } => {
    const intent = detectIntent(userMessage);
    const entities = extractEntities(userMessage);

    // Intenção: COMPRAR / PROCURAR PRODUTO
    if (intent.type === 'purchase' || intent.type === 'search' || entities.productType) {
      // Buscar produtos relevantes
      const searchQuery = userMessage;
      const searchResults = semanticSearch(searchQuery, products, {
        threshold: 0.2,
        limit: 5,
      });

      if (searchResults.length > 0) {
        const topProducts = searchResults.slice(0, 3).map(r => r.product);
        
        let responseText = '';
        if (entities.productType) {
          responseText = `Encontrei ${searchResults.length} produto(s) relacionado(s) a "${entities.productType}"`;
        } else {
          responseText = `Encontrei ${searchResults.length} produto(s) que podem interessar você:`;
        }

        if (entities.color) {
          responseText += ` na cor ${entities.color}`;
        }
        if (entities.size) {
          responseText += ` no tamanho ${entities.size}`;
        }
        responseText += ':\n\n';

        return {
          text: responseText,
          products: topProducts,
        };
      } else {
        return {
          text: `Desculpe, não encontrei produtos que correspondam a "${userMessage}".\n\nPosso ajudar você de outras formas:\n• Ver todos os produtos disponíveis\n• Informações sobre categorias\n• Falar com um atendente\n\nO que prefere?`,
        };
      }
    }

    // Intenção: GREETING (Cumprimentos)
    if (intent.type === 'greeting') {
      return {
        text: 'Olá! 😊 Bem-vindo à Papel & Pixel!\n\nComo posso ajudá-lo hoje? Posso:\n\n📚 Mostrar produtos\n💰 Informar preços e promoções\n🚚 Esclarecer dúvidas sobre envio\n💳 Explicar formas de pagamento\n\nO que você gostaria de saber?',
      };
    }

    // Intenção: PERGUNTA SOBRE PREÇOS
    if (userMessage.toLowerCase().includes('preço') || userMessage.toLowerCase().includes('quanto custa')) {
      return {
        text: '💰 Informações de Preços:\n\n• Preços competitivos e transparentes\n• Promoções regulares\n• Frete GRÁTIS acima de 500 MZN\n• Aceitamos M-Pesa, PayPal e outros\n\nQuer que eu mostre algum produto específico?',
      };
    }

    // Intenção: PERGUNTA SOBRE ENVIO
    if (userMessage.toLowerCase().includes('envio') || userMessage.toLowerCase().includes('entrega') || userMessage.toLowerCase().includes('frete')) {
      return {
        text: '🚚 Informações de Envio:\n\n• Frete GRÁTIS para compras acima de 500 MZN\n• Taxa de entrega: 50 MZN (compras abaixo de 500 MZN)\n• Prazo médio: 5-7 dias úteis\n• Entrega em todo Moçambique\n\nAlguma outra dúvida?',
      };
    }

    // Intenção: PERGUNTA SOBRE PAGAMENTO
    if (userMessage.toLowerCase().includes('pagamento') || userMessage.toLowerCase().includes('como pago')) {
      return {
        text: '💳 Formas de Pagamento:\n\n✅ M-Pesa (Moçambique)\n✅ e-Mola\n✅ M-Kesh\n✅ PayPal (internacional)\n✅ Cartão de Crédito/Débito\n✅ Dinheiro na entrega\n\nTodos os pagamentos são 100% seguros! 🔒',
      };
    }

    // Intenção: AGRADECIMENTO
    if (userMessage.toLowerCase().includes('obrigado') || userMessage.toLowerCase().includes('valeu')) {
      return {
        text: 'De nada! 😊 Estou sempre aqui para ajudar.\n\nSe precisar de mais alguma coisa, é só perguntar!',
      };
    }

    // Intenção: DESPEDIDA
    if (intent.type === 'farewell') {
      return {
        text: 'Até logo! 👋\n\nEspero ter ajudado. Qualquer coisa, estou sempre aqui!\n\nBoa compra! 🛒',
      };
    }

    // Resposta padrão inteligente
    const searchResults = semanticSearch(userMessage, products, { threshold: 0.15, limit: 3 });
    
    if (searchResults.length > 0) {
      return {
        text: `Não tenho certeza exata do que você quer, mas encontrei alguns produtos que podem interessar:\n\nQuer ver os resultados?`,
        products: searchResults.slice(0, 3).map(r => r.product),
      };
    }

    return {
      text: 'Desculpe, não entendi completamente. 😅\n\nPosso ajudar com:\n• Buscar produtos específicos\n• Informações sobre preços, envio e pagamento\n• Falar com atendente humano\n\nO que você precisa?',
    };
  }, [products]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simular tempo de processamento (mais realista com NLP)
    setTimeout(() => {
      const response = generateResponse(text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        products: response.products,
        intent: detectIntent(text).type,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 500); // 800-1300ms para parecer mais natural
  }, [generateResponse]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: 'Olá! Sou o assistente virtual da Papel & Pixel. 😊\n\nPosso ajudar você a:\n• Encontrar produtos\n• Informações sobre preços e promoções\n• Dúvidas sobre envio e pagamento\n\nO que você está procurando hoje?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return (
    <ChatBotContext.Provider value={{
      messages,
      sendMessage,
      clearMessages,
      isTyping,
    }}>
      {children}
    </ChatBotContext.Provider>
  );
}

export function useChatBot() {
  const context = useContext(ChatBotContext);
  if (!context) {
    throw new Error('useChatBot must be used within a ChatBotProvider');
  }
  return context;
}


