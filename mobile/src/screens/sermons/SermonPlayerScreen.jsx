// mobile/src/screens/sermons/SermonPlayerScreen.jsx
// Version finale : 100% OFFLINE (localFileUri prioritaire) + dark mode

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import VideoPlayer from '../../components/common/VideoPlayer';
import CustomHeader from '../../components/common/CustomHeader';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const SermonPlayerScreen = () => {
  const route = useRoute();
  const { urlMedia, titre, localFileUri } = route.params || {};
  const { isDarkMode } = usePreferenceStore();

  // Thème dynamique
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
  };

  // === PRIORITÉ OFFLINE ===
  const finalUri = localFileUri || urlMedia;

  if (!finalUri) {
    return <CustomHeader title="Erreur" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title={titre || 'Sermon'} />

      <VideoPlayer 
        uri={finalUri} 
        style={styles.player} 
      />
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

export default SermonPlayerScreen;