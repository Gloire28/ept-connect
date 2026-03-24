// mobile/src/screens/books/BooksListScreen.jsx
// Version mise à jour : navigation vers BookDetail (id) au lieu de BookReader direct

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../components/common/CustomHeader';
import MiniatureCard from '../../components/common/MiniatureCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import { offlineCache } from '../../utils/offlineCache';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const BooksListScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode } = usePreferenceStore();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    searchBg: isDarkMode ? '#1E2937' : '#fff',
    text: isDarkMode ? colors.darkText : colors.text,
    accent: colors.primary,
  };

  // === DEBOUNCE 400ms ===
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const searchParam = debouncedSearch.trim()
        ? `&search=${encodeURIComponent(debouncedSearch.trim())}`
        : '';
      const res = await api.get(`/books?limit=50${searchParam}`);
      setBooks(res.data.data || []);
      offlineCache.save('books_list', res.data.data);
    } catch (err) {
      // Silence total + fallback offline
      const cached = await offlineCache.get('books_list');
      if (cached) setBooks(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [debouncedSearch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  if (loading && books.length === 0) return <LoadingSpinner message="Chargement des livres..." />;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <CustomHeader title="Livres" showBack={false} />

      {/* RECHERCHE AVEC DEBOUNCE */}
      <View style={[styles.searchContainer, { backgroundColor: theme.searchBg }]}>
        <Ionicons name="search" size={20} color={theme.accent} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher un livre (titre, auteur, éditeur...)"
          placeholderTextColor={isDarkMode ? '#94A3B8' : '#666'}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.grid}>
          {books.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ color: theme.text, opacity: 0.6 }}>
                {debouncedSearch ? 'Aucun résultat pour cette recherche' : 'Aucun livre trouvé'}
              </Text>
            </View>
          ) : (
            books.map((book) => (
              <MiniatureCard
                key={book._id}
                imageUrl={book.urlCouverture}
                title={book.titre}
                onPress={() => navigation.navigate('BookDetail', { id: book._id })}
              />
            ))
          )}
        </View>
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

export default BooksListScreen;