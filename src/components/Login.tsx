// src/components/Login.tsx
import { useState } from 'react';
import { sendMagicLink } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      await sendMagicLink(email);
      setMessage('Link de login enviado para seu email!');
    } catch (error) {
      setMessage('Erro: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Login com Magic Link</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Seu email"
      />
      <button onClick={handleLogin}>Enviar Link</button>
      {message && <p>{message}</p>}
    </div>
  );
}