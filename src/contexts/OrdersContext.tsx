import { createContext, useContext, useState, ReactNode } from 'react';
import { API_URL } from '@/config/api';

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  product_type?: 'fisico' | 'digital';
  product_arquivo_digital?: string;
  product_gratuito?: boolean;
}

interface Order {
  id: number;
  user_id: number;
  total: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  shipping_address?: string;
  billing_address?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

interface OrdersContextType {
  orders: Order[];
  loading: boolean;
  loadOrders: () => Promise<void>;
  loadOrderById: (id: number) => Promise<Order | null>;
  loadUserOrders: (userId: number) => Promise<Order[]>;
  createOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (id: number, status: string, payment_status?: string, tracking_code?: string, tracking_url?: string) => Promise<void>;
  cancelOrder: (id: number) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar todos os pedidos
  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('📦 [ORDERS CONTEXT] Carregando todos os pedidos...');
      const response = await fetch(`${API_URL}/orders`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao carregar pedidos');
      }
      const data = await response.json();
      console.log(`✅ [ORDERS CONTEXT] ${data.length || 0} pedidos carregados`);
      setOrders(data || []);
    } catch (error) {
      console.error('❌ [ORDERS CONTEXT] Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar pedido por ID
  const loadOrderById = async (id: number): Promise<Order | null> => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`);
      if (!response.ok) throw new Error('Erro ao buscar pedido');
      return await response.json();
    } catch (error) {
      console.error('Error loading order:', error);
      return null;
    }
  };

  // Buscar pedidos de um usuário
  const loadUserOrders = async (userId: number): Promise<Order[]> => {
    try {
      console.log(`📦 [ORDERS CONTEXT] Carregando pedidos do usuário ${userId}...`);
      const response = await fetch(`${API_URL}/orders/user/${userId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || 'Erro ao buscar pedidos do usuário');
      }
      const data = await response.json();
      console.log(`✅ [ORDERS CONTEXT] ${data.length || 0} pedidos do usuário ${userId} carregados`);
      return data || [];
    } catch (error) {
      console.error(`❌ [ORDERS CONTEXT] Erro ao carregar pedidos do usuário ${userId}:`, error);
      return [];
    }
  };

  // Criar novo pedido
  const createOrder = async (orderData: any): Promise<Order> => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar pedido');
      }

      const order = await response.json();
      // Adicionar à lista sem recarregar tudo
      setOrders(prev => [order, ...prev]);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  // Atualizar status do pedido
  const updateOrderStatus = async (id: number, status: string, payment_status?: string, tracking_code?: string, tracking_url?: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, payment_status, tracking_code, tracking_url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao atualizar pedido' }));
        throw new Error(errorData.error || 'Erro ao atualizar pedido');
      }
      
      const data = await response.json();
      const updatedOrder = data.order || { id, status, payment_status, tracking_code, tracking_url };
      
      // Atualizar na lista local
      setOrders(prev => prev.map(order => 
        order.id === id 
          ? { ...order, ...updatedOrder } 
          : order
      ));
    } catch (error: any) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  // Cancelar pedido
  const cancelOrder = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao cancelar pedido');
      
      // Remover da lista local
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  };

  // Deletar pedido permanentemente (apenas admin)
  const deleteOrder = async (id: number): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro ao deletar pedido' }));
        throw new Error(errorData.error || 'Erro ao deletar pedido');
      }
      
      // Remover da lista local
      setOrders(prev => prev.filter(order => order.id !== id));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  return (
    <OrdersContext.Provider value={{
      orders,
      loading,
      loadOrders,
      loadOrderById,
      loadUserOrders,
      createOrder,
      updateOrderStatus,
      cancelOrder,
      deleteOrder,
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
