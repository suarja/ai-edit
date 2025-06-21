import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerToggle from '@/components/DrawerToggle';
import SidebarModal from '@/components/SidebarModal';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function DrawerLayoutContent() {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          headerLeft: () => <DrawerToggle />,
          tabBarStyle: { display: 'none' }, // Hide tab bar for now
        }}
      >
        <Tabs.Screen
          name="script-generation"
          options={{
            title: 'Script Generation',
          }}
        />
        <Tabs.Screen
          name="scripts"
          options={{
            title: 'Mes Scripts',
          }}
        />
        <Tabs.Screen
          name="source-videos"
          options={{
            title: 'Source Vidéos',
          }}
        />
        <Tabs.Screen
          name="videos"
          options={{
            title: 'Vidéos Générées',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Paramètres',
          }}
        />
        <Tabs.Screen
          name="script-chat-demo"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="request-video"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <SidebarModal visible={isOpen} onClose={closeSidebar} />
    </>
  );
}

export default function DrawerLayout() {
  const { isLoaded, isSignedIn, initializing } = useClerkAuth();

  // Show loading while Clerk is initializing
  if (!isLoaded || initializing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>
            Vérification de l&apos;authentification...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    console.log('🔀 User not signed in, redirecting from drawer to sign-in');
    return <Redirect href="/(auth)/sign-in" />;
  }

  // User is authenticated, show tabs with sidebar
  return (
    <SidebarProvider>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <DrawerLayoutContent />
      </View>
    </SidebarProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
