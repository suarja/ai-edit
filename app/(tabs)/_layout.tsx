import { Redirect, Tabs } from 'expo-router';
import { Upload, Video, Settings, Plus, MessageCircle, FileText } from 'lucide-react-native';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
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
    console.log('🔀 User not signed in, redirecting from tabs to sign-in');
    return <Redirect href="/(auth)/sign-in" />;
  }

  // User is authenticated, show tabs
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#333',
            height: 80,
            paddingBottom: 30,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tabs.Screen
          name="source-videos"
          options={{
            title: 'Sources',
            headerShown: false,
            tabBarIcon: ({ size, color }) => (
              <Upload size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scripts"
          options={{
            title: 'Scripts',
            tabBarIcon: ({ size, color }) => <FileText size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="request-video"
          options={{
            title: 'Créer',
            tabBarIcon: ({ size, color }) => <Plus size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="script-chat-demo"
          options={{
            href: null, // Hide from tabs, accessible via navigation only
          }}
        />
        <Tabs.Screen
          name="videos"
          options={{
            title: 'Générées',
            tabBarIcon: ({ size, color }) => (
              <Video size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Paramètres',
            headerShown: false,
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="videos/[id]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
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
