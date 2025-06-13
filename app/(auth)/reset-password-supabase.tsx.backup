import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { IMAGES } from '@/lib/constants/images';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié suite au callback de reset password
    checkAuthenticationState();
  }, []);

  const checkAuthenticationState = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking auth state:', error);
        Alert.alert(
          'Erreur',
          'Lien de réinitialisation invalide ou expiré. Veuillez demander un nouveau lien.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') }]
        );
        return;
      }

      if (session) {
        setIsAuthenticated(true);
      } else {
        Alert.alert(
          'Session expirée',
          'Votre lien de réinitialisation a expiré. Veuillez demander un nouveau lien.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') }]
        );
      }
    } catch (error) {
      console.error('Exception during auth check:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') }]
      );
    }
  };

  const handleResetPassword = async () => {
    if (!isAuthenticated) {
      Alert.alert('Erreur', 'Session non valide. Veuillez demander un nouveau lien.');
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Succès !',
        'Votre mot de passe a été réinitialisé avec succès.',
        [
          {
            text: 'Se connecter',
            onPress: () => router.replace('/(auth)/sign-in')
          }
        ]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert('Erreur', error.message || 'Impossible de réinitialiser le mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Vérification en cours...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={{
              uri: IMAGES.landing.header,
            }}
            style={styles.headerImage}
          />
          <View style={styles.overlay} />
          <Text style={styles.title}>Nouveau Mot de Passe</Text>
          <Text style={styles.subtitle}>
            Choisissez un nouveau mot de passe sécurisé
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#888" />
                ) : (
                  <Eye size={20} color="#888" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#888"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#888" />
                ) : (
                  <Eye size={20} color="#888" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.passwordHints}>
              <Text style={styles.hintTitle}>Critères du mot de passe :</Text>
              <Text style={[styles.hint, password.length >= 6 && styles.hintValid]}>
                • Au moins 6 caractères
              </Text>
              <Text style={[styles.hint, password === confirmPassword && password.length > 0 && styles.hintValid]}>
                • Les mots de passe correspondent
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
                (!password || !confirmPassword || password !== confirmPassword || password.length < 6) && styles.buttonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={loading || !password || !confirmPassword || password !== confirmPassword || password.length < 6}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Text>
              {!loading && <ArrowRight size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    height: 250,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    minHeight: 400,
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  passwordHints: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  hintTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  hintValid: {
    color: '#4ade80',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 