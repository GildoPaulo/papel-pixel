import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from "@/config/api";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  images?: string[];
  stock: number;
  isPromotion: boolean;
  isFeatured: boolean;
  tipo?: 'fisico' | 'digital';
  arquivo_digital?: string;
  gratuito?: boolean;
  // Avaliações
  avg_rating?: number;
  total_reviews?: number;
  // Campos de livros
  isBook?: boolean;
  book_title?: string;
  book_author?: string;
  publisher?: string;
  publication_year?: number;
  book_type?: 'physical' | 'digital';
  access_type?: 'free' | 'paid';
  pdf_url?: string;
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

// Helper function to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function ProductsProviderMySQL({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [videos, setVideos] = useState<VideoAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
    loadVideos();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Tentar carregar do backend primeiro
      try {
        const response = await fetch(`${API_URL}/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          console.log('📦 [FRONTEND] Produtos carregados do backend:', data.length);
          if (data.length > 0 && data[0]) {
            console.log('📦 [FRONTEND] Primeiro produto:', {
              id: data[0].id,
              name: data[0].name,
              hasImage: !!data[0].image,
              imageLength: data[0].image ? data[0].image.length : 0,
              imagePreview: data[0].image ? (data[0].image.length > 50 ? data[0].image.substring(0, 50) + '...' : data[0].image) : 'SEM IMAGEM'
            });
          }
          
          // Map database fields to Product interface
          const mappedProducts = Array.isArray(data) ? data.map((item: any) => {
            // Formatar URL da imagem - manter URL relativa ou base64 como está
            let imageUrl = item.image || '';
            
            // Log se imagem estiver faltando
            if (!imageUrl && item.id) {
              console.warn('⚠️ [FRONTEND] Produto sem imagem:', item.id, item.name);
            }
            
            // URLs relativas (/uploads/...) ou base64 já estão corretas
            // A conversão para URL absoluta será feita na exibição (Products.tsx, ProductDetail.tsx)
            
            return {
              id: item.id.toString(),
              name: item.name,
              price: parseFloat(item.price) || 0,
              originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : undefined,
              category: item.category || '',
              description: item.description || '',
              image: imageUrl,
              images: item.images || [],
              stock: parseInt(item.stock) || 0,
              isPromotion: item.isPromotion === 1 || item.isPromotion === true || item.isPromotion === 'true',
              isFeatured: item.isFeatured === 1 || item.isFeatured === true || item.isFeatured === 'true',
              tipo: item.tipo || 'fisico',
              arquivo_digital: item.arquivo_digital || undefined,
              gratuito: item.gratuito === 1 || item.gratuito === true,
              // Avaliações
              avg_rating: item.avg_rating || 0,
              total_reviews: item.total_reviews || 0,
              // Campos de livros
              isBook: item.isBook === 1 || item.isBook === true || item.isBook === 'true',
              book_title: item.book_title || undefined,
              book_author: item.book_author || undefined,
              publisher: item.publisher || undefined,
              publication_year: item.publication_year ? parseInt(item.publication_year) : undefined,
              book_type: item.book_type || undefined,
              access_type: item.access_type || undefined,
              pdf_url: item.pdf_url || undefined
            };
          }) : [];
          
          console.log('✅ [FRONTEND] Produtos mapeados:', mappedProducts.length);
          if (mappedProducts.length > 0) {
            console.log('✅ [FRONTEND] Primeiro produto mapeado:', {
              id: mappedProducts[0].id,
              name: mappedProducts[0].name,
              hasImage: !!mappedProducts[0].image,
              imagePreview: mappedProducts[0].image ? (mappedProducts[0].image.length > 50 ? mappedProducts[0].image.substring(0, 50) + '...' : mappedProducts[0].image) : 'SEM IMAGEM'
            });
          }
          
          setProducts(mappedProducts);
          localStorage.setItem("adminProducts", JSON.stringify(mappedProducts));
        } else {
          throw new Error('Failed to load products');
        }
      } catch (error) {
        console.warn('Backend não disponível, tentando localStorage:', error);
        // Fallback para localStorage
        const savedProducts = localStorage.getItem("adminProducts");
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          setProducts(parsed);
        }
      }

    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
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
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: product.name,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          description: product.description,
          image: product.image || '', // Garantir que sempre envia (mesmo que vazio)
          stock: product.stock,
          isPromotion: product.isPromotion,
          isFeatured: product.isFeatured
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // Se não conseguir parsear JSON, pode ser erro 404/500
          errorData = { error: `Erro HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('❌ [PRODUCTS] Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: errorData
        });
        
        // Mensagens mais específicas por status
        if (response.status === 404) {
          throw new Error(`Rota não encontrada. Verifique se o backend está rodando em ${API_URL}`);
        } else if (response.status === 401) {
          throw new Error('Token inválido. Faça login novamente.');
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Você precisa ser admin.');
        } else {
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('✅ [PRODUCTS] Produto criado com sucesso:', result);

      // Adicionar produto ao estado local SEM recarregar tudo
      if (result.product || result.id) {
        const newProduct = {
          id: (result.product?.id || result.id).toString(),
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
          description: product.description,
          image: product.image,
          stock: product.stock,
          isPromotion: product.isPromotion,
          isFeatured: product.isFeatured,
          tipo: product.tipo || 'fisico',
          arquivo_digital: product.arquivo_digital,
          gratuito: product.gratuito || false
        };
        const newProducts = [...products, newProduct];
        setProducts(newProducts);
        localStorage.setItem("adminProducts", JSON.stringify(newProducts));
      } else {
        // Se não retornou produto, recarregar lista
        await loadProducts();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Erro ao adicionar produto');
      // Fallback to localStorage on error
      const newProducts = [...products, product];
      setProducts(newProducts);
      localStorage.setItem("adminProducts", JSON.stringify(newProducts));
      throw error;
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Não autenticado. Faça login novamente.');
      }

      // Garantir que image seja sempre uma string válida
      let imageToSend = '';
      if (updatedProduct.image !== undefined && updatedProduct.image !== null) {
        imageToSend = String(updatedProduct.image);
      }

      console.log('📝 [PRODUCTS] Atualizando produto:', id);
      console.log('📝 [PRODUCTS] URL:', `${API_URL}/products/${id}`);
      console.log('📝 [PRODUCTS] Token:', token ? 'Presente' : 'AUSENTE');
      console.log('📝 [PRODUCTS] Imagem a ser enviada:', {
        hasImage: !!imageToSend,
        imageLength: imageToSend.length,
        imagePreview: imageToSend.length > 100 ? imageToSend.substring(0, 100) + '...' : imageToSend
      });

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: updatedProduct.name,
          category: updatedProduct.category,
          price: updatedProduct.price,
          originalPrice: updatedProduct.originalPrice,
          description: updatedProduct.description,
          image: imageToSend, // Sempre enviar como string
          stock: updatedProduct.stock,
          isPromotion: updatedProduct.isPromotion,
          isFeatured: updatedProduct.isFeatured,
          // Campos de livros (aceitar tanto camelCase quanto snake_case)
          isBook: updatedProduct.isBook,
          bookTitle: updatedProduct.bookTitle || updatedProduct.book_title,
          bookAuthor: updatedProduct.bookAuthor || updatedProduct.book_author,
          publisher: updatedProduct.publisher,
          publicationYear: updatedProduct.publicationYear || updatedProduct.publication_year,
          bookType: updatedProduct.bookType || updatedProduct.book_type,
          accessType: updatedProduct.accessType || updatedProduct.access_type,
          pdfUrl: updatedProduct.pdfUrl || updatedProduct.pdf_url,
          images: updatedProduct.images
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // Se não conseguir parsear JSON, pode ser erro 404/500
          errorData = { error: `Erro HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('❌ [PRODUCTS] Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: errorData
        });
        
        // Mensagens mais específicas por status
        if (response.status === 404) {
          throw new Error(`Rota não encontrada. Verifique se o backend está rodando em ${API_URL}`);
        } else if (response.status === 401) {
          throw new Error('Token inválido. Faça login novamente.');
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Você precisa ser admin.');
        } else {
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('✅ [PRODUCTS] Produto atualizado com sucesso');
      console.log('✅ [PRODUCTS] Produto retornado:', {
        id: result.id,
        name: result.name,
        hasImage: !!result.image,
        imageLength: result.image ? result.image.length : 0,
        imagePreview: result.image ? (result.image.length > 100 ? result.image.substring(0, 100) + '...' : result.image) : 'VAZIA'
      });

      // Garantir que a imagem retornada seja usada (não a do updatedProduct)
      const updatedImage = result.image || updatedProduct.image || '';
      
      // Atualizar estado local com dados retornados do servidor (mais confiável)
      const newProducts = products.map(p => 
        p.id === id ? { 
          ...p, 
          ...updatedProduct,
          image: updatedImage, // Usar imagem do servidor
          id: p.id // Manter id original
        } : p
      );
      setProducts(newProducts);
      localStorage.setItem("adminProducts", JSON.stringify(newProducts));
      
      // Recarregar produtos do servidor para garantir sincronização (após 500ms)
      setTimeout(() => {
        loadProducts().catch(err => console.error('Erro ao recarregar produtos:', err));
      }, 500);
      
      return true;
    } catch (error: any) {
      console.error('❌ [PRODUCTS] Erro ao atualizar produto:', error);
      toast.error(error.message || 'Erro ao atualizar produto');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Não autenticado. Faça login novamente.');
      }

      console.log('🗑️ [PRODUCTS] Deletando produto:', id);
      console.log('🗑️ [PRODUCTS] URL:', `${API_URL}/products/${id}`);
      console.log('🗑️ [PRODUCTS] Token:', token ? 'Presente' : 'AUSENTE');

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // Se não conseguir parsear JSON, pode ser erro 404/500
          errorData = { error: `Erro HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('❌ [PRODUCTS] Erro na resposta:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: errorData
        });
        
        // Mensagens mais específicas por status
        if (response.status === 404) {
          throw new Error(`Rota não encontrada. Verifique se o backend está rodando em ${API_URL}`);
        } else if (response.status === 401) {
          throw new Error('Token inválido. Faça login novamente.');
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Você precisa ser admin.');
        } else {
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
      }

      const result = await response.json();
      console.log('✅ [PRODUCTS] Produto deletado com sucesso:', result);

      // Remover do estado local SEM recarregar tudo (evita loop)
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      localStorage.setItem("adminProducts", JSON.stringify(newProducts));
      
      return true;
    } catch (error: any) {
      console.error('❌ [PRODUCTS] Erro ao deletar produto:', error);
      toast.error(error.message || 'Erro ao remover produto');
      throw error;
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

