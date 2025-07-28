import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { withErrorBoundary } from '@/components/ErrorBoundary';
import { IMAGES } from '@/lib/constants/images';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

function SignIn() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigatingToSignUp, setIsNavigatingToSignUp] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    if (!isLoaded) {
      setError('Authentication system is loading...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Start sign-in process using Clerk
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in process is complete, set the created session as active
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/scripts');
      } else {
        // If the status isn't complete, check why
        console.error(
          'Sign in incomplete:',
          JSON.stringify(signInAttempt, null, 2)
        );
        setError('Sign in process incomplete. Please try again.');
      }
    } catch (authError: any) {
      console.error('Clerk sign in error:', authError);

      // Handle different Clerk error types
      let errorMessage = 'Authentication failed';
      if (authError.errors && authError.errors.length > 0) {
        const clerkError = authError.errors[0];
        switch (clerkError.code) {
          case 'form_identifier_not_found':
            errorMessage =
              'Email not found. Please check your email or sign up.';
            break;
          case 'form_password_incorrect':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'form_identifier_exists':
            errorMessage = 'This email is already registered.';
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

  const handleNavigateToSignUp = () => {
    if (isNavigatingToSignUp) return; // Prevent multiple clicks

    setIsNavigatingToSignUp(true);
    // Reset after a delay
    setTimeout(() => {
      setIsNavigatingToSignUp(false);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={{
              uri: IMAGES.signIn.header,
            }}
            style={styles.headerImage}
          />
          <View style={styles.overlay} />
          <Text style={styles.title}>Bon retour</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour continuer à créer des vidéos incroyables
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.inputContainer}>
              <Mail size={20} color={SHARED_STYLE_COLORS.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={SHARED_STYLE_COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={SHARED_STYLE_COLORS.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={SHARED_STYLE_COLORS.textTertiary}
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
              onPress={handleSignIn}
              disabled={loading || !isLoaded}
            >
              {loading ? (
                <ActivityIndicator color={SHARED_STYLE_COLORS.text} />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    Connexion {!isLoaded ? '(Loading...)' : ''}
                  </Text>
                  <ArrowRight size={20} color={SHARED_STYLE_COLORS.text} />
                </>
              )}
            </TouchableOpacity>

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotPasswordButton}>
                <Text style={styles.forgotPasswordText}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            </Link>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vous n&apos;avez pas de compte ?
            </Text>
            <Link
              href="/(auth)/sign-up"
              asChild
              onPress={handleNavigateToSignUp}
              disabled={isNavigatingToSignUp}
            >
              <TouchableOpacity disabled={isNavigatingToSignUp}>
                <Text
                  style={[
                    styles.footerLink,
                    isNavigatingToSignUp && styles.footerLinkDisabled,
                  ]}
                >
                  Inscription
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
    backgroundColor: SHARED_STYLE_COLORS.background,
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
    color: SHARED_STYLE_COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.text,
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
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
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingLeft: 12,
    color: SHARED_STYLE_COLORS.text,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
  },
  buttonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  forgotPasswordButton: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: SHARED_STYLE_COLORS.primary,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    color: SHARED_STYLE_COLORS.textSecondary,
    fontSize: 14,
  },
  footerLink: {
        color: SHARED_STYLE_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  footerLinkDisabled: {
    opacity: 0.5,
  },
  error: {
    color: SHARED_STYLE_COLORS.warning,
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 4,
    textAlign: 'center',
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
});

export default withErrorBoundary(SignIn);
