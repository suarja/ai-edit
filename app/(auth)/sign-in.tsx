import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import {
  reportAuthError,
  reportNetworkError,
} from '@/lib/services/errorReporting';
import { withErrorBoundary } from '@/components/ErrorBoundary';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (__DEV__) {
        console.log('Attempting to sign in with:', email);
        console.log('Running on platform:', Platform.OS);
      }

      // Test network connectivity first
      try {
        if (__DEV__) {
          console.log('Testing network connectivity...');
        }
        const response = await fetch('https://www.google.com', {
          method: 'HEAD',
        });
        if (__DEV__) {
          console.log('Network test to Google:', response.status);
        }

        // Test Supabase connectivity
        if (__DEV__) {
          console.log('Testing Supabase connectivity...');
        }
        const healthCheck = await fetch(
          process.env.EXPO_PUBLIC_SUPABASE_URL + '/rest/v1/',
          {
            method: 'HEAD',
            headers: {
              apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
            },
          }
        );
        if (__DEV__) {
          console.log('Supabase health check:', healthCheck.status);
        }
      } catch (supabaseTestError) {
        if (__DEV__) {
          console.error(
            'Supabase connectivity test failed:',
            supabaseTestError
          );
        }
      }

      try {
        if (__DEV__) {
          console.log('Signing in via Supabase...');
        }
        const { error: signInError, data } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (__DEV__) {
          console.log('Sign in response:', signInError ? 'Error' : 'Success');
        }

        if (signInError) {
          reportAuthError(signInError, {
            screen: 'SignIn',
            action: 'sign_in_with_password',
            userId: email,
          });
          setError(signInError.message);
          setLoading(false);
          return;
        }

        router.replace('/(tabs)/settings');
      } catch (authError: any) {
        reportAuthError(authError, {
          screen: 'SignIn',
          action: 'sign_in_exception',
          userId: email,
        });
        console.error('Sign in auth error:', authError);
        setError(authError.message || 'Authentication failed');
      }
    } catch (e: any) {
      // Handle network errors and other general errors
      if (e.message?.includes('fetch')) {
        reportNetworkError(e as Error, 'https://www.google.com', 'HEAD', {
          screen: 'SignIn',
          action: 'network_test',
        });
        console.error('Network test failed:', e);
        Alert.alert(
          'Network Error',
          'Unable to connect to the internet. Please check your connection.'
        );
      } else {
        reportAuthError(e, {
          screen: 'SignIn',
          action: 'general_error',
          userId: email,
        });
        console.error('Sign in general error:', e);
        setError(e.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/3756879/pexels-photo-3756879.jpeg',
          }}
          style={styles.headerImage}
        />
        <View style={styles.overlay} />
        <Text style={styles.title}>Bon retour</Text>
        <Text style={styles.subtitle}>
          Connectez-vous pour continuer à créer des vidéos incroyables
        </Text>
      </View>

      <View style={styles.form}>
        {error && <Text style={styles.error}>{error}</Text>}

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

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Connexion</Text>
              <ArrowRight size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous n'avez pas de compte ?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Inscription</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  form: {
    flex: 1,
    padding: 20,
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
  },
});

// Export with error boundary
export default withErrorBoundary(SignIn);
