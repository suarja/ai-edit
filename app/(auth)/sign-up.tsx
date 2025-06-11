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
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { env } from '@/lib/config/env';
import { IMAGES } from '@/lib/constants/images';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<{
    code?: string;
    message?: string;
    details?: string;
    name?: string;
    status?: number;
    debug?: any;
  } | null>(null);
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);

  async function handleSignUp() {
    try {
      setLoading(true);
      setError(null);
      setDetailedError(null);

      // Log environment status
      if (__DEV__) {
        console.log('Supabase URL:', env.SUPABASE_URL);
        console.log('Environment:', env.ENVIRONMENT);
        console.log('Signing up with email:', email);
      }

      // Validate inputs
      if (!email || !password || !fullName) {
        setError('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }

      // Sign up the user with redirect URL
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: __DEV__
            ? 'http://localhost:3000/auth/confirm'
            : 'https://editia.app/auth/confirm',
        },
      });

      console.log('Sign up response:', signUpError ? signUpError : data);

      if (signUpError) throw signUpError;

      // if (data.user) {
      //   router.replace('/(auth)/sign-in');
      // }

      // if (data.user) {
      //   try {
      //     const { error: insertError } = await supabase.from('users').insert({
      //       id: data.user.id,
      //       full_name: fullName,
      //       role: 'user',
      //     });

      //     if (insertError) {
      //       console.error('Failed to create user record:', insertError);
      //       throw new Error("Échec de l'inscription. Veuillez réessayer.");
      //     }

      //     // Add a small delay before navigation to prevent UI freezing
      //     setTimeout(() => {
      //       if (!loading) {
      //         // Double-check we're still in the sign-up process
      //         router.replace('/(onboarding)/welcome');
      //       }
      //     }, 300);
      //   } catch (dbError) {
      //     console.error('Database operation error:', dbError);
      //     throw dbError;
      //   }
      // }
    } catch (e: any) {
      console.error('Signup error:', e.message);
      setError(e.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  const handleNavigateToSignIn = () => {
    if (isNavigatingToSignIn) return; // Prevent multiple clicks

    setIsNavigatingToSignIn(true);
    // Reset after a delay
    setTimeout(() => {
      setIsNavigatingToSignIn(false);
    }, 1000);
  };

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
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>S&apos;inscrire</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
            <Link
              href="/(auth)/sign-in"
              asChild
              onPress={handleNavigateToSignIn}
              disabled={isNavigatingToSignIn}
            >
              <TouchableOpacity disabled={isNavigatingToSignIn}>
                <Text
                  style={[
                    styles.link,
                    isNavigatingToSignIn && styles.disabledLink,
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
    justifyContent: 'flex-end',
    padding: 20,
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
    minHeight: 400, // Ensure minimum height for content
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
  error: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  debugButton: {
    alignSelf: 'center',
    marginTop: 8,
    padding: 6,
  },
  debugButtonText: {
    color: '#888',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  debugInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  debugTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  disabledLink: {
    opacity: 0.5,
  },
});
