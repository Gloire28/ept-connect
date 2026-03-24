// mobile/src/navigation/TabNavigator.jsx
// Version finale : labels français + icônes précises + style EPT bleu
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import SermonsListScreen from '../screens/sermons/SermonsListScreen';
import MusicListScreen from '../screens/music/MusicListScreen';
import BooksListScreen from '../screens/books/BooksListScreen';
import AnnouncementsScreen from '../screens/announcements/AnnouncementsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Sermons') iconName = 'book-outline';
          else if (route.name === 'Music') iconName = 'musical-notes';
          else if (route.name === 'Books') iconName = 'library-outline';
          else if (route.name === 'Announcements') iconName = 'megaphone-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0A2540', // Bleu EPT profond
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: insets.bottom + 5,
          height: 60 + insets.bottom,
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#E5E7EB',
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Sermons" component={SermonsListScreen} options={{ title: 'Sermons' }} />
      <Tab.Screen name="Music" component={MusicListScreen} options={{ title: 'Musique' }} />
      <Tab.Screen name="Books" component={BooksListScreen} options={{ title: 'Livres' }} />
      <Tab.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Annonces' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;