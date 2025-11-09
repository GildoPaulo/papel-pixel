/**
 * SUPABASE REMOVIDO - Usando MySQL via Backend API
 * 
 * Todas as funcionalidades agora usam:
 * - Backend MySQL: http://localhost:3001/api
 * - Autenticação: JWT via backend
 * - Produtos: CRUD via API REST
 * - Upload: backend/routes/upload.js
 * 
 * Este arquivo é mantido apenas para compatibilidade.
 * Não usar mais Supabase!
 */
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: { message: 'Supabase desabilitado - use MySQL' } }),
    signOut: async () => {},
    signInWithPassword: async () => ({ data: null, error: { message: 'Supabase desabilitado - use MySQL' } }),
    signUp: async () => ({ data: null, error: { message: 'Supabase desabilitado - use MySQL' } }),
    onAuthStateChange: () => ({ data: { subscription: null }, unsubscribe: () => {} })
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: 'Supabase desabilitado - use /api/upload' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
};