import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="voice-clone" />
      <Stack.Screen name="editorial" />
      <Stack.Screen name="video-settings" />
      <Stack.Screen name="voice-settings" />
      <Stack.Screen name="editorial-profile" />
      <Stack.Screen name="caption-settings" />
    </Stack>
  );
}
