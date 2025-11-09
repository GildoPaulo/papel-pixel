import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_URL } from "@/config/api";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  token?: string;  // ✅ Adicionar token aqui
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para buscar usuário logado
async function getCurrentUser(token: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export function AuthProviderMySQL({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar localStorage primeiro (instantâneo)
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          
          // ✅ FIX AUTOMÁTICO: Se user não tem token mas localStorage tem, adicionar
          if (!parsedUser.token && savedToken) {
            console.log('🔧 [FIX] Adicionando token ao user...');
            parsedUser.token = savedToken;
            localStorage.setItem('user', JSON.stringify(parsedUser));
            console.log('✅ [FIX] Token adicionado com sucesso!');
          }
          
          setUser(parsedUser);
        }

        // Tentar validar com backend (async, não bloqueia)
        const token = savedToken || JSON.parse(savedUser || '{}').token;
        if (token) {
          setTimeout(async () => {
            try {
              const userData = await getCurrentUser(token);
              if (userData) {
                const userWithToken = {
                  ...userData,
                  token: token
                };
                setUser(userWithToken);
                localStorage.setItem('user', JSON.stringify(userWithToken));
              }
            } catch (error) {
              console.warn('Backend não disponível:', error);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentando fazer login:', { email, apiUrl: `${API_URL}/auth/login` });
      
      // Criar AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout
      
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('📥 Resposta do servidor:', { status: response.status, ok: response.ok });

        // Tentar ler a resposta mesmo se não for ok
        let data;
        try {
          const text = await response.text();
          console.log('📄 Resposta do servidor (texto):', text);
          data = text ? JSON.parse(text) : null;
        } catch (parseError) {
          console.error('❌ Erro ao parsear resposta:', parseError);
          data = null;
        }

        if (!response.ok) {
          // Verificar se é conta bloqueada
          if (response.status === 403 && data?.blocked) {
            const blockedError = new Error(data.message || 'Sua conta está temporariamente bloqueada. Entre em contato com o administrador para saber os motivos.');
            (blockedError as any).blocked = true;
            (blockedError as any).message = data.message;
            throw blockedError;
          }
          
          // Verificar se é conta inativa
          if (response.status === 403 && data?.inactive) {
            const inactiveError = new Error(data.message || 'Sua conta está inativa. Entre em contato com o administrador para reativá-la.');
            (inactiveError as any).inactive = true;
            (inactiveError as any).message = data.message;
            throw inactiveError;
          }
          
          const errorMessage = data?.error || `Erro ${response.status}: ${response.statusText}`;
          console.error('❌ Erro no login:', errorMessage);
          throw new Error(errorMessage);
        }

        if (!data || !data.token || !data.user) {
          console.error('❌ Resposta inválida:', data);
          throw new Error('Resposta inválida do servidor');
        }
        
        console.log('✅ Login bem-sucedido:', { userId: data.user.id, email: data.user.email });
        
        // Salvar token separado (para compatibilidade)
        localStorage.setItem('token', data.token);
        
        // Salvar dados do usuário COM token incluído
        const userWithToken = {
          ...data.user,
          token: data.token  // ✅ ADICIONAR TOKEN AQUI!
        };
        
        setUser(userWithToken);
        localStorage.setItem('user', JSON.stringify(userWithToken));
        
        // Disparar evento para atualizar carrinho
        window.dispatchEvent(new CustomEvent('user-changed'));

        return true;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error('⏰ Timeout: Servidor não respondeu em 15 segundos');
          throw new Error('Tempo de espera esgotado. O servidor pode estar demorando para responder.');
        }
        
        throw fetchError;
      }
    } catch (error: any) {
      console.error('💥 Erro completo no login:', error);
      
      // Se não conseguir fazer fetch, verificar se backend está rodando
      if (error?.message?.includes('Failed to fetch') || 
          error?.name === 'TypeError' ||
          error?.message?.includes('NetworkError')) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 3001.');
      }
      
      // Re-throw o erro com mensagem apropriada
      const errorMessage = error?.message || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar conta');
      }

      const data = await response.json();
      
      // Salvar token separado (para compatibilidade)
      localStorage.setItem('token', data.token);
      
      // Salvar dados do usuário COM token incluído
      const userWithToken = {
        ...data.user,
        token: data.token  // ✅ ADICIONAR TOKEN AQUI!
      };
      
      setUser(userWithToken);
      localStorage.setItem('user', JSON.stringify(userWithToken));
      
      // Disparar evento para atualizar carrinho
      window.dispatchEvent(new CustomEvent('user-changed'));

      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remover token e user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Disparar evento para atualizar carrinho
      window.dispatchEvent(new CustomEvent('user-changed'));
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
