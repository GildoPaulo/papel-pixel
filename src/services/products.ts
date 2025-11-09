import { API_URL } from '@/config/api';

export interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  original_price?: number | null
  description: string | null
  image: string | null
  stock: number
  isPromotion: boolean
  is_promotion?: boolean
  isFeatured: boolean
  is_featured?: boolean
  created_at: string
  updated_at: string
}

// Helper para obter token de autenticação
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Fetch all products
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Error fetching products:', response.statusText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch featured products
export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products?isFeatured=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Error fetching featured products:', response.statusText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data.filter((p: Product) => p.isFeatured || p.is_featured) : [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Fetch promotional products
export async function fetchPromotionalProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products?isPromotion=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Error fetching promotional products:', response.statusText);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data.filter((p: Product) => p.isPromotion || p.is_promotion) : [];
  } catch (error) {
    console.error('Error fetching promotional products:', error);
    return [];
  }
}

// Fetch single product by ID
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Error fetching product:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Create product (Admin only)
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
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
      originalPrice: product.originalPrice || product.original_price,
      description: product.description,
      image: product.image,
      stock: product.stock,
      isPromotion: product.isPromotion || product.is_promotion || false,
      isFeatured: product.isFeatured || product.is_featured || false
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(errorData.error || 'Failed to create product');
  }

  return await response.json();
}

// Update product (Admin only)
export async function updateProduct(id: string, updates: Partial<Product>) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: updates.name,
      category: updates.category,
      price: updates.price,
      originalPrice: updates.originalPrice || updates.original_price,
      description: updates.description,
      image: updates.image,
      stock: updates.stock,
      isPromotion: updates.isPromotion ?? updates.is_promotion,
      isFeatured: updates.isFeatured ?? updates.is_featured
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(errorData.error || 'Failed to update product');
  }

  return await response.json();
}

// Delete product (Admin only)
export async function deleteProduct(id: string) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(errorData.error || 'Failed to delete product');
  }
}








