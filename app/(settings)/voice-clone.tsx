import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsHeader from '@/components/SettingsHeader';
import { VoiceScreen } from '@/components/voice/VoiceScreen';

export default function VoiceCloneScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <SettingsHeader title="Gestion des voix" />
      <VoiceScreen />
    </SafeAreaView>
  );
}
