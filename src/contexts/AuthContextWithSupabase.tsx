import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/config/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check Supabase session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        
        if (session?.user && session.expires_at && session.expires_at * 1000 > Date.now()) {
          // Session is valid
          await loadUserFromDatabase(session.user.id);
        } else if (session?.user) {
          // Session expired but user exists, try to refresh
          console.log('Session expired, attempting to refresh...');
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !newSession) {
            console.error('Failed to refresh session:', refreshError);
            await supabase.auth.signOut();
            setUser(null);
            return;
          }
          
          await loadUserFromDatabase(newSession.user.id);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      }
    };
    
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }
      
      if (session?.user) {
        await loadUserFromDatabase(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserFromDatabase = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as "user" | "admin"
        });
      } else {
        // Se usuário não existe na tabela public.users, usar dados do auth
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          setUser({
            id: authData.user.id,
            name: authData.user.email?.split('@')[0] || 'User',
            email: authData.user.email || '',
            role: 'user'
          });
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        await supabase.auth.signOut();
        setUser(null);
        return false;
      }

      if (data?.user && data?.session) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login exception:', error);
      await supabase.auth.signOut();
      setUser(null);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      console.log('Starting registration for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          },
          emailRedirectTo: window.location.origin
        }
      });

      console.log('SignUp response:', { data, error });

      if (error) {
        console.error('Registration error:', error);
        
        if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
          throw new Error('E-mail já cadastrado. Tente fazer login.');
        } else if (error.message?.includes('password')) {
          throw new Error('Senha muito fraca. Use pelo menos 6 caracteres.');
        } else if (error.message?.includes('rate limit')) {
          throw new Error('Muitas tentativas. Aguarde alguns minutos.');
        } else if (error.message?.includes('Failed to fetch')) {
          throw new Error('Erro de conexão. Verifique sua internet.');
        } else {
          throw new Error(`Erro ao criar conta: ${error.message || 'Erro desconhecido'}`);
        }
      }

      if (data?.user) {
        console.log('User created successfully:', data.user.id);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
      }

      console.error('No user data returned');
      return false;
    } catch (error: any) {
      console.error('Registration exception:', error);
      
      if (error.message) {
        throw error;
      }
      
      throw new Error('Erro ao criar conta. Tente novamente.');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
      }
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



