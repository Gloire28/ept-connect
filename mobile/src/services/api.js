// mobile/src/services/api.js
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import useAuthStore from '../store/authStore';
import { offlineCache } from '../utils/offlineCache';

// Base URL intelligente (priorité .env, fallback local)
const baseURL = process.env.EXPO_PUBLIC_API_URL 
  || 'http://192.168.1.68:5000/api';   

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Ajout automatique du token JWT
api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Gestion réponse + offline intelligente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      const cacheKey = error.config.url + (error.config.params ? JSON.stringify(error.config.params) : '');
      const cached = await offlineCache.get(cacheKey);
      if (cached) {
        console.log(`📱 OFFLINE → Cache utilisé pour ${cacheKey}`);
        return { data: cached };
      }
    }
    console.log(`⚠️ Réseau faible (${error.response?.status || 'timeout'}) → fallback offline`);
    return Promise.reject(error);
  }
);

export default api;