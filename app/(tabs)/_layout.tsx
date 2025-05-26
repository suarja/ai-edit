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
        }}>
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
            title: 'Create',
            tabBarIcon: ({ size, color }) => (
              <Plus size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="videos"
          options={{
            title: 'Generated',
            tabBarIcon: ({ size, color }) => (
              <Video size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
        {/* Keep these screens in tabs but hide them from tab bar */}
        <Tabs.Screen
          name="editorial"
          options={{
            href: null, // This hides it from the tab bar
          }}
        />
        <Tabs.Screen
          name="voice-clone"
          options={{
            href: null, // This hides it from the tab bar
          }}
        />
      </Tabs>
    </View>
  );
}