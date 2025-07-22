/**
 * 🎨 VoiceScreen v2 - Migré vers la Palette Editia
 * 
 * MIGRATION VOICE SYSTEM:
 * ❌ Avant: ActivityIndicator #0000ff, Button système non stylisé
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import VoiceListV2 from './VoiceList-v2';
import {
  VoiceConfig,
  VoiceConfigStorage,
  VoiceService,
} from '@/lib/services/voiceService';
import VoiceCreateButtonV2 from './VoiceCreateButton-v2';
import { useGetUser } from '../hooks/useGetUser';
import { useAuth } from '@clerk/clerk-expo';
import { VoiceRecordingUIV2 } from './VoiceRecordingUI-v2';
import { Button } from '@/components/ui/Button'; // ✅ Utilise le composant UI migré
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

export const VoiceScreenV2: React.FC = () => {
  const [step, setStep] = useState<'list' | 'record'>('list');
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<VoiceConfig[]>(
    VoiceConfigStorage.getDefaultVoicesList()
  );
  const { getToken } = useAuth();
  const { fetchUser } = useGetUser();

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    setIsLoading(true);
    const token = await getToken();
    if (token) {
      const voice = await VoiceService.getExistingVoice(token);
      if (voice) {
        const mappedVoices = VoiceService.voiceMapper(voice);
        if (mappedVoices) {
          mappedVoices.forEach((v) => {
            if (!voices.some((voice) => voice.voiceId === v.voiceId)) {
              setVoices((prev) => [...prev, v]);
            }
          });
        }
      }
    }
    setIsLoading(false);
  };

  const handleAddClonedVoice = async (voice: VoiceConfig) => {
    setVoices((prev) => {
      const exists = prev.some((v) => v.voiceId === voice.voiceId);
      const updated = exists ? prev : [...prev, voice];
      return updated;
    });
    setSelectedVoiceId(voice.voiceId);
    const user = await fetchUser();
    if (user) {
      await VoiceConfigStorage.save(user.id, voice);
    }
    setStep('list');
  };

  const handleSelectVoice = async (
    userId: string,
    voiceConfig: VoiceConfig
  ) => {
    setSelectedVoiceId(voiceConfig.voiceId);
    await VoiceConfigStorage.save(userId, voiceConfig);
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.interactive.primary} />
        </View>
      ) : (
        <>
          {step === 'list' && (
            <>
              <VoiceListV2
                voices={voices}
                selectedVoiceId={selectedVoiceId}
                onSelect={handleSelectVoice}
              />
              <VoiceCreateButtonV2 onCreate={() => setStep('record')} />
            </>
          )}
        </>
      )}
      {step === 'record' && (
        <View style={styles.recordContainer}>
          <VoiceRecordingUIV2 handleUpdateVoices={handleAddClonedVoice} />
          <View style={styles.cancelButtonContainer}>
            <Button 
              variant="secondary" 
              onPress={() => setStep('list')}
              size="large"
            >
              Annuler
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // ✅ Loading container avec design cohérent
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  // ✅ Record container
  recordContainer: {
    flex: 1,
  },
  
  // ✅ Cancel button container
  cancelButtonContainer: {
    padding: 20,
    paddingTop: 16,
  },
});

export default VoiceScreenV2;

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VOICE SCREEN:
 * 
 * ✅ CHANGEMENTS PRINCIPAUX:
 * • ActivityIndicator: #0000ff → #FF0050 (Rouge Editia)
 * • Button système → Button UI component avec variant secondary
 * • Import des composants voice v2 migrés
 * • Loading state avec design cohérent
 * 
 * 🎯 AMÉLIORATIONS INTERFACE:
 * • Loading container centré avec gap moderne
 * • Cancel button container avec padding cohérent
 * • Utilisation des composants UI système
 * • ActivityIndicator en Rouge Editia pour cohérence
 * 
 * Prépare la migration complète du système vocal ✨
 */