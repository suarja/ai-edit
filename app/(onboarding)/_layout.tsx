import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/components/providers/OnboardingProvider';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

export default function OnboardingLayout() {
  return (
    <View style={styles.container}>
      <OnboardingProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000' },
            animation: 'slide_from_right',
            // Prevent underlying screens from showing
            presentation: 'modal',
            // Ensure that screens take the full height and aren't stacked
            fullScreenGestureEnabled: true,
          }}
        />
      </OnboardingProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
