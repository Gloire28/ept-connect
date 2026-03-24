// mobile/src/services/authService.js
import api from './api';
import * as SecureStore from 'expo-secure-store';
import useAuthStore from '../store/authStore';

export const sendOTP = async (tel) => {
  const res = await api.post('/auth/login-otp', { tel });
  return res.data;
};

export const verifyOTP = async (tel, otp) => {
  const res = await api.post('/auth/verify-otp', { tel, otp });
  return res.data;
};

export const register = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

// Connexion classique téléphone + mot de passe (flux mobile)
export const loginWithPassword = async (tel, motDePasse) => {
  try {
    console.log(`[LOGIN FRONT] Envoi vers /login-user → tel: ${tel}`);
    const res = await api.post('/auth/login-user', { tel, motDePasse });

    console.log('[LOGIN FRONT] Réponse brute du backend:', res.data);

    const { token, user } = res.data;   // Structure attendue

    if (!token || !user) {
      throw new Error('Réponse backend incomplète (token ou user manquant)');
    }

    await SecureStore.setItemAsync('jwtToken', token);
    await useAuthStore.getState().login(token, user);

    console.log('[LOGIN FRONT] Connexion réussie – user:', user.prenoms);
    return user;
  } catch (err) {
    console.error('[LOGIN FRONT] Erreur complète:', err.response?.data || err.message);
    throw err;   // On laisse le catch de LoginScreen gérer l’affichage
  }
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('jwtToken');
  await SecureStore.deleteItemAsync('userData');
  useAuthStore.getState().logout();
};