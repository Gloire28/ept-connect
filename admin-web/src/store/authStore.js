// admin-web/src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode'; 

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null, 
      isAuthenticated: false,

      
      login: (token) => {
        try {
          const decoded = jwtDecode(token);
          console.log('Token décodé dans authStore :', decoded);
          set({
            token,
            user: {
              id: decoded.id,
              nom: decoded.nom || '',
              prenoms: decoded.prenoms || '',
              tel: decoded.tel,
              role: decoded.role,
              isPremium: decoded.isPremium || false
            },
            isAuthenticated: true
          });
          
        } catch (error) {
          console.error('Erreur décodage JWT:', error);
        }
      },

      // Déconnexion
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
      
      isAdmin: () => get().user?.role === 'admin',

      isPremium: () => get().user?.isPremium === true,

      // Met à jour isPremium (ex. après paiement)
      updatePremiumStatus: (isPremium) => {
        set(state => ({
          user: state.user ? { ...state.user, isPremium } : null
        }));
      }
    }),
    {
      name: 'ept-admin-auth', 
      partialize: (state) => ({ token: state.token, user: state.user }) 
    }
  )
);

export default useAuthStore;