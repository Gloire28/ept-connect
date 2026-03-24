// mobile/src/utils/offlineCache.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'ept_cache_';

export const offlineCache = {
  // Sauvegarder des données
  save: async (key, data) => {
    try {
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
      console.log(`✅ Cache sauvegardé : ${key}`);
    } catch (error) {
      console.error('Erreur cache save:', error);
    }
  },

  // Récupérer des données
  get: async (key) => {
    try {
      const value = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Erreur cache get:', error);
      return null;
    }
  },

  // Supprimer une clé
  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Erreur cache remove:', error);
    }
  },

  // Vider tout le cache
  clear: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Erreur cache clear:', error);
    }
  }
};