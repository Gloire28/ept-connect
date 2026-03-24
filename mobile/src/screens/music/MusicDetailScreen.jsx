// mobile/src/screens/music/MusicDetailScreen.jsx
// Version finale : + bouton Télécharger fixe en bas (Premium only) + downloadManager

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../components/common/CustomHeader';
import VideoPlayer from '../../components/common/VideoPlayer';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import colors from '../../constants/colors';
import usePreferenceStore from '../../store/preferenceStore';
import useAuthStore from '../../store/authStore';
import downloadManager from '../../utils/downloadManager';

const MusicDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
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

  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadMusic = async () => {
      try {
        const res = await api.get(`/music/${id}`);
        setMusic(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMusic();
  }, [id]);

  const handleDownload = async () => {
    if (!isPremium()) {
      Alert.alert('Premium requis', 'Le téléchargement est réservé aux membres Premium.');
      return;
    }

    setDownloading(true);
    try {
      await downloadManager.downloadContent('music', id);
      Alert.alert(
        '✅ Succès',
        'La musique a été téléchargée avec succès !\nElle apparaît maintenant dans Mes Téléchargements.'
      );
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de télécharger la musique.');
    } finally {
      setDownloading(false);
    }
  };

  const isVideoClip =
    music?.typeMedia === 'video' ||
    music?.urlMedia?.toLowerCase().endsWith('.mp4') ||
    music?.urlMedia?.toLowerCase().endsWith('.mov');

  const handlePlay = () => {
    navigation.navigate('MusicPlayer', { music });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <CustomHeader title={music?.titre} showBack={true} />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Zone Média */}
        <View style={styles.mediaSection}>
          {isVideoClip ? (
            <VideoPlayer uri={music.urlMedia} style={styles.media} />
          ) : (
            <View style={styles.mediaContainer}>
              <Image
                source={{ uri: music?.urlThumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.playOverlay}
                onPress={handlePlay}
                activeOpacity={0.8}
              >
                <Ionicons name="play-circle" size={85} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Détails */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            {music?.titre}
          </Text>
          <Text style={[styles.artist, { color: theme.primary }]}>
            {music?.artiste} {music?.album ? `• ${music.album}` : '• Single'}
          </Text>
          <View style={styles.divider} />
          <Text style={[styles.description, { color: theme.secondaryText }]}>
            {music?.description || "Aucune description disponible pour ce titre."}
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
                <Text style={styles.downloadText}>Télécharger cette musique</Text>
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
  mediaSection: {
    width: '100%',
    backgroundColor: '#000',
  },
  media: {
    height: 240,
    width: '100%',
  },
  mediaContainer: {
    height: 240,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  artist: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
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

export default MusicDetailScreen;