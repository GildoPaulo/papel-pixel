import { createContext, useContext, useState, ReactNode } from 'react';
import { API_URL } from '@/config/api';

interface Return {
  id: number;
  order_id: number;
  user_id: number;
  reason: string;
  reason_type?: string;
  image_url?: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  received_at?: string;
  refund_amount?: number;
  refund_processed_at?: string;
  notes?: string;
}

interface ReturnsContextType {
  returns: Return[];
  loading: boolean;
  loadReturns: (userId?: number) => Promise<void>;
  requestReturn: (orderId: number, userId: number, reason: string, reasonType?: string, imageUrl?: string) => Promise<boolean>;
  updateReturnStatus: (id: number, status: string, refundAmount?: number) => Promise<void>;
}

const ReturnsContext = createContext<ReturnsContextType | undefined>(undefined);

export function ReturnsProvider({ children }: { children: ReactNode }) {
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReturns = async (userId?: number) => {
    setLoading(true);
    try {
      const url = userId 
        ? `${API_URL}/returns/user/${userId}`
        : `${API_URL}/returns`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Erro ao carregar devoluções');
      const data = await response.json();
      setReturns(data);
    } catch (error) {
      console.error('Error loading returns:', error);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const requestReturn = async (orderId: number, userId: number, reason: string, reasonType?: string, imageUrl?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          order_id: orderId, 
          user_id: userId, 
          reason,
          reason_type: reasonType,
          image_url: imageUrl
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao solicitar devolução');
      }

      await loadReturns(userId);
      return true;
    } catch (error) {
      console.error('Error requesting return:', error);
      throw error;
    }
  };

  const updateReturnStatus = async (id: number, status: string, refundAmount?: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/returns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, refund_amount: refundAmount }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar devolução');
      
      await loadReturns();
    } catch (error) {
      console.error('Error updating return:', error);
      throw error;
    }
  };

  return (
    <ReturnsContext.Provider value={{
      returns,
      loading,
      loadReturns,
      requestReturn,
      updateReturnStatus,
    }}>
      {children}
    </ReturnsContext.Provider>
  );
}

export function useReturns() {
  const context = useContext(ReturnsContext);
  if (!context) {
    throw new Error('useReturns must be used within a ReturnsProvider');
  }
  return context;
}

