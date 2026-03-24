// mobile/src/screens/auth/LoginScreen.jsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../constants/colors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useAuthStore from '../../store/authStore';
import { loginWithPassword } from '../../services/authService';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuthStore();

  const [tel, setTel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!tel || tel.length < 8 || !motDePasse) {
      setError('Numéro de téléphone et mot de passe obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await loginWithPassword(tel, motDePasse);
      navigation.replace('MainApp');   // Redirection vers les tabs
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Logo centré (identique à RegisterScreen) */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>EPT Connect</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
            value={tel}
            onChangeText={setTel}
            maxLength={8}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={motDePasse}
            onChangeText={setMotDePasse}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? <LoadingSpinner size="small" color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Pas encore de compte ? S’inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 120, height: 120 },

  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 8, 
    color: colors.primary 
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginBottom: 30, 
    color: '#666' 
  },

  formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  input: { 
    backgroundColor: '#f5f5f5', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    marginBottom: 16 
  },
  button: { 
    backgroundColor: colors.primary, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { 
    marginTop: 24, 
    textAlign: 'center', 
    color: colors.primary, 
    fontWeight: '600' 
  },
  error: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f3f8fd'   // ← Fond bleu clair comme le logo EPT
  },
});

export default LoginScreen;