// mobile/src/components/common/CustomHeader.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../../constants/colors';

const CustomHeader = ({ title, showBack = true }) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainApp'); 
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        {/* Conteneur gauche pour la flèche */}
        <View style={styles.sideContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.7}
              accessibilityLabel="Retour"
            >
              {/* Utilisation de chevron-back pour un look plus moderne/iOS-like */}
              <Ionicons name="chevron-back" size={26} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Titre centré */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Conteneur droit vide pour maintenir l'équilibre du Flexbox */}
        <View style={styles.sideContainer} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#E6F0FA',
    // Gestion du padding top pour Android/iOS (simule un SafeAreaView léger)
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1,
    borderBottomColor: '#D1E0F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  header: {
    height: 56, // Hauteur standardisée Material Design / iOS
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  sideContainer: {
    width: 44, // Largeur fixe pour garantir le centrage parfait du titre
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20, // Cercle discret au clic
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Effet de relief léger
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomHeader;