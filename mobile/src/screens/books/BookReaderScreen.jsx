// mobile/src/screens/books/BookReaderScreen.jsx
// Version hybride finale : Google Docs Viewer (online Bunny) + Lecture directe (offline local)
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../components/common/CustomHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const BookReaderScreen = () => {
  const route = useRoute();
  const { urlFichier, titre } = route.params || {};
  const { isDarkMode } = usePreferenceStore();

  if (!urlFichier) {
    return <LoadingSpinner message="Chargement du livre..." />;
  }

  // Détection fichier local téléchargé
  const isLocalFile = urlFichier.startsWith('file://');

  // URL du viewer (hybride)
  const viewerUrl = isLocalFile
    ? urlFichier
    : `https://docs.google.com/gview?url=${encodeURIComponent(urlFichier)}&embedded=true`;

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? colors.darkBackground : '#f3f8fd' }]}>
      <CustomHeader title={titre} showBack={true} />
      
      <WebView
        source={{ uri: viewerUrl }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => <LoadingSpinner message="Ouverture du PDF..." />}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        
        // Props spéciales UNIQUEMENT pour les fichiers locaux
        {...(isLocalFile && {
          allowFileAccess: true,
          originWhitelist: ['*'],
          allowUniversalAccessFromFileURLs: true,
          mixedContentMode: 'always',
        })}

        onError={(syntheticEvent) => {
          console.error('PDF Error:', syntheticEvent.nativeEvent);
          Alert.alert("Erreur de chargement", "Impossible d'ouvrir le PDF.\nVérifiez votre connexion ou réessayez.");
        }}
        onLoadEnd={() => console.log('✅ PDF chargé avec succès')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
});

export default BookReaderScreen;