import { Stack, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { OnboardingProvider } from '@/components/providers/OnboardingProvider';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingLayout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const redirectTimeoutRef = useRef<number | null>(null);
  
  // Use Clerk authentication state
  const { isLoaded, isSignedIn, initializing } = useClerkAuth();

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
        // Wait for Clerk to be fully loaded
        if (!isLoaded || initializing) {
          return;
        }

        // Check if already redirecting to prevent multiple redirects
        if (isRedirecting) {
          return;
        }

        if (!isSignedIn) {
          setError('You must be signed in to access onboarding');
          // Redirect to sign-in if not authenticated
          handleRedirect('/(auth)/sign-in', 'not authenticated');
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error('Error checking Clerk auth state:', err);
        setError('An unexpected error occurred while checking authentication');
        setLoading(false);
      }
    };

    checkAuthState();
  }, [isLoaded, isSignedIn, initializing, isRedirecting]);

  // Handle redirect with state tracking
  const handleRedirect = (path: string, reason: string) => {
    if (isRedirecting) return;

    setIsRedirecting(true);

    // Clear any existing timeouts
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Actually perform the redirect
    redirectTimeoutRef.current = setTimeout(() => {
      router.replace(path as any);
    }, 100);
  };

  // Show loading while Clerk is initializing or we're checking auth
  if (!isLoaded || initializing || loading) {
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
                : !isLoaded
                ? 'Chargement de l\'authentification...'
                : 'Vérification de votre session...'}
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
