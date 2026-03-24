// mobile/src/components/feed/AnnouncementCard.jsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const AnnouncementCard = ({ announcement, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: announcement.imageUrl }} style={styles.image} />
      
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>{announcement.titre}</Text>
        <Text style={styles.date}>
          {new Date(announcement.dateDebut).toLocaleDateString('fr-FR')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 180,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    color: '#ddd',
    fontSize: 12,
  },
});

export default AnnouncementCard;