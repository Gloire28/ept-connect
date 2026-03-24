// mobile/src/screens/auth/OTPVerificationScreen.jsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Image 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import colors from '../../constants/colors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { verifyOTP } from '../../services/authService';

const OTPVerificationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { tel, devOTP } = route.params || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await verifyOTP(tel, otp);
      // 🔥 NOUVEAU FLUX : retour vers Login après validation OTP
      navigation.replace('Login');
    } catch (err) {
      setError('Code OTP incorrect ou expiré');
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

        <Text style={styles.title}>Vérification OTP</Text>
        <Text style={styles.subtitle}>Code envoyé au {tel}</Text>

        {/* Bandeau devOTP (mode développement) */}
        {devOTP && (
          <View style={styles.devBanner}>
            <Text style={styles.devTitle}>🔧 MODE DÉVELOPPEMENT</Text>
            <Text style={styles.devCode}>Code OTP : <Text style={styles.devOtpText}>{devOTP}</Text></Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entrez le code à 6 chiffres"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleVerify} 
            disabled={loading || otp.length !== 6}
          >
            {loading ? <LoadingSpinner size="small" color="#fff" /> : <Text style={styles.buttonText}>Vérifier le code</Text>}
          </TouchableOpacity>

          {timer > 0 ? (
            <Text style={styles.timer}>Renvoyer le code dans {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={() => { /* renvoyer OTP */ }}>
              <Text style={styles.resend}>Renvoyer le code</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 140, height: 140 },

  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 8, 
    color: colors.primary 
  },
  subtitle: { 
    textAlign: 'center', 
    marginBottom: 20, 
    color: '#666' 
  },

  /* Bandeau devOTP */
  devBanner: { 
    backgroundColor: '#FFF3CD', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFEAA7'
  },
  devTitle: { fontSize: 13, fontWeight: '700', color: '#856404' },
  devCode: { fontSize: 18, marginTop: 6, color: '#333' },
  devOtpText: { fontWeight: 'bold', color: '#D32F2F' },

  formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  input: { 
    backgroundColor: '#f5f5f5', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 18, 
    textAlign: 'center', 
    letterSpacing: 8,
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
  error: { color: 'red', textAlign: 'center', marginVertical: 10 },
  timer: { textAlign: 'center', marginTop: 20, color: '#888' },
  resend: { textAlign: 'center', marginTop: 20, color: colors.primary, fontWeight: '600' },
  container: { 
    flex: 1, 
    backgroundColor: '#f3f8fd'   // ← Fond bleu clair comme le logo EPT
  },
});

export default OTPVerificationScreen;