import { useState } from 'react';
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
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { env } from '@/lib/config/env';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: __DEV__ ? 'http://localhost:3000' : 'https://editia.app',
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.header}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg',
              }}
              style={styles.headerImage}
            />
            <View style={styles.overlay} />
            <Text style={styles.title}>Email envoyé !</Text>
            <Text style={styles.subtitle}>
              Vérifiez votre boîte email pour réinitialiser votre mot de passe
            </Text>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>📧</Text>
              </View>

              <Text style={styles.successTitle}>
                Lien de réinitialisation envoyé
              </Text>

              <Text style={styles.successText}>
                Nous avons envoyé un lien de réinitialisation à{' '}
                <Text style={styles.emailText}>{email}</Text>
              </Text>

              <Text style={styles.instructionsText}>
                Cliquez sur le lien dans l&apos;email pour créer un nouveau mot
                de passe. Le lien expire dans 24 heures.
              </Text>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/(auth)/sign-in')}
              >
                <Text style={styles.primaryButtonText}>
                  Retour à la connexion
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>
                  Renvoyer l&apos;email
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <Image
            source={{
              uri: 'https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg',
            }}
            style={styles.headerImage}
          />
          <View style={styles.overlay} />
          <Text style={styles.title}>Mot de passe oublié ?</Text>
          <Text style={styles.subtitle}>
            Entrez votre email pour recevoir un lien de réinitialisation
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Adresse email</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="votre@email.com"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading || !email}
            >
              {loading ? (
                <Text style={styles.buttonText}>Envoi en cours...</Text>
              ) : (
                <Text style={styles.buttonText}>
                  Envoyer le lien de réinitialisation
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vous vous souvenez de votre mot de passe ?
            </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Se connecter</Text>
              </TouchableOpacity>
            </Link>
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
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    height: 300,
    justifyContent: 'flex-end',
    padding: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: 32,
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
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
  buttonContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Success state styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emailText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  actionContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 16,
  },
});
