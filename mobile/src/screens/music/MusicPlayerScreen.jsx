// mobile/src/screens/music/MusicPlayerScreen.jsx
// Version finale : 100% OFFLINE (localFileUri prioritaire) + dark mode

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import usePlayerStore from '../../store/playerStore';
import AudioPlayer from '../../components/common/AudioPlayer';
import VideoPlayer from '../../components/common/VideoPlayer';
import CustomHeader from '../../components/common/CustomHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const MusicPlayerScreen = () => {
  const route = useRoute();
  const { music } = route.params || {};
  const { playTrack } = usePlayerStore();
  const { isDarkMode } = usePreferenceStore();

  // Thème dynamique
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
  };

  // Protection contre music undefined
  if (!music) {
    return <LoadingSpinner message="Chargement de la musique..." />;
  }

  // === PRIORITÉ OFFLINE : fichier local si téléchargé ===
  const playerMusic = {
    ...music,
    urlMedia: music.localFileUri || music.urlMedia,
  };

  const isVideoClip = playerMusic.typeMedia === 'video' ||
    playerMusic.urlMedia?.toLowerCase().endsWith('.mp4') ||
    playerMusic.urlMedia?.toLowerCase().endsWith('.mov');

  useEffect(() => {
    if (playerMusic && !isVideoClip) {
      playTrack(playerMusic);
    }
  }, [playerMusic, isVideoClip]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title={playerMusic.titre} />

      {isVideoClip ? (
        <VideoPlayer uri={playerMusic.urlMedia} style={styles.player} />
      ) : (
        <AudioPlayer track={playerMusic} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  player: {
    flex: 1,
  },
});

export default MusicPlayerScreen;