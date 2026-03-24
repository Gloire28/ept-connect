// mobile/src/components/common/VideoPlayer.jsx
// Version finale : 100% OFFLINE (localFileUri prioritaire) + dark mode

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const VideoPlayer = ({ uri, style, localFileUri }) => {
  const { isDarkMode } = usePreferenceStore();

  // === PRIORITÉ OFFLINE ===
  const finalUri = localFileUri || uri;

  const player = useVideoPlayer(finalUri, (playerInstance) => {
    playerInstance.loop = false;
  });

  return (
    <View style={[styles.container, style, { backgroundColor: isDarkMode ? colors.darkBackground : '#000' }]}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls
        fullscreenOptions={{
          presentationStyle: 'fullscreen',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default VideoPlayer;