// mobile/src/App.js
// Version finale : Dark Mode 100% stable (fallback DefaultTheme + useMemo)
import { useEffect, useState, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, DefaultTheme } from 'react-native-paper';
import * as Notifications from 'expo-notifications';

import useAuthStore from './store/authStore';
import usePreferenceStore from './store/preferenceStore';
import StackNavigator from './navigation/StackNavigator';
import { paperLightTheme, paperDarkTheme } from './constants/colors';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const { loadUserFromStorage } = useAuthStore();
  const { initialize, isDarkMode } = usePreferenceStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Chargement initial
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadUserFromStorage();
        await initialize();
      } catch (error) {
        console.error('Erreur initialisation App:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    initializeApp();
  }, [loadUserFromStorage, initialize]);

 
  const currentTheme = useMemo(() => {
    if (isDarkMode === undefined) return DefaultTheme;
    return isDarkMode ? paperDarkTheme : paperLightTheme;
  }, [isDarkMode]);

  if (!isInitialized) {
    return null; 
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={currentTheme} key={isDarkMode ? 'dark' : 'light'}>
        <NavigationContainer>
          <StatusBar
            style={isDarkMode ? 'light' : 'dark'}
            backgroundColor={isDarkMode ? '#0F172A' : '#0A2540'}
          />
          <StackNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}