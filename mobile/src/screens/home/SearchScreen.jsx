// mobile/src/screens/home/SearchScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import api from '../../services/api';
import SermonCard from '../../components/feed/SermonCard';
import MusicCard from '../../components/feed/MusicCard';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      try {
        const res = await api.get(`/search?q=${query}`);
        setResults(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    const timeout = setTimeout(search, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={22} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un sermon, musique..."
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item._id}
        renderItem={({ item }) => {
          if (item.typeMedia) {
            return <MusicCard music={item} onPress={() => {}} />;
          }
          return <SermonCard sermon={item} onPress={() => {}} />;
        }}
        ListEmptyComponent={
          query.length > 1 ? (
            <Text style={styles.empty}>Aucun résultat trouvé</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },
  container: { 
    flex: 1, 
    backgroundColor: '#f3f8fd'   
  },
});

export default SearchScreen;