// mobile/src/screens/locations/LocationsScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import api from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { offlineCache } from '../../utils/offlineCache';

const LocationsScreen = () => {
  const navigation = useNavigation();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/locations');
      const data = res.data.data || [];
      setLocations(data);
      setFilteredLocations(data);
      offlineCache.save('locations', data);
    } catch (err) {
      console.error(err);
      const cached = await offlineCache.get('locations');
      if (cached) {
        setLocations(cached);
        setFilteredLocations(cached);
      } else Alert.alert('Erreur', 'Impossible de charger les lieux de culte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Filtrage en temps réel
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(loc =>
        loc.nom?.toLowerCase().includes(term) ||
        loc.quartier?.toLowerCase().includes(term) ||
        loc.ville?.toLowerCase().includes(term) ||
        loc.pasteurResponsable?.toLowerCase().includes(term)
      );
      setFilteredLocations(filtered);
    }
  }, [searchTerm, locations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLocations();
    setRefreshing(false);
  };

  const renderHoraire = (horaire, index) => (
    <View key={index} style={styles.horaireItem}>
      <Text style={styles.horaireJour}>{horaire.jour}</Text>
      <Text style={styles.horaireHeure}>{horaire.debut} - {horaire.fin}</Text>
      <Text style={styles.horaireType}>{horaire.type}</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('LocationDetail', { location: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.nom}>{item.nom}</Text>
        <Ionicons name="location" size={24} color={colors.primary} />
      </View>

      <Text style={styles.adresse}>
        {item.quartier}, {item.ville}
      </Text>
      <Text style={styles.pasteur}>
        Pasteur : {item.pasteurResponsable || 'Non renseigné'}
      </Text>

      <Text style={styles.sectionTitle}>Horaires de culte :</Text>
      <View style={styles.horairesContainer}>
        {item.horaires && item.horaires.length > 0 ? (
          item.horaires.map(renderHoraire)
        ) : (
          <Text style={styles.noHoraire}>Aucun horaire renseigné</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => navigation.navigate('LocationMap', { location: item })}
      >
        <Ionicons name="map" size={20} color="#fff" />
        <Text style={styles.mapButtonText}>Voir sur la carte</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading && locations.length === 0) {
    return <LoadingSpinner message="Chargement des lieux de culte..." />;
  }

  return (
    <View style={styles.container}>
      {/* === BARRE DE RECHERCHE === */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un lieu, quartier, ville ou pasteur..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#888"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {searchTerm ? 'Aucun lieu ne correspond à votre recherche' : 'Aucun lieu de culte trouvé'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faff', paddingTop: 30, },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nom: { fontSize: 18, fontWeight: '700', color: colors.primary, flex: 1 },
  adresse: { fontSize: 15, color: '#555', marginBottom: 4 },
  pasteur: { fontSize: 14, color: '#666', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: colors.primary, marginBottom: 8 },
  horairesContainer: { marginBottom: 12 },
  horaireItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f7ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  horaireJour: { fontWeight: '600', width: 90 },
  horaireHeure: { fontWeight: '600', color: '#0066cc' },
  horaireType: { fontSize: 13, color: '#555' },
  mapButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  mapButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
});

export default LocationsScreen;