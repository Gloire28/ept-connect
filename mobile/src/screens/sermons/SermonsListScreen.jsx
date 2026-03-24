// mobile/src/screens/sermons/SermonsListScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../components/common/CustomHeader';
import SermonCard from '../../components/feed/SermonCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { offlineCache } from '../../utils/offlineCache';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

// Liste complète des ministères
const ministries = [
  { label: 'Tous', value: 'Tous' },
  { label: 'Hommes', value: 'Hommes' },
  { label: 'Femmes', value: 'Femmes' },
  { label: 'Jeunesse', value: 'Jeunesse' },
  { label: 'Enfants', value: 'Enfants' },
  { label: 'Chorale', value: 'Chorale' },
  { label: 'Évangélisation', value: 'Évangélisation' },
  { label: 'Prière', value: 'Prière' },
  { label: 'Louange', value: 'Louange' },
  { label: 'Pasteur', value: 'Pasteur' },
  { label: 'Autre', value: 'Autre' },
];

const SermonsListScreen = () => {
  const navigation = useNavigation();
  const { selectedMinistere: userMinistere, isDarkMode } = usePreferenceStore();

  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMinistere, setSelectedMinistere] = useState(userMinistere || 'Tous');

  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    card: isDarkMode ? colors.darkCard : '#fff',
    text: isDarkMode ? colors.darkText : colors.text,
    accent: colors.primary,
    searchBg: isDarkMode ? '#1E2937' : '#fff',
    chipBorder: isDarkMode ? '#374151' : '#E5E7EB',
    chipUnselectedText: isDarkMode ? '#94A3B8' : '#666',
  };

  // Debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const loadSermons = async () => {
    setLoading(true);
    try {
      const ministereParam = selectedMinistere === 'Tous'
        ? ''
        : `&ministere=${encodeURIComponent(selectedMinistere)}`;

      const searchParam = debouncedSearch.trim()
        ? `&search=${encodeURIComponent(debouncedSearch.trim())}`
        : '';

      const res = await api.get(`/sermons?limit=50${ministereParam}${searchParam}`);

      setSermons(res.data.data || []);
      offlineCache.save('sermons_list', res.data.data);
    } catch (err) {
      // Silence total (plus de WARN) + fallback offline propre
      const cached = await offlineCache.get('sermons_list');
      if (cached) setSermons(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSermons();
  }, [selectedMinistere, debouncedSearch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSermons();
    setRefreshing(false);
  };

  if (loading && sermons.length === 0) return <LoadingSpinner message="Chargement des sermons..." />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Sermons" showBack={false} />

      {/* RECHERCHE AVEC DEBOUNCE */}
      <View style={[styles.searchContainer, { backgroundColor: theme.searchBg }]}>
        <Ionicons name="search" size={20} color={theme.accent} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher un sermon (titre, orateur, thème...)"
          placeholderTextColor={isDarkMode ? '#94A3B8' : '#666'}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {/* FILTRES PAR MINISTÈRE */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {ministries.map((min) => (
            <TouchableOpacity
              key={min.value}
              style={[
                styles.chip,
                { borderColor: theme.chipBorder },
                selectedMinistere === min.value && styles.chipActive,
              ]}
              onPress={() => setSelectedMinistere(min.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selectedMinistere === min.value ? '#fff' : theme.chipUnselectedText },
                ]}
              >
                {min.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LISTE */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scroll}
      >
        {sermons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.text, opacity: 0.6 }}>
              {debouncedSearch ? 'Aucun résultat pour cette recherche' : 'Aucun sermon trouvé'}
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {sermons.map((sermon) => (
              <SermonCard
                key={sermon._id}
                sermon={sermon}
                onPress={() => navigation.navigate('SermonDetail', { id: sermon._id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  filterWrapper: { height: 60, justifyContent: 'center' },
  filterScroll: { flexGrow: 0 },
  filterContainer: { paddingHorizontal: 16, alignItems: 'center' },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    justifyContent: 'center',
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  scroll: { padding: 16, flexGrow: 1 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
});

export default SermonsListScreen;