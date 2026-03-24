// mobile/src/screens/profile/SettingsScreen.jsx
// Version finale : dark mode dynamique complet (light/dark) - conforme UI/UX + Cahier des Charges

import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import CustomHeader from '../../components/common/CustomHeader';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const { isDarkMode, toggleDarkMode } = usePreferenceStore();

  // Thème dynamique (light/dark)
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    card: isDarkMode ? colors.darkCard : '#fff',
    text: isDarkMode ? colors.darkText : '#1F2937',
    secondaryText: isDarkMode ? '#94A3B8' : '#666',
    primary: colors.primary,
    border: isDarkMode ? '#334155' : '#E5E7EB',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Paramètres" />
      <View style={styles.content}>
        {/* Section Préférences */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Préférences</Text>
          <View style={[styles.row, { backgroundColor: theme.card }]}>
            <View style={styles.rowContent}>
              <Ionicons name="moon-outline" size={24} color={theme.secondaryText} />
              <Text style={[styles.label, { color: theme.text }]}>Mode sombre</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Section Langue */}
        <TouchableOpacity style={[styles.row, { backgroundColor: theme.card }]} disabled>
          <View style={styles.rowContent}>
            <Ionicons name="language-outline" size={24} color={theme.secondaryText} />
            <Text style={[styles.label, { color: theme.text }]}>Langue de l'application</Text>
          </View>
          <Text style={[styles.value, { color: theme.primary }]}>Français</Text>
        </TouchableOpacity>

        {/* Section À propos */}
        <TouchableOpacity style={[styles.row, { backgroundColor: theme.card }]}>
          <View style={styles.rowContent}>
            <Ionicons name="information-circle-outline" size={24} color={theme.secondaryText} />
            <Text style={[styles.label, { color: theme.text }]}>À propos d'EPT Connect</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: { fontSize: 16 },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;