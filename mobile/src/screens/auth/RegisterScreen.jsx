// mobile/src/screens/auth/RegisterScreen.jsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Modal, 
  FlatList,
  Image 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../../constants/colors';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { register } from '../../services/authService';

const ministereOptions = [
  'Hommes', 'Femmes', 'Jeunesse', 'Enfants'
];

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({ nom: '', prenoms: '', tel: '', ministere: 'Autre', motDePasse: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMinistereModal, setShowMinistereModal] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await register(form);
      
      // Récupération du devOTP directement depuis la réponse du register (mode dev)
      const devOTP = response?.data?.devOTP;

      navigation.navigate('OTPVerification', { 
        tel: form.tel, 
        devOTP 
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de l’inscription. Vérifiez les informations.');
    } finally {
      setLoading(false);
    }
  };

  const selectMinistere = (value) => {
    setForm({ ...form, ministere: value });
    setShowMinistereModal(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Logo centré */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Créer un compte</Text>

        <View style={styles.formContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Nom" 
            onChangeText={(v) => setForm({ ...form, nom: v })} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Prénoms" 
            onChangeText={(v) => setForm({ ...form, prenoms: v })} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Téléphone (8 chiffres)" 
            keyboardType="phone-pad" 
            maxLength={8} 
            onChangeText={(v) => setForm({ ...form, tel: v })} 
          />

          {/* Dropdown Ministère */}
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setShowMinistereModal(true)}
          >
            <Text style={styles.dropdownText}>
              {form.ministere}
            </Text>
          </TouchableOpacity>

          <TextInput 
            style={styles.input} 
            placeholder="Mot de passe" 
            secureTextEntry 
            onChangeText={(v) => setForm({ ...form, motDePasse: v })} 
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? <LoadingSpinner size="small" color="#fff" /> : <Text style={styles.buttonText}>S’inscrire</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkContainer}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.link}>
              Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Ministère */}
      <Modal visible={showMinistereModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisissez votre ministère</Text>
            <FlatList
              data={ministereOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.optionItem} 
                  onPress={() => selectMinistere(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowMinistereModal(false)}
            >
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 120, height: 120 },
  title: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 30, color: colors.primary },
  formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  input: { 
    backgroundColor: '#f5f5f5', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    fontSize: 16,
    justifyContent: 'center'
  },
  dropdownText: { fontSize: 16, color: '#333' },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: 'red', textAlign: 'center', marginVertical: 10 },

  linkContainer: { marginTop: 20, alignItems: 'center' },
  link: { fontSize: 15, color: '#666' },
  linkBold: { color: colors.primary, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 15, color: colors.primary },
  optionItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionText: { fontSize: 16 },
  closeButton: { marginTop: 15, padding: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  closeText: { fontWeight: '600', color: '#333' },
  container: { 
    flex: 1, 
    backgroundColor: '#f3f8fd'   // ← Fond bleu clair comme le logo EPT
  },
});

export default RegisterScreen;