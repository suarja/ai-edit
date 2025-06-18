import React, { useState } from 'react';
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
import { useSignUp } from '@clerk/clerk-expo';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { IMAGES } from '@/lib/constants/images';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { reportAuthError } from '@/lib/services/errorReporting';

function SignUpClerk() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);

  async function handleSignUp() {
    if (!isLoaded) {
      setError('Authentication system is loading...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Log environment status for debugging
      if (__DEV__) {
        console.log('Clerk sign up for email:', email);
      }

      // Validate inputs
      if (!email || !password || !fullName) {
        setError('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }

      // Start sign-up process using Clerk
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Set 'pendingVerification' to true to display verification form
      setPendingVerification(true);

      if (__DEV__) {
        console.log('Email verification sent to:', email);
      }
    } catch (authError: any) {
      console.error('Clerk sign up error:', authError);

      // Report error for debugging
      reportAuthError(authError, {
        screen: 'SignUpClerk',
        action: 'clerk_sign_up',
        userId: email,
      });

      // Handle different Clerk error types
      let errorMessage = 'Sign up failed';
      if (authError.errors && authError.errors.length > 0) {
        const clerkError = authError.errors[0];
        switch (clerkError.code) {
          case 'form_identifier_exists':
            errorMessage =
              'Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email.';
            break;
          case 'form_password_pwned':
            errorMessage =
              'Ce mot de passe est trop faible. Veuillez en choisir un plus sécurisé.';
            break;
          case 'form_password_length_too_short':
            errorMessage =
              'Le mot de passe doit contenir au moins 8 caractères.';
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

  // Handle submission of verification form
  async function handleVerifyCode() {
    if (!isLoaded) {
      setError('Authentication system is loading...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      // If verification was completed, set the session to active
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });

        // Success! User is signed up and verified
        Alert.alert(
          '✅ Inscription réussie !',
          'Votre compte a été créé et vérifié avec succès.',
          [
            {
              text: 'Continuer',
              onPress: () => router.replace('/(tabs)/source-videos'),
            },
          ]
        );
      } else {
        // If the status is not complete, check why
        console.error(
          'Email verification incomplete:',
          JSON.stringify(signUpAttempt, null, 2)
        );
        setError(
          'Verification incomplete. Please check the code and try again.'
        );
      }
    } catch (authError: any) {
      console.error('Clerk verification error:', authError);

      // Report error for debugging
      reportAuthError(authError, {
        screen: 'SignUpClerk',
        action: 'clerk_verify_email',
        userId: email,
      });

      // Handle different Clerk error types
      let errorMessage = 'Email verification failed';
      if (authError.errors && authError.errors.length > 0) {
        const clerkError = authError.errors[0];
        switch (clerkError.code) {
          case 'form_code_incorrect':
            errorMessage =
              'Code de vérification incorrect. Veuillez vérifier et réessayer.';
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

  const handleNavigateToSignIn = () => {
    if (isNavigatingToSignIn) return;

    setIsNavigatingToSignIn(true);
    setTimeout(() => {
      setIsNavigatingToSignIn(false);
    }, 1000);
  };

  // If verification is pending, show verification form
  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Image
              source={{
                uri:
                  IMAGES.signUp?.header ||
                  'https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg',
              }}
              style={styles.headerImage}
            />
            <View style={styles.overlay} />
            <Text style={styles.title}>Vérifiez votre email</Text>
            <Text style={styles.subtitle}>
              Nous avons envoyé un code de vérification à {email}
            </Text>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.inputContainer}>
                <Mail size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="Code de vérification"
                  placeholderTextColor="#888"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading || !isLoaded}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Vérifier</Text>
                    <ArrowRight size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setPendingVerification(false)}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Retour</Text>
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
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={{
              uri:
                IMAGES.signUp?.header ||
                'https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg',
            }}
            style={styles.headerImage}
          />
          <View style={styles.overlay} />
          <Text style={styles.title}>Créer un Compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez-nous et commencez à créer des vidéos incroyables
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.inputContainer}>
              <User size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                placeholderTextColor="#888"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#888" />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
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
              onPress={handleSignUp}
              disabled={loading || !isLoaded}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    S&apos;inscrire {!isLoaded ? '(Loading...)' : ''}
                  </Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
            <Link
              href="/(auth)/sign-in-clerk"
              asChild
              onPress={handleNavigateToSignIn}
              disabled={isNavigatingToSignIn}
            >
              <TouchableOpacity disabled={isNavigatingToSignIn}>
                <Text
                  style={[
                    styles.footerLink,
                    isNavigatingToSignIn && styles.footerLinkDisabled,
                  ]}
                >
                  Se connecter
                </Text>
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
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  footerLinkDisabled: {
    opacity: 0.5,
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

export default withErrorBoundary(SignUpClerk);
