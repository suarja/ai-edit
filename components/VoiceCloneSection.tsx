import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Mic as Mic2 } from 'lucide-react-native';

type VoiceClone = {
  id: string;
  elevenlabs_voice_id: string;
  status: string;
};

type VoiceCloneSectionProps = {
  voiceClone: VoiceClone | null;
};

export default function VoiceCloneSection({
  voiceClone,
}: VoiceCloneSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Clone Vocal</Text>
        {voiceClone ? (
          <View style={styles.voiceStatus}>
            <Mic2 size={16} color="#10b981" />
            <Text style={styles.voiceStatusText}>Prêt</Text>
          </View>
        ) : (
          <View style={styles.voiceStatus}>
            <Text style={[styles.voiceStatusText, { color: '#888' }]}>
              Voix par défaut
            </Text>
            <TouchableOpacity
              style={styles.createVoiceButton}
              onPress={() => router.push('/(tabs)/voice-clone')}
            >
              <Text style={styles.createVoiceText}>
                Créer une Voix Personnalisée
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  voiceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceStatusText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  createVoiceButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  createVoiceText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
