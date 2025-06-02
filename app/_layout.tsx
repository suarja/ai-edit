import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initializeErrorReporting } from '@/lib/services/errorReporting';
import { logEnvironmentStatus, validateEnvironment } from '@/lib/config/env';
import { Alert } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Global navigation state tracking
let isNavigating = false;
let navigationTimer: ReturnType<typeof setTimeout> | null = null;

// Safe navigation function to prevent multiple simultaneous navigations
export function safeNavigate(
  router: any,
  routeName: string,
  method: 'push' | 'replace' = 'push',
  delay: number = 500
): Promise<boolean> {
  return new Promise((resolve) => {
    // If already navigating, prevent duplicate navigations
    if (isNavigating) {
      console.log('Navigation already in progress, ignoring request');
      resolve(false);
      return;
    }

    try {
      // Set navigating state
      isNavigating = true;

      // Clear any existing timers
      if (navigationTimer) {
        clearTimeout(navigationTimer);
      }

      // Delay to ensure UI state is updated
      navigationTimer = setTimeout(() => {
        try {
          // Perform navigation based on method
          if (method === 'push') {
            router.push(routeName);
          } else {
            router.replace(routeName);
          }

          // Reset state after a delay to prevent immediate re-navigation
          setTimeout(() => {
            isNavigating = false;
          }, 300);

          resolve(true);
        } catch (error) {
          console.error('Navigation error:', error);
          isNavigating = false;
          resolve(false);
        }
      }, delay);
    } catch (e) {
      console.error('Error in safeNavigate:', e);
      isNavigating = false;
      resolve(false);
    }
  });
}

export default function RootLayout() {
  const colorScheme = useSystemColorScheme();
  const [isReady, setIsReady] = useState(false);
  const initializing = useRef(true);

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
        initializing.current = false;
        SplashScreen.hideAsync();
      }
    };

    prepareApp();

    // Clean up navigation timers when app unmounts
    return () => {
      if (navigationTimer) {
        clearTimeout(navigationTimer);
      }
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            animation: 'slide_from_right',
            animationDuration: 300,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen
            name="video-details/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
