import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initializeErrorReporting } from '@/lib/services/errorReporting';
import { logEnvironmentStatus, validateEnvironment } from '@/lib/config/env';
import { Alert } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useSystemColorScheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Initialize error reporting on app startup
        initializeErrorReporting();

        // Validate environment variables
        logEnvironmentStatus();
        const envValidation = validateEnvironment();
        if (!envValidation.isValid) {
          console.error('Environment validation failed:', envValidation.errors);
          if (!__DEV__) {
            Alert.alert(
              'Configuration Error',
              'The app is missing required configuration. Please contact support.',
              [{ text: 'OK' }]
            );
          }
        }

        // Add a small delay to ensure everything is initialized
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen
            name="video-details/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
