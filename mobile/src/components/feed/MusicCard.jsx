// mobile/src/components/feed/MusicCard.jsx
// Version finale : dark mode dynamique complet - conforme UI/UX

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import usePreferenceStore from '../../store/preferenceStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const MusicCard = ({ music, onPress }) => {
  const { isDarkMode } = usePreferenceStore();

  // Thème dynamique
  const theme = {
    card: isDarkMode ? colors.darkCard : '#fff',
    text: isDarkMode ? colors.darkText : colors.text,
    textLight: isDarkMode ? '#94A3B8' : colors.textLight,
    primary: colors.primary,
    accent: '#D4AF37',
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { width: CARD_WIDTH, backgroundColor: theme.card }]} 
      onPress={onPress}
    >
      <Image source={{ uri: music.urlThumbnail }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {music.titre}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>
          {music.artiste}
        </Text>
        <View style={styles.footer}>
          <Ionicons name="musical-notes" size={16} color={theme.primary} />
          {music.isPremium && (
            <Ionicons name="star" size={16} color={theme.accent} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
});

export default MusicCard;