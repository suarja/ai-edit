import { Stack, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { OnboardingProvider } from '@/components/providers/OnboardingProvider';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingLayout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const redirectTimeoutRef = useRef<number | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        setLoading(true);

        // Check if already redirecting to prevent multiple redirects
        if (isRedirecting) {
          return;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth error:', error);
          setError(`Authentication error: ${error.message}`);
          // Don't redirect during onboarding to prevent loops
          setLoading(false);
          return;
        }

        if (!data.session) {
          console.log('No session found, but allowing onboarding to continue');
          // Allow onboarding to continue even without session
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('Error checking auth state:', err);
        setError('An unexpected error occurred while checking authentication');
        // Don't redirect to prevent loops
        setLoading(false);
      }
    };

    // Only run auth check once on mount, not when isRedirecting changes
    if (!isRedirecting) {
      checkAuthState();
    }
  }, []); // Remove dependencies to prevent infinite loops

  // Handle redirect with state tracking
  const handleRedirect = (path: string, reason: string) => {
    if (isRedirecting) return;

    setIsRedirecting(true);
    console.log(`Redirecting to ${path} (reason: ${reason})`);

    // Clear any existing timeouts
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Actually perform the redirect
    redirectTimeoutRef.current = setTimeout(() => {
      router.replace(path as any);
    }, 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.loadingText}>
              {isRedirecting
                ? 'Redirection en cours...'
                : 'Chargement de votre session...'}
            </Text>
          )}

          {isRedirecting && (
            <Text style={styles.redirectText}>
              Vous allez être redirigé vers la page de connexion
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  redirectText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
