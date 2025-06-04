import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        animationTypeForReplace: 'push',
      }}
    >
      <Stack.Screen
        name="voice-clone"
        options={{
          title: 'Clone Vocal',
        }}
      />
      <Stack.Screen
        name="editorial"
        options={{
          title: 'Profil Éditorial',
        }}
      />
      <Stack.Screen
        name="video-settings"
        options={{
          title: 'Configuration Vidéo',
        }}
      />
      <Stack.Screen
        name="voice-settings"
        options={{
          title: 'Paramètres Vocaux',
        }}
      />
      <Stack.Screen
        name="editorial-profile"
        options={{
          title: 'Profil Éditorial',
        }}
      />
      <Stack.Screen
        name="caption-settings"
        options={{
          title: 'Paramètres des Sous-titres',
        }}
      />
    </Stack>
  );
}
