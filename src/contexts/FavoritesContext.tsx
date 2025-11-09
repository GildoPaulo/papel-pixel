import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContextMySQL';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface FavoritesContextType {
  favorites: Product[];
  loading: boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  loadFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const loadFavorites = useCallback(async () => {
    if (!user?.token) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar favoritos');

      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user, loadFavorites]);

  const toggleFavorite = async (product: Product) => {
    if (!user?.token) {
      toast.error('Faça login para adicionar aos favoritos');
      return;
    }

    const isCurrentlyFavorite = isFavorite(product.id);

    try {
      if (isCurrentlyFavorite) {
        // Remover
        const response = await fetch(`${API_URL}/favorites/${product.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Erro ao remover favorito');

        setFavorites(prev => prev.filter(f => f.id !== product.id));
        toast.success('Removido dos favoritos');
      } else {
        // Adicionar
        const response = await fetch(`${API_URL}/favorites/${product.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Erro ao adicionar favorito');

        setFavorites(prev => [...prev, product]);
        toast.success('Adicionado aos favoritos!');
      }
    } catch (error: any) {
      console.error('Erro ao toggle favorito:', error);
      toast.error(error.message || 'Erro ao atualizar favoritos');
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(f => f.id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        toggleFavorite,
        isFavorite,
        loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};
