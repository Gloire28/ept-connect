// admin-web/src/services/api.js
import axios from 'axios';
import useAuthStore from '../store/authStore';

// Création d'une instance axios dédiée à l'API backend
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`, 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor : ajoute automatiquement le token JWT dans les headers Authorization
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de réponse : gestion globale des erreurs 401 (token expiré → logout + redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token invalide ou expiré → déconnexion
      useAuthStore.getState().logout();
      // Redirection vers login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;