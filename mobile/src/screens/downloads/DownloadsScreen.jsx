// mobile/src/screens/downloads/DownloadsScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../components/common/CustomHeader';
import MiniatureCard from '../../components/common/MiniatureCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { offlineCache } from '../../utils/offlineCache';
import useAuthStore from '../../store/authStore';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // Calcul pour 2 colonnes avec paddings

const contentTypes = [
  { label: 'Tous', value: 'Tous' },
  { label: 'Livres', value: 'book' },
  { label: 'Musiques', value: 'music' },
  { label: 'Sermons', value: 'sermon' },
];

const DownloadsScreen = () => {
  const navigation = useNavigation();
  const { isPremium } = useAuthStore();
  const { isDarkMode } = usePreferenceStore();

  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');

  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    card: isDarkMode ? colors.darkCard : '#fff',
    text: isDarkMode ? colors.darkText : '#1F2937',
    accent: colors.primary,
    searchBg: isDarkMode ? '#1E2937' : '#fff',
    chipBorder: isDarkMode ? '#374151' : '#E5E7EB',
    chipUnselectedText: isDarkMode ? '#94A3B8' : '#666',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const loadDownloads = async () => {
    setLoading(true);
    try {
      const myDownloads = (await offlineCache.get('my_downloads')) || [];
      setDownloads(myDownloads);
    } catch (err) {
      console.error('Erreur chargement téléchargements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDownloads();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDownloads();
    setRefreshing(false);
  };

  const filteredDownloads = downloads.filter((item) => {
    const matchesSearch = debouncedSearch.trim() === '' ||
      (item.titre && item.titre.toLowerCase().includes(debouncedSearch.toLowerCase()));
    const matchesType = selectedType === 'Tous' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (loading && downloads.length === 0) {
    return <LoadingSpinner message="Chargement de vos téléchargements..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Mes Téléchargements" showBack={false} />

      <View style={[styles.searchContainer, { backgroundColor: theme.searchBg }]}>
        <Ionicons name="search" size={20} color={theme.accent} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher dans mes téléchargements..."
          placeholderTextColor={isDarkMode ? '#94A3B8' : '#666'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.chip,
                { borderColor: theme.chipBorder },
                selectedType === type.value && { backgroundColor: theme.accent, borderWeight: 0 },
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Text style={[styles.chipText, { color: selectedType === type.value ? '#fff' : theme.chipUnselectedText }]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scroll}
      >
        {!isPremium() ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>⭐ Fonctionnalité Premium</Text>
            <Text style={[styles.emptySubtitle, { color: theme.chipUnselectedText }]}>
              Seuls les membres Premium peuvent télécharger du contenu.
            </Text>
          </View>
        ) : filteredDownloads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.text, opacity: 0.6 }}>Aucun contenu trouvé</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredDownloads.map((item) => (
              <View key={item.localFileUri || item._id || Math.random()} style={styles.cardWrapper}>
                <MiniatureCard
                  imageUrl={item.urlThumbnail || item.urlCouverture || item.imageUrl}
                  title={item.titre || 'Contenu téléchargé'}
                  onPress={() => {
                    if (item.localFileUri) {
                      if (item.type === 'book') {
                        navigation.navigate('BookReader', { urlFichier: item.localFileUri, titre: item.titre });
                      } else {
                        navigation.navigate('MusicPlayer', { music: { ...item, urlMedia: item.localFileUri } });
                      }
                    } else {
                        // Fallback logic
                        if (item.type === 'book') navigation.navigate('BookReader', { urlFichier: item.urlFichier, titre: item.titre });
                        else if (item.type === 'sermon') navigation.navigate('SermonDetail', { id: item._id });
                        else if (item.type === 'music') navigation.navigate('MusicPlayer', { music: item });
                    }
                  }}
                />
              </View>
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
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  filterWrapper: { height: 50, marginBottom: 10 },
  filterContainer: { paddingHorizontal: 16, alignItems: 'center' },
  chip: {
    paddingHorizontal: 20,
    height: 34,
    justifyContent: 'center',
    borderRadius: 17,
    marginRight: 10,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Aligne les cartes sur les bords
  },
  cardWrapper: {
    width: '48%', // Assure que deux cartes tiennent par ligne
    marginBottom: 16,
  },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' }
});

export default DownloadsScreen;