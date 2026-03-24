// mobile/src/screens/common/OfflineScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import CustomHeader from '../../components/common/CustomHeader';

const OfflineScreen = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <CustomHeader title="Hors ligne" showBack={false} />

      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={120} color="#94A3B8" />

        <Text style={styles.title}>Vous êtes hors ligne</Text>
        <Text style={styles.subtitle}>
          Le mode hors connexion est activé.{'\n'}
          Vous pouvez consulter le contenu déjà téléchargé.
        </Text>

        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Réessayer la connexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: colors.text, 
    marginTop: 30, 
    marginBottom: 12 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#64748B', 
    textAlign: 'center', 
    lineHeight: 24 
  },
  button: { 
    marginTop: 40, 
    backgroundColor: colors.primary, 
    paddingVertical: 16, 
    paddingHorizontal: 40, 
    borderRadius: 12 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});

export default OfflineScreen;