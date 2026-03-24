// mobile/src/services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Stockage sécurisé du token
export const saveToken = async (token) => {
  await SecureStore.setItemAsync('jwtToken', token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('jwtToken');
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync('jwtToken');
};

// Cache offline (pour sermons, musiques, livres)
export const saveOfflineData = async (key, data) => {
  await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(data));
};

export const getOfflineData = async (key) => {
  const data = await AsyncStorage.getItem(`offline_${key}`);
  return data ? JSON.parse(data) : null;
};

export const clearOfflineCache = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const offlineKeys = keys.filter(k => k.startsWith('offline_'));
  await AsyncStorage.multiRemove(offlineKeys);
};