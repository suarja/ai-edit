import React from 'react';
import { Redirect, Tabs, usePathname, router } from 'expo-router';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useClerkAuth } from '@/components/hooks/useClerkAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerToggle from '@/components/DrawerToggle';
import SidebarModal from '@/components/SidebarModal';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { Plus } from 'lucide-react-native';
function HeaderRight() {
  const pathname = usePathname();
  if (pathname === '/chat') {
    return (
      <TouchableOpacity
        style={styles.newChatButton}
        onPress={() => {
          router.replace(`/chat?new=${Date.now()}`);
        }}
      >
        <Plus size={20} color="#fff" />
      </TouchableOpacity>
    );
  }
  return <></>;
}
function DrawerLayoutContent() {
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerLeft: () => <DrawerToggle />,
          headerRight: () => <HeaderRight />,
          tabBarStyle: { display: 'none' }, // Hide tab bar for now
        }}
      >
        <Tabs.Screen
          name="(analysis)"
          options={{
            title: 'Chat TikTok',
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name="scripts"
          options={{
            title: 'Mes Scripts',
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Créer un script',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="source-videos"
          options={{
            title: 'Mes Médias',
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
          name="request-video"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="videos/[id]"
          options={{
            title: 'Détails Vidéo',
          }}
        />
        <Tabs.Screen
          name="script-video-settings"
          options={{
            title: 'Configuration Vidéo',
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
  newChatButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 16,
    marginBottom: 12,
  },
  newChatText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
