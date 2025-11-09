import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/config/supabase";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    loadVideos();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        // Fallback to localStorage if Supabase fails
        const savedProducts = localStorage.getItem("adminProducts");
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        }
      } else if (data) {
        // Map database fields to Product interface
        const mappedProducts = data.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.original_price,
          category: item.category,
          description: item.description || '',
          image: item.image || '',
          stock: item.stock,
          isPromotion: item.is_promotion,
          isFeatured: item.is_featured
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = () => {
    const savedVideos = localStorage.getItem("adminVideos");
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    } else {
      const initialVideos: VideoAd[] = [
        {
          id: "1",
          title: "Promoção de Volta às Aulas",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          type: "youtube",
          active: true
        }
      ];
      setVideos(initialVideos);
      localStorage.setItem("adminVideos", JSON.stringify(initialVideos));
    }
  };

  const addProduct = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          category: product.category,
          price: product.price,
          original_price: product.originalPrice,
          description: product.description,
          image: product.image,
          stock: product.stock,
          is_promotion: product.isPromotion,
          is_featured: product.isFeatured
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        throw error;
      }

      if (data) {
        // Reload products to get the complete data from database
        loadProducts();
      }
    } catch (error) {
      // Fallback to localStorage on error
      const newProducts = [...products, product];
      setProducts(newProducts);
      localStorage.setItem("adminProducts", JSON.stringify(newProducts));
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          category: updatedProduct.category,
          price: updatedProduct.price,
          original_price: updatedProduct.originalPrice,
          description: updatedProduct.description,
          image: updatedProduct.image,
          stock: updatedProduct.stock,
          is_promotion: updatedProduct.isPromotion,
          is_featured: updatedProduct.isFeatured
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      const newProducts = products.map(p => 
        p.id === id ? { ...p, ...updatedProduct } : p
      );
      setProducts(newProducts);
    } catch (error) {
      // Fallback to localStorage on error
      const newProducts = products.map(p => 
        p.id === id ? { ...p, ...updatedProduct } : p
      );
      setProducts(newProducts);
      localStorage.setItem("adminProducts", JSON.stringify(newProducts));
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw error;
      }

      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
    } catch (error) {
      // Fallback to localStorage on error
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      localStorage.setItem("adminProducts", JSON.stringify(newProducts));
    }
  };

  const addVideo = (video: VideoAd) => {
    const newVideos = [...videos, video];
    setVideos(newVideos);
    localStorage.setItem("adminVideos", JSON.stringify(newVideos));
  };

  const updateVideo = (id: string, updatedVideo: Partial<VideoAd>) => {
    const newVideos = videos.map(v => 
      v.id === id ? { ...v, ...updatedVideo } : v
    );
    setVideos(newVideos);
    localStorage.setItem("adminVideos", JSON.stringify(newVideos));
  };

  const deleteVideo = (id: string) => {
    const newVideos = videos.filter(v => v.id !== id);
    setVideos(newVideos);
    localStorage.setItem("adminVideos", JSON.stringify(newVideos));
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

