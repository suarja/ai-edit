import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsHeader from '@/components/SettingsHeader';

export default function VoiceSettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Paramètres Vocaux" />
      <View style={styles.content}>
        <Text style={styles.text}>Paramètres vocaux - En développement</Text>
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
