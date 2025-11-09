// src/services/auth.ts
import { supabase } from '../config/supabase';

// Enviar Magic Link
export async function sendMagicLink(email: string, full_name?: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:8080/dashboard', // Ajuste para a URL correta
        data: { full_name, role: 'customer' }
      }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao enviar Magic Link:', error);
    throw error;
  }
}

// Verificar usuário logado e buscar dados
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (user) {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .single();
      if (fetchError) throw fetchError;
      return data;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

// Logout
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}