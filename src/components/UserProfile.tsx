// src/components/UserProfile.tsx
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';
import { signOut } from '../services/auth'; // Adicione função de logout
import { supabase } from '@/config/supabase';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      alert('Logout realizado com sucesso!');
    } catch (error) {
      alert('Erro ao fazer logout: ' + error.message);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <div>Nenhum usuário logado. <a href="/login">Fazer login</a></div>;
  }

  return (
    <div>
      <h2>Bem-vindo, {user.full_name}!</h2>
      <p>Email: {user.email}</p>
      <p>Função: {user.role}</p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}
