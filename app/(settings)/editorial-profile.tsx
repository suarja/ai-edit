import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SettingsHeader from '@/components/SettingsHeader';

export default function EditorialProfileScreen() {
  useEffect(() => {
    // Redirect to the main editorial screen since they're the same functionality
    router.replace('/(settings)/editorial');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Profil Éditorial" />
      <View style={styles.content}>
        <Text style={styles.text}>Redirection vers le profil éditorial...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
});
