// mobile/src/screens/profile/PremiumScreen.jsx
// Version finale : dark mode dynamique complet - design premium cohérent

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CustomHeader from '../../components/common/CustomHeader';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import usePreferenceStore from '../../store/preferenceStore';

const PremiumScreen = () => {
  const { isDarkMode } = usePreferenceStore();

  // Thème dynamique
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    card: isDarkMode ? colors.darkCard : '#fff',
    text: isDarkMode ? colors.darkText : '#1F2937',
    secondaryText: isDarkMode ? '#94A3B8' : '#333',
    noteText: isDarkMode ? '#64748B' : '#888',
    primary: colors.primary,
    accent: '#D4AF37',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Passer Premium" />
      <View style={[styles.content, { backgroundColor: theme.card }]}>
        <Ionicons
          name="crown-outline"
          size={80}
          color={theme.accent}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: theme.primary }]}>Devenez Membre Premium</Text>
        <Text style={[styles.description, { color: theme.secondaryText }]}>
          En devenant membre Premium, accédez à tous les contenus en mode hors ligne, sans limite, et bénéficiez de sermons et séminaires exclusifs, téléchargements illimités et lectures prioritaires. Et plus important, vous contribuez à l’avancée de l’œuvre du Seigneur.
        </Text>
        <Text style={[styles.price, { color: theme.accent }]}>2 000 FCFA / mois</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Souscrire maintenant</Text>
        </TouchableOpacity>
        <Text style={[styles.note, { color: theme.noteText }]}>
          Paiement sécurisé via Flooz ou TMoney • Annulation à tout moment
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 24,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    marginVertical: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  note: {
    marginTop: 40,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default PremiumScreen;