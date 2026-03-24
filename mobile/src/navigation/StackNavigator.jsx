// mobile/src/navigation/StackNavigator.jsx
// Version finale : logout propre + toutes les routes profil (Profile + Premium + Settings)
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions, useNavigation } from '@react-navigation/native';

import useAuthStore from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Imports directs (stable et recommandé pour React Native)
import SermonDetailScreen from '../screens/sermons/SermonDetailScreen';
import SermonPlayerScreen from '../screens/sermons/SermonPlayerScreen';
import MusicPlayerScreen from '../screens/music/MusicPlayerScreen';
import MusicDetailScreen from '../screens/music/MusicDetailScreen';
import BookReaderScreen from '../screens/books/BookReaderScreen';
import AnnouncementDetailScreen from '../screens/announcements/AnnouncementsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PremiumScreen from '../screens/profile/PremiumScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import LocationsScreen from '../screens/locations/LocationsScreen';
import LocationDetailScreen from '../screens/locations/LocationDetailScreen';
import LocationMapScreen from '../screens/locations/LocationMapScreen';
import DownloadsScreen from '../screens/downloads/DownloadsScreen';
import BookDetailScreen from '../screens/books/BookDetailScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { isAuthenticated } = useAuthStore();
  const navigation = useNavigation();

  // Reset complet de la navigation dès la déconnexion
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        })
      );
    }
  }, [isAuthenticated, navigation]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainApp" component={TabNavigator} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Downloads" component={DownloadsScreen} />
          <Stack.Screen name="Premium" component={PremiumScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Locations" component={LocationsScreen} />
          <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
          <Stack.Screen name="LocationMap" component={LocationMapScreen} />
          <Stack.Screen name="SermonDetail" component={SermonDetailScreen} />
          <Stack.Screen name="SermonPlayer" component={SermonPlayerScreen} />
          <Stack.Screen name="MusicPlayer" component={MusicPlayerScreen} />
          <Stack.Screen name="MusicDetail" component={MusicDetailScreen} />
          <Stack.Screen name="BookDetail" component={BookDetailScreen} />
          <Stack.Screen name="BookReader" component={BookReaderScreen} />
          <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;