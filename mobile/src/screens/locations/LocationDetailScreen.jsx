// mobile/src/screens/locations/LocationDetailScreen.jsx
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Linking, 
  Platform, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import CustomHeader from '../../components/common/CustomHeader';
import usePreferenceStore from '../../store/preferenceStore';

const LocationDetailScreen = () => {
  const route = useRoute();
  const { isDarkMode } = usePreferenceStore();
  const { location } = route.params || {};

  // Thème dynamique pour l'harmonisation
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#F8FAFC',
    text: isDarkMode ? colors.darkText : '#1A202C',
    card: isDarkMode ? '#1E2937' : '#FFFFFF',
    secondaryText: isDarkMode ? '#94A3B8' : '#64748B',
  };

  if (!location) {
    return (
      <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Text style={[styles.error, { color: colors.primary }]}>Lieu non trouvé</Text>
        </View>
      </SafeAreaView>
    );
  }

  const openMap = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${location.nom}@${location.latitude},${location.longitude}`,
      android: `geo:0,0?q=${location.latitude},${location.longitude}(${location.nom})`
    });
    Linking.openURL(url).catch(() => Alert.alert('Erreur', 'Impossible d\'ouvrir la carte'));
  };

  const callPastor = () => {
    if (location.telephone) {
      Linking.openURL(`tel:${location.telephone}`);
    } else {
      Alert.alert('Info', 'Aucun numéro de téléphone disponible');
    }
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />

      <CustomHeader title={location.nom} showBack={true} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Zone Média : Image (Positionnement identique aux autres détails) */}
        <View style={styles.imageContainer}>
          {location.imageUrl ? (
            <Image source={{ uri: location.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="map-outline" size={60} color="#BDC3C7" />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: theme.text }]}>{location.nom}</Text>
            <View style={styles.row}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={[styles.adresse, { color: theme.secondaryText }]}>
                {location.adresse}, {location.quartier}
              </Text>
            </View>
          </View>

          {location.pasteurResponsable && (
            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
              <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Pasteur Responsable</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{location.pasteurResponsable}</Text>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Horaires de culte</Text>
            {location.horaires && location.horaires.length > 0 ? (
              location.horaires.map((h, index) => (
                <View key={index} style={[styles.horaireCard, { backgroundColor: theme.card }]}>
                  <View style={styles.horaireMain}>
                    <Text style={[styles.jour, { color: theme.text }]}>{h.jour}</Text>
                    <Text style={styles.heure}>{h.debut} — {h.fin}</Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{h.type}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.noData, { color: theme.secondaryText }]}>Aucun horaire renseigné</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Barre d'action fixe */}
      <View style={[styles.footerActions, { backgroundColor: theme.card, borderTopColor: isDarkMode ? '#2D3748' : '#E2E8F0' }]}>
        <TouchableOpacity style={styles.actionButton} onPress={callPastor}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.actionText}>Appeler</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.mapButton]} onPress={openMap}>
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.actionText}>Itinéraire</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E2E8F0' },
  content: { 
    padding: 20,
    // J'ai retiré le marginTop négatif pour que le header et l'image s'alignent comme SermonDetail
  },
  headerInfo: { marginBottom: 24 },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adresse: { fontSize: 15, lineHeight: 22 },
  
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTextContainer: { marginLeft: 12 },
  infoLabel: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
  infoValue: { fontSize: 16, fontWeight: '600' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 19, fontWeight: '700', marginBottom: 15 },
  
  horaireCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  horaireMain: { flex: 1 },
  jour: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  heure: { fontWeight: '600', color: colors.primary, fontSize: 14 },
  
  typeBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: { fontSize: 12, fontWeight: '600', color: '#64748B' },

  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapButton: { backgroundColor: '#334155' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  emptyContainer: { padding: 20, alignItems: 'center', borderRadius: 12 },
  noData: { fontStyle: 'italic' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { fontSize: 16, fontWeight: '600' },
});

export default LocationDetailScreen;