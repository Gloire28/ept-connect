// mobile/src/screens/profile/ProfileScreen.jsx
// Version mise à jour : + section Mes Téléchargements (Backblaze/Bunny ready)

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomHeader from '../../components/common/CustomHeader';
import useAuthStore from '../../store/authStore';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { isDarkMode } = usePreferenceStore();

  // Thème dynamique
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    card: isDarkMode ? colors.darkCard : '#fff',
    text: isDarkMode ? colors.darkText : '#1F2937',
    secondaryText: isDarkMode ? '#94A3B8' : '#666',
    primary: colors.primary,
    accent: '#D4AF37',
    destructive: '#FF3B30',
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Mon Profil" showBack={false} />
      
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Ionicons
          name="person-circle-outline"
          size={130}
          color={theme.primary}
          style={styles.profileIcon}
        />
        <Text style={[styles.name, { color: theme.primary }]}>
          {user?.nom} {user?.prenoms}
        </Text>
        <Text style={[styles.tel, { color: theme.secondaryText }]}>
          {user?.tel}
        </Text>
        {user?.isPremium && (
          <Text style={[styles.premium, { color: theme.accent }]}>⭐ Membre Premium</Text>
        )}
      </View>

      {/* === NOUVEAU MENU : MES TÉLÉCHARGEMENTS === */}
      <TouchableOpacity
        style={[styles.menu, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Downloads')}
      >
        <Ionicons name="cloud-download-outline" size={24} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.text }]}>Mes Téléchargements</Text>
      </TouchableOpacity>

      {/* === NOUVEAU MENU : LIEUX DE CULTE === */}
      <TouchableOpacity
        style={[styles.menu, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Locations')}
      >
        <Ionicons name="location" size={24} color={theme.primary} />
        <Text style={[styles.menuText, { color: theme.text }]}>Lieux de Culte</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menu, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Premium')}
      >
        <Ionicons name="star" size={24} color={theme.accent} />
        <Text style={[styles.menuText, { color: theme.text }]}>Passer Premium</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.menu, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Ionicons name="settings" size={24} color={theme.secondaryText} />
        <Text style={[styles.menuText, { color: theme.text }]}>Paramètres</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.logout, { backgroundColor: theme.card, borderColor: theme.destructive }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={theme.destructive} />
        <Text style={[styles.logoutText, { color: theme.destructive }]}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 12,
  },
  profileIcon: { marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '700' },
  tel: { fontSize: 16, marginTop: 4 },
  premium: { fontWeight: '600', marginTop: 8 },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  menuText: { marginLeft: 16, fontSize: 16 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginHorizontal: 40,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  logoutText: { fontSize: 17, fontWeight: '700', marginLeft: 10 },
});

export default ProfileScreen;