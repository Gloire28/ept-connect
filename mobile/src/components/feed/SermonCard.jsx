// mobile/src/components/feed/SermonCard.jsx
// Version finale : dark mode dynamique complet - conforme UI/UX

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import usePreferenceStore from '../../store/preferenceStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const SermonCard = ({ sermon, onPress }) => {
  const { isDarkMode } = usePreferenceStore();

  // Thème dynamique
  const theme = {
    card: isDarkMode ? colors.darkCard : '#fff',
    text: isDarkMode ? colors.darkText : colors.text,
    textLight: isDarkMode ? '#94A3B8' : colors.textLight,
    accent: '#D4AF37',
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { width: CARD_WIDTH, backgroundColor: theme.card }]} 
      onPress={onPress}
    >
      <Image source={{ uri: sermon.urlThumbnail }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {sermon.titre}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textLight }]}>
          {sermon.orateurTitre} {sermon.orateur}
        </Text>
        <View style={styles.footer}>
          <View style={styles.duration}>
            <Ionicons name="time-outline" size={14} color={theme.textLight} />
            <Text style={[styles.durationText, { color: theme.textLight }]}>
              {sermon.duree}
            </Text>
          </View>
          {sermon.isPremium && (
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
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
});

export default SermonCard;