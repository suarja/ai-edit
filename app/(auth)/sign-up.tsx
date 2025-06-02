import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { env } from '@/lib/config/env';

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
  const [showDebugInfo, setShowDebugInfo] = useState(false);

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

      // Use try/catch specifically for the auth.signUp call
      try {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
        });

        // Capture all available error details from auth signup
        if (signUpError) {
          console.error('Sign up error:', signUpError);
          console.log('Sign up data:', JSON.stringify(data));

          // Store detailed error information
          setDetailedError({
            name: signUpError.name,
            code: signUpError.code || 'unknown',
            message: signUpError.message,
            status: signUpError.status,
            debug: {
              url: env.SUPABASE_URL,
              environment: env.ENVIRONMENT,
              testflight: env.IS_TESTFLIGHT,
              hasUser: data?.user ? 'yes' : 'no',
              hasSession: data?.session ? 'yes' : 'no',
            },
          });

          console.log('Detailed error:', detailedError);

          throw signUpError;
        }

        if (__DEV__) {
          console.log('Auth signup successful, user:', data.user?.id);
        }

        if (!data.user) {
          throw new Error('No user returned from signup');
        }

        // Proceed with user record creation
        try {
          if (__DEV__) {
            console.log(
              'Attempting to insert user record with ID:',
              data.user.id
            );
          }

          const { error: insertError, data: insertData } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              full_name: fullName,
              role: 'user',
            });

          if (insertError) {
            console.error('Failed to create user record:', insertError);
            // Show more detailed error information
            console.error('Error code:', insertError.code);
            console.error('Error message:', insertError.message);
            console.error('Error details:', insertError.details);

            // Store detailed error for UI display
            setDetailedError({
              code: insertError.code,
              message: insertError.message,
              details: insertError.details,
            });

            throw new Error(`Échec de l'inscription: ${insertError.message}`);
          }

          if (__DEV__) {
            console.log('User record created successfully:', insertData);
          }

          router.replace('/(onboarding)/welcome');
        } catch (dbError) {
          console.error('Database operation error:', dbError);
          throw dbError;
        }
      } catch (authError: any) {
        console.error('Auth signup error:', authError.message);
        throw authError;
      }
    } catch (e: any) {
      console.error('Signup error:', e.message);
      setError(e.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
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

      <View style={styles.form}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>

            {detailedError && (
              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => setShowDebugInfo(!showDebugInfo)}
              >
                <Text style={styles.debugButtonText}>
                  {showDebugInfo
                    ? 'Masquer les détails'
                    : 'Afficher les détails'}
                </Text>
              </TouchableOpacity>
            )}

            {showDebugInfo && detailedError && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Informations de débogage:</Text>
                {detailedError.name && (
                  <Text style={styles.debugText}>
                    Type: {detailedError.name}
                  </Text>
                )}
                {detailedError.code && (
                  <Text style={styles.debugText}>
                    Code: {detailedError.code}
                  </Text>
                )}
                {detailedError.message && (
                  <Text style={styles.debugText}>
                    Message: {detailedError.message}
                  </Text>
                )}
                {detailedError.status && (
                  <Text style={styles.debugText}>
                    Status: {detailedError.status}
                  </Text>
                )}
                {detailedError.details && (
                  <Text style={styles.debugText}>
                    Détails: {detailedError.details}
                  </Text>
                )}
                <Text style={styles.debugText}>URL: {env.SUPABASE_URL}</Text>
                <Text style={styles.debugText}>
                  Environnement: {env.ENVIRONMENT}
                </Text>
                <Text style={styles.debugText}>
                  TestFlight: {env.IS_TESTFLIGHT ? 'Oui' : 'Non'}
                </Text>

                {detailedError.debug &&
                  Object.entries(detailedError.debug).map(([key, value]) => (
                    <Text key={key} style={styles.debugText}>
                      {key}: {String(value)}
                    </Text>
                  ))}
              </View>
            )}
          </View>
        )}

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

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>S'inscrire</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Vous avez déjà un compte ?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
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
    ...StyleSheet.absoluteFillObject,
    width: '100%',
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
});
