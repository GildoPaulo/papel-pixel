import { createContext, useContext, useState, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  isPromotion: boolean;
  isFeatured: boolean;
}

interface VideoAd {
  id: string;
  title: string;
  url: string;
  type: "youtube" | "vimeo" | "local";
  thumbnail?: string;
  active: boolean;
}

interface ProductsContextType {
  products: Product[];
  videos: VideoAd[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addVideo: (video: VideoAd) => void;
  updateVideo: (id: string, video: Partial<VideoAd>) => void;
  deleteVideo: (id: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<VideoAd[]>([]);
  const [loading, setLoading] = useState(false);

  const addProduct = async (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addVideo = (video: VideoAd) => {
    setVideos(prev => [...prev, video]);
  };

  const updateVideo = (id: string, updates: Partial<VideoAd>) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVideo = (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        videos,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addVideo,
        updateVideo,
        deleteVideo
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}

