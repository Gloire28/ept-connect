// mobile/src/constants/colors.js
// Version finale MD3 : compatible react-native-paper v5.12.3 + palette EPT complète

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const baseColors = {
  primary: '#0A2540',
  primaryDark: '#051829',
  accent: '#D4AF37',
  lightBackground: '#f3f8fd',
  headerBackground: '#E6F0FA',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  destructive: '#FF3B30',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  darkBackground: '#0F172A',
  darkCard: '#1E2937',
  darkText: '#F1F5F9',
};

// Export principal utilisé partout (HomeScreen, SettingsScreen, etc.)
export const colors = baseColors;

// Thèmes corrects pour PaperProvider (v5)
export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: baseColors.primary,
    accent: baseColors.accent,
    background: baseColors.lightBackground,
    surface: baseColors.card,
    text: baseColors.text,
    onSurface: baseColors.text,
    onBackground: baseColors.text,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: baseColors.primary,
    accent: baseColors.accent,
    background: baseColors.darkBackground,
    surface: baseColors.darkCard,
    text: baseColors.darkText,
    onSurface: baseColors.darkText,
    onBackground: baseColors.darkText,
  },
};

export default colors;