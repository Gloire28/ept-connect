// mobile/src/utils/downloadManager.js
// Version finale : gestion correcte des routes (music au singulier) + métadonnées complètes

import * as FileSystem from 'expo-file-system/legacy';
import { offlineCache } from './offlineCache';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}EPTDownloads/`;

const ensureDownloadDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
};

// Helper pour choisir la bonne route de détail
const getDetailEndpoint = (ressource) => {
  return ressource === 'music' ? `/music/${id}` : `/${ressource}s/${id}`;
};

export const downloadManager = {
  downloadContent: async (ressource, id) => {
    const { token, isPremium } = useAuthStore.getState();

    if (!isPremium()) throw new Error('Le téléchargement est réservé aux membres Premium');
    if (!token) throw new Error('Vous devez être connecté pour télécharger');

    try {
      await ensureDownloadDirectory();

      // 1. Récupérer les métadonnées complètes avec la bonne route
      const detailEndpoint = ressource === 'music' 
        ? `/music/${id}` 
        : `/${ressource}s/${id}`;
      
      const detailRes = await api.get(detailEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fullContent = detailRes.data.data;

      // 2. Obtenir l'URL de téléchargement
      const downloadRes = await api.get(`/download/${ressource}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { downloadUrl, filename } = downloadRes.data;

      // 3. Téléchargement réel
      const localFileUri = `${DOWNLOAD_DIR}${filename}`;
      const fileRes = await FileSystem.downloadAsync(downloadUrl, localFileUri);

      if (fileRes.status !== 200) {
        throw new Error('Échec du téléchargement du fichier');
      }

      // 4. Sauvegarde complète
      const currentDownloads = (await offlineCache.get('my_downloads')) || [];

      const newDownload = {
        ...fullContent,
        localFileUri,
        downloadedAt: new Date().toISOString(),
        type: ressource,
      };

      const updatedDownloads = [...currentDownloads, newDownload];
      await offlineCache.save('my_downloads', updatedDownloads);

      console.log(`✅ Téléchargement terminé : ${localFileUri}`);
      return { success: true, localFileUri, filename };

    } catch (error) {
      console.error('Erreur downloadManager:', error.message);
      throw error;
    }
  },

  getMyDownloads: async () => {
    return (await offlineCache.get('my_downloads')) || [];
  },

  removeDownload: async (localFileUri) => {
    try {
      await FileSystem.deleteAsync(localFileUri, { idempotent: true });
      const current = (await offlineCache.get('my_downloads')) || [];
      const updated = current.filter(item => item.localFileUri !== localFileUri);
      await offlineCache.save('my_downloads', updated);
      return true;
    } catch (error) {
      console.error('Erreur suppression fichier:', error);
      return false;
    }
  },
};

export default downloadManager;