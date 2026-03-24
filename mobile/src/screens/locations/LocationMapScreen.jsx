// mobile/src/screens/locations/LocationMapScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import CustomHeader from '../../components/common/CustomHeader';
import usePreferenceStore from '../../store/preferenceStore';
import colors from '../../constants/colors';

const LocationMapScreen = () => {
  const route = useRoute();
  const { location } = route.params || {};
  const { isDarkMode } = usePreferenceStore();

  const theme = {
    background: isDarkMode ? colors.darkBackground : '#f3f8fd',
    text: isDarkMode ? colors.darkText : '#1F2937',
  };

  if (!location || !location.latitude || !location.longitude) {
    return <Text style={styles.error}>Coordonnées non disponibles</Text>;
  }

  const initialRegion = {
    latitude: parseFloat(location.latitude),
    longitude: parseFloat(location.longitude),
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
      <CustomHeader title={location.nom} />

      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsCompass
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
          }}
          title={location.nom}
          description={`${location.quartier}, ${location.ville}`}
        />
      </MapView>

      {/* Info fixe en bas */}
      <View style={styles.infoBox}>
        <Text style={[styles.name, { color: colors.primary }]}>{location.nom}</Text>
        <Text style={styles.adresse}>
          {location.adresse}, {location.quartier}, {location.ville}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  map: { flex: 1 },
  infoBox: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 10,
  },
  name: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  adresse: { fontSize: 15, color: '#555' },
  error: { textAlign: 'center', marginTop: 100, fontSize: 16, color: 'red' },
});

export default LocationMapScreen;