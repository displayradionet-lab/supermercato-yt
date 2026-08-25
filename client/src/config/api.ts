import axios from 'axios';

// 1. Pulizia dinamica di baseURL (garantisce sempre la slash finale '/')
const rawBaseUrl = import.meta.env.VITE_BASE_URL || 'https://supermercato-yt-backend.vercel.app/api';
const baseURL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Richieste (Token JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Risposte (Gestione errori 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');

      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Manteniamo sia l'export con nome che il default per evitare errori di importazione
export default api;