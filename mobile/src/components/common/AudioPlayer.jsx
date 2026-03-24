// mobile/src/components/common/AudioPlayer.jsx
// Version finale : 100% OFFLINE (localFileUri prioritaire) + dark mode

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import usePlayerStore from '../../store/playerStore';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const AudioPlayer = ({ track }) => {
  const navigation = useNavigation();
  const { isPlaying, playTrack, pauseTrack } = usePlayerStore();
  const { isDarkMode } = usePreferenceStore();

  // Thème dynamique
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#fff',
    text: isDarkMode ? colors.darkText : colors.text,
    textLight: isDarkMode ? '#94A3B8' : colors.textLight,
  };

  // === PRIORITÉ OFFLINE ===
  const finalTrack = {
    ...track,
    urlMedia: track.localFileUri || track.urlMedia,
  };

  const isVideoClip = finalTrack.typeMedia === 'video' ||
    finalTrack.urlMedia?.toLowerCase().endsWith('.mp4') ||
    finalTrack.urlMedia?.toLowerCase().endsWith('.mov');

  const handlePress = () => {
    if (isVideoClip) {
      // Clip vidéo complet → ouvre le player dédié
      navigation.navigate('MusicPlayer', { music: finalTrack });
    } else {
      // Audio pur → lecture/pause
      isPlaying ? pauseTrack() : playTrack(finalTrack);
    }
  };

  return (
    <TouchableOpacity style={[styles.miniPlayer, { backgroundColor: theme.background }]} onPress={handlePress}>
      {/* Miniature toujours visible */}
      <Image
        source={{ uri: track.urlThumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {track.titre}
        </Text>
        <Text style={[styles.artist, { color: theme.textLight }]}>
          {track.artiste}
        </Text>
      </View>
      <Ionicons
        name={isPlaying && !isVideoClip ? "pause" : "play"}
        size={28}
        color={colors.primary}
        style={styles.playIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
  },
  artist: {
    fontSize: 12,
    marginTop: 2,
  },
  playIcon: {
    marginLeft: 8,
  },
});

export default AudioPlayer;