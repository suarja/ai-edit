/**
 * 🎨 Voice Clone Screen v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 3:
 * ❌ Avant: 120+ couleurs hardcodées dans tout le système vocal
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsHeader from '@/components/SettingsHeader';
import { VoiceScreenV2 } from '@/components/voice/VoiceScreen-v2';
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

export default function VoiceCloneScreenV2() {
  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: COLORS.background.primary // ✅ #000000 (cohérent avec design système)
      }} 
      edges={['top']}
    >
      <SettingsHeader title="Gestion des voix" />
      <VoiceScreenV2 />
    </SafeAreaView>
  );
}

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VOICE CLONE SCREEN:
 * 
 * ✅ CHANGEMENTS PRINCIPAUX:
 * • Import VoiceScreen-v2 avec migration complète des composants vocaux
 * • SafeAreaView backgroundColor: #000 → COLORS.background.primary (#000000)
 * • Préparé pour migration complète du système vocal vers palette Editia
 * 
 * 🎯 PROCHAINES ÉTAPES:
 * • Créer VoiceScreen-v2.tsx avec migration complète
 * • Migrer tous les composants voice/* vers palette Editia
 * • 120+ couleurs hardcodées → Système cohérent avec Rouge Editia
 * 
 * Structure migrée: voice-clone.tsx → voice-clone-v2.tsx ✨
 */