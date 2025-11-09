import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContextMySQL';

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: FavoriteItem) => void;
  removeFromFavorites: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Carregar favoritos do localStorage ao iniciar
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`favorites_${user.id}`);
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch {
          setFavorites([]);
        }
      }
    } else {
      // Limpar favoritos ao fazer logout
      setFavorites([]);
    }
  }, [user]);

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    if (user && favorites.length >= 0) {
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites(current => {
      if (current.find(fav => fav.id === item.id)) {
        return current; // Já existe
      }
      return [...current, item];
    });
  };

  const removeFromFavorites = (id: string) => {
    setFavorites(current => current.filter(item => item.id !== id));
  };

  const isFavorite = (id: string): boolean => {
    return favorites.some(item => item.id === id);
  };

  const toggleFavorite = (item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
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



