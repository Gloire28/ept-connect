// mobile/src/store/preferenceStore.js
// Version finale : persistance complète + sync avec user.ministere + support multi-ministères sermons
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePreferenceStore = create((set, get) => ({
  selectedMinistere: 'Tous',
  isDarkMode: false,
  language: 'fr',

  // Chargement au démarrage de l'app
  loadPreferences: async () => {
    try {
      const ministere = await AsyncStorage.getItem('selectedMinistere');
      const darkMode = await AsyncStorage.getItem('isDarkMode');
      const lang = await AsyncStorage.getItem('language');

      set({
        selectedMinistere: ministere || 'Tous',
        isDarkMode: darkMode === 'true',
        language: lang || 'fr',
      });
    } catch (error) {
      console.error('Erreur chargement préférences:', error);
    }
  },

  // Mise à jour ministère (utilisé dans HomeScreen et SermonsListScreen)
  setMinistere: async (ministere) => {
    await AsyncStorage.setItem('selectedMinistere', ministere);
    set({ selectedMinistere: ministere });
  },

  syncWithUserMinistere: async (userMinistere) => {
    const current = get().selectedMinistere;
    if (current === 'Tous' && userMinistere && userMinistere !== 'Autre') {
      await AsyncStorage.setItem('selectedMinistere', userMinistere);
      set({ selectedMinistere: userMinistere });
      console.log(`✅ Ministère synchronisé automatiquement : ${userMinistere}`);
    }
  },

  // Toggle mode sombre
  toggleDarkMode: async () => {
    const newMode = !get().isDarkMode;
    await AsyncStorage.setItem('isDarkMode', String(newMode));
    set({ isDarkMode: newMode });
  },

  resetPreferences: async () => {
    try {
      await AsyncStorage.multiRemove([
        'selectedMinistere',
        'isDarkMode',
        'language',
      ]);
      set({
        selectedMinistere: 'Tous',
        isDarkMode: false,
        language: 'fr',
      });
    } catch (error) {
      console.error('Erreur reset préférences:', error);
    }
  },

  initialize: async () => {
    await get().loadPreferences();
  },
}));

export default usePreferenceStore;