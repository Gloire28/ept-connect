// mobile/src/components/common/OfflineBanner.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const OfflineBanner = () => {
  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" size={20} color="#fff" />
      <Text style={styles.text}>Vous êtes hors ligne. Mode hors connexion activé.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F59E0B',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default OfflineBanner;