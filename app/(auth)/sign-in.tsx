import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting to sign in with:', email);
      console.log('Running on platform:', Platform.OS);

      // Debug the network connection first
      try {
        console.log('Testing network connectivity...');
        const response = await fetch('https://www.google.com');
        console.log('Network test to Google:', response.status);

        // Test Supabase connectivity with a simple GET request
        try {
          console.log('Testing Supabase connectivity...');
          const healthCheck = await fetch(
            process.env.EXPO_PUBLIC_SUPABASE_URL + '/rest/v1/',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
              },
            }
          );
          console.log('Supabase health check:', healthCheck.status);
        } catch (supabaseTestError) {
          console.error(
            'Supabase connectivity test failed:',
            supabaseTestError
          );
        }
      } catch (networkError) {
        console.error('Network test failed:', networkError);
        Alert.alert(
          'Network Error',
          'Unable to connect to the internet. Please check your connection.'
        );
        setLoading(false);
        return;
      }

      try {
        console.log('Signing in via Supabase...');
        const { error: signInError, data } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        console.log('Sign in response:', signInError ? 'Error' : 'Success');

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        router.replace('/(tabs)/settings');
      } catch (authError: any) {
        console.error('Sign in auth error:', authError);
        setError(authError.message || 'Authentication failed');
      }
    } catch (e: any) {
      console.error('Sign in general error:', e);
      setError(e.message || 'An unexpected error occurred');
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
          <Text style={styles.buttonText}>Connexion</Text>
          <ArrowRight size={20} color="#fff" />
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
