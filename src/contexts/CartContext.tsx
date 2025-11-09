import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selected?: boolean; // Para seleção no carrinho
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity' | 'selected'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleItemSelection: (id: string) => void;
  selectAllItems: (selected: boolean) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  selectedTotal: number;
  selectedItemCount: number;
  selectedItems: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Função para obter chave do carrinho baseada no usuário
  const getCartKey = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return user ? `cart_items_${user.id}` : 'cart_items_guest';
    } catch {
      return 'cart_items_guest';
    }
  };

  // Carregar itens do localStorage ao iniciar
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const cartKey = getCartKey();
      const saved = localStorage.getItem(cartKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Função para salvar carrinho no backend (com debounce)
  const saveCartToBackend = useCallback(async (cartItems: CartItem[]) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const sessionId = localStorage.getItem('session_id') || `session_${Date.now()}`;
      
      // Criar session_id se não existir
      if (!localStorage.getItem('session_id')) {
        localStorage.setItem('session_id', sessionId);
      }
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Converter items para formato esperado pelo backend
      const formattedItems = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));
      
      const response = await fetch(`${API_URL}/abandoned-carts/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || null,
          sessionId: sessionId,
          email: user?.email || null,
          cartItems: formattedItems,
          total: total
        })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar carrinho');
      }
      
      console.log('✅ Carrinho salvo no backend para rastreamento');
    } catch (error) {
      // Falha silenciosa - não interrompe o fluxo do usuário
      console.debug('⚠️ Erro ao salvar carrinho no backend:', error);
    }
  }, []);

  // Recarregar carrinho quando o usuário mudar (login/logout)
  useEffect(() => {
    const handleUserChange = () => {
      const cartKey = getCartKey();
      const saved = localStorage.getItem(cartKey);
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
    };

    // Escutar evento customizado de mudança de usuário
    window.addEventListener('user-changed', handleUserChange);
    
    return () => {
      window.removeEventListener('user-changed', handleUserChange);
    };
  }, []);

  // Salvar no localStorage sempre que items mudar
  useEffect(() => {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(items));
    
    // Salvar carrinho no backend com debounce (aguarda 2s sem mudanças)
    const debounceTimer = setTimeout(() => {
      if (items.length > 0) {
        saveCartToBackend(items);
      }
    }, 2000); // 2 segundos de debounce
    
    return () => clearTimeout(debounceTimer);
  }, [items, saveCartToBackend]);

  const addItem = (item: Omit<CartItem, 'quantity' | 'selected'>) => {
    setItems(current => {
      const existing = current.find(i => i.id === item.id);
      let newItems;
      if (existing) {
        newItems = current.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...current, { ...item, quantity: 1, selected: true }]; // Novo item já vem selecionado
      }
      return newItems;
    });
  };

  const removeItem = (id: string) => {
    setItems(current => {
      const newItems = current.filter(item => item.id !== id);
      return newItems;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(current =>
      current.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleItemSelection = (id: string) => {
    setItems(current =>
      current.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAllItems = (selected: boolean) => {
    setItems(current =>
      current.map(item => ({ ...item, selected }))
    );
  };

  const clearCart = useCallback(() => {
    setItems([]);
    // Limpar carrinho de todos os usuários possíveis
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      localStorage.removeItem(`cart_items_${user.id}`);
    }
    localStorage.removeItem('cart_items_guest');
  }, []);

  const total = items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Valores para itens selecionados
  const selectedItems = items.filter(item => item.selected !== false); // Por padrão, tudo está selecionado
  
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  const selectedItemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        toggleItemSelection,
        selectAllItems,
        clearCart,
        total,
        itemCount,
        selectedTotal,
        selectedItemCount,
        selectedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};





