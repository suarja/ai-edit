import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { reportAuthError } from '@/lib/services/errorReporting';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { IMAGES } from '@/lib/constants/images';

function ForgotPassword() {
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/scripts');
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Send the password reset code to the user's email
  async function handleResetPassword() {
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!isLoaded) {
      setError('Authentication system is loading...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Starting password reset for:', email);

      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setSuccessfulCreation(true);
      console.log('✅ Password reset email sent successfully');
    } catch (authError: any) {
      console.error('❌ Password reset error:', authError);

      // Report error for debugging
      reportAuthError(authError, {
        screen: 'ForgotPassword',
        action: 'clerk_reset_password_request',
        userId: email,
      });

      // Handle different Clerk error types
      let errorMessage = 'Une erreur est survenue';
      if (authError.errors && authError.errors.length > 0) {
        const clerkError = authError.errors[0];
        switch (clerkError.code) {
          case 'form_identifier_not_found':
            errorMessage =
              'Email introuvable. Veuillez vérifier votre email ou vous inscrire.';
            break;
          case 'form_param_format_invalid':
            errorMessage =
              "Format de l'email invalide. Veuillez vérifier votre email.";
            break;
          default:
            errorMessage =
              clerkError.longMessage || clerkError.message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Reset the user's password using the code and new password
  async function handlePasswordReset() {
    if (!code.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!isLoaded) {
      setError('Authentication system is loading...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔑 Attempting password reset with code');

      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      // Check if 2FA is required
      if (result.status === 'needs_second_factor') {
        setSecondFactor(true);
        console.log('⚠️ 2FA required for password reset');
      } else if (result.status === 'complete') {
        // Set the active session (user is now signed in with new password)
        await setActive({ session: result.createdSessionId });

        Alert.alert(
          '✅ Mot de passe réinitialisé !',
          'Votre mot de passe a été mis à jour avec succès.',
          [
            {
              text: 'Continuer',
              onPress: () => router.replace('/scripts'),
            },
          ]
        );
      } else {
        console.error('❌ Password reset incomplete:', result.status);
        setError('Réinitialisation incomplète. Veuillez réessayer.');
      }
    } catch (authError: any) {
      console.error('❌ Password reset verification error:', authError);

      // Report error for debugging
      reportAuthError(authError, {
        screen: 'ForgotPassword',
        action: 'clerk_reset_password_verify',
        userId: email,
      });

      // Handle different Clerk error types
      let errorMessage = 'Erreur de vérification';
      if (authError.errors && authError.errors.length > 0) {
        const clerkError = authError.errors[0];
        switch (clerkError.code) {
          case 'form_code_incorrect':
            errorMessage =
              'Code de vérification incorrect. Veuillez réessayer.';
            break;
          case 'verification_expired':
            errorMessage =
              'Le code de vérification a expiré. Veuillez en demander un nouveau.';
            break;
          default:
            errorMessage =
              clerkError.longMessage || clerkError.message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // If password reset email was sent successfully, show verification form
  if (successfulCreation && !secondFactor) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSuccessfulCreation(false)}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>

            <Image
              source={{
                uri:
                  IMAGES.signIn?.header ||
                  'https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg',
              }}
              style={styles.headerImage}
            />
            <View style={styles.overlay} />
            <Text style={styles.title}>Réinitialiser le mot de passe</Text>
            <Text style={styles.subtitle}>
              Entrez le code reçu à {email} et votre nouveau mot de passe
            </Text>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
              {error && <Text style={styles.error}>{error}</Text>}

              <Text style={styles.inputLabel}>Code de vérification</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez le code reçu par email"
                  placeholderTextColor="#888"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>

              <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre nouveau mot de passe"
                  placeholderTextColor="#888"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handlePasswordReset}
                disabled={loading || !code.trim() || !password.trim()}
              >
                <Text style={styles.buttonText}>
                  {loading
                    ? 'Réinitialisation...'
                    : 'Réinitialiser le mot de passe'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Show 2FA message if required
  if (secondFactor) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>
            Authentification à deux facteurs requise
          </Text>
          <Text style={styles.subtitle}>
            Cette fonctionnalité nécessite une authentification à deux facteurs,
            mais cette interface ne la prend pas encore en charge.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setSecondFactor(false);
              setSuccessfulCreation(false);
            }}
          >
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Initial form to enter email
  return (
    <KeyboardAvoidingView
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <Image
            source={{
              uri:
                IMAGES.signIn?.header ||
                'https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg',
            }}
            style={styles.headerImage}
          />
          <View style={styles.overlay} />
          <Text style={styles.title}>Mot de passe oublié ?</Text>
          <Text style={styles.subtitle}>
            Entrez votre email pour recevoir un code de réinitialisation
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            {error && <Text style={styles.error}>{error}</Text>}

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
                editable={!loading}
                autoFocus
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  Envoyer le code de réinitialisation
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    height: 300,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingLeft: 12,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 4,
    textAlign: 'center',
    backgroundColor: '#fff5f5',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffdddd',
  },
});

export default withErrorBoundary(ForgotPassword);
