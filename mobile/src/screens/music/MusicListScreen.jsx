// mobile/src/screens/music/MusicListScreen.jsx
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  StyleSheet, 
  TextInput, 
  Platform,
  StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../components/common/CustomHeader';
import MusicCard from '../../components/feed/MusicCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { offlineCache } from '../../utils/offlineCache';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const MusicListScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = usePreferenceStore();

  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Masquer le header du TabNavigator s'il existe
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const theme = {
    background: isDarkMode ? colors.darkBackground : '#F8FAFC', // Fond plus moderne
    searchBg: isDarkMode ? '#1E2937' : '#FFFFFF',
    text: isDarkMode ? colors.darkText : '#1E2937',
    accent: colors.primary,
    placeholder: isDarkMode ? '#94A3B8' : '#94A3B8',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const loadMusics = async () => {
    try {
      const searchParam = debouncedSearch.trim()
        ? `&search=${encodeURIComponent(debouncedSearch.trim())}`
        : '';
      const res = await api.get(`/music?limit=50${searchParam}`);
      setMusics(res.data.data || []);
      offlineCache.save('music_list', res.data.data);
    } catch (err) {
      const cached = await offlineCache.get('music_list');
      if (cached) setMusics(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMusics();
  }, [debouncedSearch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMusics();
    setRefreshing(false);
  };

  if (loading && musics.length === 0) return <LoadingSpinner message="Chargement..." />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header personnalisé qui gère le SafeArea */}
      <CustomHeader title="Musique" showBack={false} />

      {/* Barre de recherche optimisée (Look de la capture) */}
      <View style={styles.searchWrapper}>
        <View style={[styles.searchContainer, { backgroundColor: theme.searchBg }]}>
          <Ionicons name="search-outline" size={20} color={theme.placeholder} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Rechercher une musique (titre, artiste, album...)"
            placeholderTextColor={theme.placeholder}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {musics.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={48} color={theme.placeholder} />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                {debouncedSearch ? 'Aucun résultat trouvé' : 'Aucune musique disponible'}
              </Text>
            </View>
          ) : (
            musics.map((music) => (
              <View key={music._id} style={styles.cardWrapper}>
                <MusicCard
                  music={music}
                  onPress={() => navigation.navigate('MusicDetail', { id: music._id })}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 16,
    height: 52,
    // Ombre subtile iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Ombre Android
    elevation: 3,
    borderWidth: Platform.OS === 'android' ? 1 : 0,
    borderColor: '#F1F5F9',
  },
  searchIcon: { marginRight: 12 },
  searchInput: { 
    flex: 1, 
    fontSize: 15,
    fontWeight: '500',
  },
  scroll: { 
    paddingHorizontal: 16, 
    paddingBottom: 30,
    flexGrow: 1 
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%', 
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    width: '100%',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    opacity: 0.6,
  },
});

export default MusicListScreen;