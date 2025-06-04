import { Tabs } from 'expo-router';
import { Upload, Video, Settings, Plus } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
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
            tabBarIcon: ({ size, color }) => (
              <Upload size={size} color={color} />
            ),
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
