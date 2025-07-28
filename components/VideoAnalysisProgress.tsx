import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { VideoAnalysisMessagesService } from '@/lib/services/ui/videoAnalysisMessagesService';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

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
            <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.primary  } />
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
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    shadowColor: SHARED_STYLE_COLORS.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
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
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
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
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 4,
  },

  statusSubtitle: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textSecondary,
    lineHeight: 20,
  },

  // Progress bar with modern styling
  progressContainer: {
    marginBottom: 8,
  },

  progressBar: {
    height: 6,
    backgroundColor: SHARED_STYLE_COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: SHARED_STYLE_COLORS.accent,
    borderRadius: 8,
    width: '60%', // Indeterminate progress
  },

  progressText: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Waiting message with elegant design
  waitingMessageCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: SHARED_STYLE_COLORS.accent,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },

  waitingMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
      color: SHARED_STYLE_COLORS.accent,
    marginBottom: 8,
  },

  waitingMessageText: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.text,
    lineHeight: 20,
  },

  // Skip button
  skipButton: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  skipButtonText: {
    color: SHARED_STYLE_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Info card
  infoCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 8,
  },

  infoText: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default VideoAnalysisProgress;
