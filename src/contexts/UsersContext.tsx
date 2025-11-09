import { createContext, useContext, useState, ReactNode } from 'react';
import { API_URL } from '@/config/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  totalOrders?: number;
  totalSpent?: number;
  orders?: any[];
}

interface UsersContextType {
  users: User[];
  loading: boolean;
  loadUsers: () => Promise<void>;
  loadUserById: (id: number) => Promise<User | null>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao carregar clientes');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserById = async (id: number): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao buscar cliente');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading user:', error);
      return null;
    }
  };

  return (
    <UsersContext.Provider value={{
      users,
      loading,
      loadUsers,
      loadUserById,
    }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}



