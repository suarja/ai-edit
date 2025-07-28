import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsHeader from '@/components/SettingsHeader';
import { VoiceScreen } from '@/components/voice/VoiceScreen';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

export default function VoiceCloneScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SHARED_STYLE_COLORS.background }} edges={['top']}>
      <SettingsHeader title="Gestion des voix" />
      <VoiceScreen />
    </SafeAreaView>
  );
}
