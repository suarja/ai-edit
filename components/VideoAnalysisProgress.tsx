import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { VideoAnalysisMessagesService } from '@/lib/services/ui/videoAnalysisMessagesService';

interface VideoAnalysisProgressProps {
  onSkipAnalysis?: () => void;
  onAnalysisComplete?: (analysisData: any) => void;
  onAnalysisError?: (error: string) => void;
}

const VideoAnalysisProgress: React.FC<VideoAnalysisProgressProps> = ({
  onSkipAnalysis,
  onAnalysisComplete,
  onAnalysisError,
}) => {
  const [waitingMessage, setWaitingMessage] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Start rotating messages
  useEffect(() => {
    // Set initial message
    setWaitingMessage(VideoAnalysisMessagesService.getNextMessage());

    // Start interval for rotating messages
    const messageInterval = setInterval(() => {
      setWaitingMessage(VideoAnalysisMessagesService.getNextMessage());
    }, 5000); // Change message every 5 seconds

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Analysis Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIcon}>
            <ActivityIndicator size="small" color="#007AFF" />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Analyse en cours...</Text>
            <Text style={styles.statusSubtitle}>
              Notre IA examine votre vidéo
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Analyse en cours</Text>
        </View>
      </View>

      {/* Waiting Message Card */}
      {waitingMessage && (
        <View style={styles.waitingMessageCard}>
          <Text style={styles.waitingMessageTitle}>{waitingMessage.title}</Text>
          <Text style={styles.waitingMessageText}>
            {waitingMessage.message}
          </Text>
        </View>
      )}

      {/* Skip Analysis Button */}
      <TouchableOpacity style={styles.skipButton} onPress={onSkipAnalysis}>
        <Text style={styles.skipButtonText}>
          Ignorer l&apos;analyse et remplir manuellement
        </Text>
      </TouchableOpacity>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 Pendant l&apos;attente</Text>
        <Text style={styles.infoText}>
          Vous pouvez fermer cette page et revenir plus tard. L&apos;analyse
          continuera en arrière-plan.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },

  // Status display with modern design
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#333',
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  statusTextContainer: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },

  statusSubtitle: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
  },

  // Progress bar with modern styling
  progressContainer: {
    marginBottom: 8,
  },

  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    width: '60%', // Indeterminate progress
  },

  progressText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Waiting message with elegant design
  waitingMessageCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#333',
  },

  waitingMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },

  waitingMessageText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },

  // Skip button
  skipButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  skipButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },

  // Info card
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
  },
});

export default VideoAnalysisProgress;
