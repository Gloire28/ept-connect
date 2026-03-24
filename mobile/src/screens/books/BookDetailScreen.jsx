// mobile/src/screens/books/BookDetailScreen.jsx
// Version finale : page intermédiaire + bouton Télécharger fixe en bas (Premium only)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../components/common/CustomHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../services/api';
import colors from '../../constants/colors';
import usePreferenceStore from '../../store/preferenceStore';
import useAuthStore from '../../store/authStore';
import downloadManager from '../../utils/downloadManager';

const BookDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { isDarkMode } = usePreferenceStore();
  const { isPremium } = useAuthStore();

  // Thème dynamique
  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    text: isDarkMode ? colors.darkText : '#1F2937',
    primary: colors.primary,
    secondaryText: isDarkMode ? '#94A3B8' : '#444',
  };

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBook();
  }, [id]);

  const handleDownload = async () => {
    if (!isPremium()) {
      Alert.alert('Premium requis', 'Le téléchargement est réservé aux membres Premium.');
      return;
    }

    setDownloading(true);
    try {
      await downloadManager.downloadContent('book', id);
      Alert.alert(
        '✅ Succès',
        'Le livre a été téléchargé avec succès !\nIl apparaît maintenant dans Mes Téléchargements.'
      );
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de télécharger le livre.');
    } finally {
      setDownloading(false);
    }
  };

  const handleRead = () => {
    navigation.navigate('BookReader', {
      urlFichier: book.urlFichier,
      titre: book.titre,
    });
  };

  if (loading) return <LoadingSpinner message="Chargement du livre..." />;

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <CustomHeader title={book?.titre} showBack={true} />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Couverture grande */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: book?.urlCouverture }}
            style={styles.cover}
            resizeMode="contain"
          />
        </View>

        {/* Infos détaillées */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            {book?.titre}
          </Text>
          <Text style={[styles.author, { color: theme.primary }]}>
            {book?.auteur}
          </Text>
          {book?.editeur && (
            <Text style={[styles.meta, { color: theme.secondaryText }]}>
              {book.editeur} • {book.nombrePages} pages
            </Text>
          )}
          <Text style={[styles.category, { color: theme.primary }]}>
            {book?.categorie}
          </Text>

          <View style={styles.divider} />

          <Text style={[styles.description, { color: theme.secondaryText }]}>
            {book?.description}
          </Text>
        </View>
      </ScrollView>

      {/* === BOUTONS FIXES EN BAS === */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        {/* Bouton principal Lire */}
        <TouchableOpacity style={[styles.readButton, { backgroundColor: '#10B981' }]} onPress={handleRead}>
          <Ionicons name="book-outline" size={22} color="#fff" />
          <Text style={styles.readText}>Lire le livre</Text>
        </TouchableOpacity>

        {/* Bouton Télécharger (visible uniquement Premium) */}
        {isPremium() && (
          <TouchableOpacity
            style={[styles.downloadButton, { backgroundColor: theme.primary }]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={22} color="#fff" />
                <Text style={styles.downloadText}>Télécharger le livre</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  scrollContent: { flex: 1 },
  coverContainer: {
    height: 320,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  author: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    fontSize: 15,
    marginBottom: 8,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.1)',
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  readText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  downloadText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default BookDetailScreen;