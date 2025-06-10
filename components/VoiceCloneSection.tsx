import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Mic } from 'lucide-react-native';

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
  const navigateToVoiceClone = () => {
    router.push('/(settings)/voice-clone');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Clone Vocal</Text>
        {voiceClone ? (
          <View style={styles.voiceStatus}>
            <Mic size={16} color="#10b981" />
            <Text style={styles.voiceStatusText}>
              {voiceClone.status === 'ready' ? 'Prêt' : 'En traitement'}
            </Text>
            <TouchableOpacity
              style={styles.manageButton}
              onPress={navigateToVoiceClone}
            >
              <Text style={styles.manageButtonText}>Gérer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.voiceStatus}>
            <Text style={[styles.voiceStatusText, { color: '#888' }]}>
              Voix par défaut
            </Text>
            <TouchableOpacity
              style={styles.createVoiceButton}
              onPress={navigateToVoiceClone}
            >
              <Text style={styles.createVoiceText}>
                Créer une Voix Personnalisée
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {voiceClone && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Votre clone vocal est prêt à être utilisé pour vos vidéos générées.
          </Text>
        </View>
      )}
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
    marginBottom: 8,
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
  manageButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    color: '#10b981',
    fontSize: 14,
  },
});
