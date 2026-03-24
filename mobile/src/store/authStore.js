// mobile/src/store/authStore.js
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  // Chargement complet au démarrage (token + user)
  loadUserFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync('jwtToken');
      const userString = await SecureStore.getItemAsync('userData');

      if (token && userString) {
        const user = JSON.parse(userString);
        set({ token, user, isAuthenticated: true });
      } else if (token) {
        set({ token, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Erreur chargement user depuis SecureStore:', error);
    }
  },

  // Login complet (sauvegarde token + user)
  login: async (token, user) => {
    try {
      await SecureStore.setItemAsync('jwtToken', token);
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      console.error('Erreur sauvegarde user:', error);
    }
  },

  // Logout amélioré : nettoyage complet + callback optionnel pour navigation
  logout: async (onSuccess = null) => {
    try {
      await SecureStore.deleteItemAsync('jwtToken');
      await SecureStore.deleteItemAsync('userData');
      // Optionnel : on peut ajouter d'autres clés ici plus tard (ex: preferenceStore)
      
      set({ token: null, user: null, isAuthenticated: false });
      
      if (onSuccess) onSuccess(); // Redirection automatique
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  },

  isPremium: () => get().user?.isPremium || false,
}));

export default useAuthStore;