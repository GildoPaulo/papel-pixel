// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to fetch from API
export const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

export default fetchAPI;

