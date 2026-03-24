// mobile/src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const LoadingSpinner = ({ 
  size = 'large', 
  color = colors.primary, 
  message = 'Chargement...' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
  },
});

export default LoadingSpinner;