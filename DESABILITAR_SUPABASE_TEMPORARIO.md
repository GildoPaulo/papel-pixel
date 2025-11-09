# 🚨 DESABILITAR SUPABASE TEMPORARIAMENTE

## 🎯 O PROBLEMA

Erros mostram:
- "auto refresh token tick lock not available"
- Supabase travando carregamento
- Página em branco

## ✅ SOLUÇÃO TEMPORÁRIA

Desabilitar Supabase completamente e deixar site funcionar **SEM autenticação** por enquanto.

---

## 🔧 AÇÃO IMEDIATA

### 1. Comentar Supabase em `src/config/supabase.ts`

Abra `src/config/supabase.ts` e substitua todo conteúdo:

```typescript
import { createClient } from '@supabase/supabase-js';

// Supabase temporariamente desabilitado
const supabaseUrl = '';
const supabaseKey = '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
```

---

### 2. Simplificar AuthContext

Abra `src/contexts/AuthContext.tsx`

Substitua por versão simples SEM Supabase:

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

  // Auto-login como admin temporariamente
  useEffect(() => {
    setUser({
      id: '1',
      name: 'Admin',
      email: 'admin@papelpixel.co.mz',
      role: 'admin'
    });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Login simplificado - aceita qualquer coisa
    setUser({
      id: '1',
      name: 'Usuário',
      email,
      role: 'user'
    });
    return true;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setUser({
      id: '1',
      name,
      email,
      role: 'user'
    });
    return true;
  };

  const logout = () => {
    setUser(null);
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
```

---

### 3. Limpar localStorage

No console do navegador (F12):

```javascript
localStorage.clear();
location.reload();
```

---

## 🧪 TESTAR

1. Recarregue: http://localhost:8080
2. ✅ Página deve aparecer!
3. Login/Cadastro vai aceitar qualquer coisa

---

## 📝 LEMBRAR

Esta é solução TEMPORÁRIA!

Depois:
- Ative MySQL backend
- Use AuthContextMySQL
- Tudo vai funcionar perfeitamente

Por enquanto, site funciona SEM autenticação real!

---

## 🎯 OU MELHOR...

Use o que já temos pronto!

Arquivo: `MYSQL_ATIVAR_AGORA.md`

Em 10 minutos você tem:
- ✅ Login real funcionando
- ✅ Cadastro real funcionando
- ✅ Sem problemas do Supabase

MUITO MELHOR que desabilitar autenticação!

