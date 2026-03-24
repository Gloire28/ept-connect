// mobile/src/screens/home/HomeScreen.jsx
// Version finale : Recommandé = 40 sermons aléatoires sur TAGS + suppression Derniers Sermons
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import useAuthStore from '../../store/authStore';
import usePreferenceStore from '../../store/preferenceStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SermonCard from '../../components/feed/SermonCard';
import MusicCard from '../../components/feed/MusicCard';
import AnnouncementCard from '../../components/feed/AnnouncementCard';
import api from '../../services/api';
import { offlineCache } from '../../utils/offlineCache';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, loadUserFromStorage } = useAuthStore();
  const { selectedMinistere, isDarkMode } = usePreferenceStore();

  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f5faff',
    headerBackground: isDarkMode ? colors.darkBackground : '#E6F0FA',
    textPrimary: isDarkMode ? colors.darkText : colors.primary,
    textSecondary: isDarkMode ? '#94A3B8' : colors.textLight,
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const firstName = user?.prenoms
    ? user.prenoms.trim().split(' ')[0]
    : 'Frère/Sœur';

  const [sermons, setSermons] = useState([]);
  const [musics, setMusics] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    setLoading(true);
    try {
      let sermonsRes;

      // === NOUVELLE LOGIQUE RECOMMANDÉ (filtre sur TAGS + 40 aléatoires) ===
      if (selectedMinistere && selectedMinistere !== 'Tous' && selectedMinistere !== 'Autre') {
        console.log(`[DEBUG] Recommandé biaisé sur tag : ${selectedMinistere}`);
        sermonsRes = await api.get(`/sermons/recommended?tag=${encodeURIComponent(selectedMinistere)}`);
      } else {
        console.log(`[DEBUG] Aucun tag choisi → chargement 40 sermons récents`);
        sermonsRes = await api.get('/sermons?limit=40');
      }

      const musicRes = await api.get('/music?limit=6');
      const annRes = await api.get('/announcements?limit=4');

      const finalSermons = sermonsRes.data.data || [];

      setSermons(finalSermons);
      setMusics(musicRes.data.data || []);
      setAnnouncements(annRes.data.data || []);

      offlineCache.save('home_sermons', finalSermons);
      offlineCache.save('home_music', musicRes.data.data);
      offlineCache.save('home_announcements', annRes.data.data);
    } catch (err) {
      console.log('[DEBUG] Erreur réseau HomeScreen → fallback cache');
      const cached = await offlineCache.get('home_sermons');
      if (cached) setSermons(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [selectedMinistere]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const featuredSermon = sermons.length > 0
    ? sermons[Math.floor(Math.random() * sermons.length)]
    : null;

  if (loading && sermons.length === 0) {
    return <LoadingSpinner message="Chargement du feed..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header personnalisé */}
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <Text style={[styles.greeting, { color: theme.textPrimary }]}>
          Bonjour, {firstName}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.logoContainer}
          activeOpacity={0.7}
        >
          <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scroll}
      >
        {featuredSermon && (
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigation.navigate('SermonDetail', { id: featuredSermon._id })}
          >
            <Image source={{ uri: featuredSermon.urlThumbnail }} style={styles.featuredImage} />
            <View style={styles.playOverlay}>
              <Ionicons name="play-circle" size={68} color="#fff" />
            </View>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredTitle}>{featuredSermon.titre}</Text>
              <Text style={styles.featuredSubtitle}>{featuredSermon.orateur}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* === SECTION RECOMMANDÉ (40 sermons aléatoires sur TAGS) === */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recommandé pour vous</Text>
        <FlatList
          data={sermons}                    
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <SermonCard
              sermon={item}
              onPress={() => navigation.navigate('SermonDetail', { id: item._id })}
            />
          )}
        />

        {/* === MUSIQUE & ANNONCES (inchangés) === */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Dernières Musiques</Text>
        <FlatList
          data={musics}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <MusicCard
              music={item}
              onPress={() => navigation.navigate('MusicDetail', { id: item._id })}
            />
          )}
        />

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Annonces importantes</Text>
        {announcements.map(ann => (
          <AnnouncementCard
            key={ann._id}
            announcement={ann}
            onPress={() => navigation.navigate('AnnouncementDetail', { id: ann._id })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  greeting: { fontSize: 22, fontWeight: '700' },
  logoContainer: { width: 42, height: 42 },
  logo: { width: '100%', height: '100%', resizeMode: 'contain' },
  scroll: { paddingBottom: 100 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  grid: { paddingHorizontal: 10 },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  featuredCard: {
    height: 245,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  featuredImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -34 }, { translateY: -34 }],
  },
  featuredInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 16,
  },
  featuredTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  featuredSubtitle: { color: '#ddd', fontSize: 13.5 },
});

export default HomeScreen;