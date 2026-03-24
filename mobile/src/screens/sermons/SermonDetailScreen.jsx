// mobile/src/screens/sermons/SermonDetailScreen.jsx
// Version finale : + bouton Télécharger fixe en bas (Premium only) + downloadManager

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../components/common/CustomHeader';
import VideoPlayer from '../../components/common/VideoPlayer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import colors from '../../constants/colors';
import usePreferenceStore from '../../store/preferenceStore';
import useAuthStore from '../../store/authStore';
import downloadManager from '../../utils/downloadManager';

const SermonDetailScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const { isDarkMode } = usePreferenceStore();
  const { isPremium } = useAuthStore();

  // Thème dynamique
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    text: isDarkMode ? colors.darkText : '#1F2937',
    primary: colors.primary,
    secondaryText: isDarkMode ? '#94A3B8' : '#444',
    accent: '#D4AF37',
  };

  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadSermon = async () => {
      try {
        const res = await api.get(`/sermons/${id}`);
        setSermon(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSermon();
  }, [id]);

  const handleDownload = async () => {
    if (!isPremium()) {
      Alert.alert('Premium requis', 'Le téléchargement est réservé aux membres Premium.');
      return;
    }

    setDownloading(true);
    try {
      await downloadManager.downloadContent('sermon', id);
      Alert.alert('✅ Succès', 'Le sermon a été téléchargé avec succès !\nIl apparaît maintenant dans Mes Téléchargements.');
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de télécharger le sermon.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <CustomHeader title={sermon?.titre} />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sermon?.urlMedia && (
          <VideoPlayer uri={sermon.urlMedia} style={styles.video} />
        )}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            {sermon?.titre}
          </Text>
          <Text style={[styles.orateur, { color: theme.primary }]}>
            {sermon?.orateur} — {sermon?.orateurTitre}
          </Text>
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            {sermon?.description}
          </Text>
        </View>
      </ScrollView>

      {/* === BOUTON TÉLÉCHARGER FIXE EN BAS === */}
      {isPremium() && (
        <View style={[styles.downloadFooter, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[styles.downloadButton, { backgroundColor: theme.primary }]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={22} color="#fff" />
                <Text style={styles.downloadText}>Télécharger ce sermon</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  video: {
    height: 240,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  orateur: {
    fontSize: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  // Styles du bouton fixe en bas
  downloadFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  downloadText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SermonDetailScreen;