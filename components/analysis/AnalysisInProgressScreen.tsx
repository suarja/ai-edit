import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useAuth } from '@clerk/clerk-expo';
import { JobType } from '@/components/hooks/useAccountAnalysis';
import AnalysisHeader from './AnalysisHeader';
import { router } from 'expo-router';
import AnalysisLogs from './AnalysisLogs';
import { WaitingMessagesService } from '@/lib/services/ui/waitingMessagesService';
import { SupportService } from '@/lib/services/support/supportService';

interface AnalysisInProgressScreenProps {
  initialJob: JobType;
  onAnalysisComplete: () => void;
  onRetry: () => void;
}

const AnalysisInProgressScreen: React.FC<AnalysisInProgressScreenProps> = ({
  initialJob,
  onAnalysisComplete,
  onRetry,
}) => {
  const { getToken } = useAuth();
  const [currentJob, setCurrentJob] = useState<JobType>(initialJob);
  const [error, setError] = useState<string | null>(null);
  const [waitingMessage, setWaitingMessage] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [reportSent, setReportSent] = useState<boolean>(false); // Track if report has been sent

  const { status, run_id } = currentJob;

  // Function to handle reporting an issue
  const handleReportIssue = async () => {
    if (reportSent) {
      Alert.alert(
        'Rapport déjà envoyé',
        'Nous avons déjà reçu votre rapport pour cette analyse. Notre équipe examine le problème. Merci de votre patience !'
      );
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Erreur', 'Authentification impossible.');
        return;
      }

      await SupportService.reportIssue({
        jobId: currentJob.run_id,
        errorMessage: currentJob.error_message,
        token,
      });

      setReportSent(true); // Mark report as sent
      Alert.alert(
        'Rapport envoyé',
        'Notre équipe a été notifiée et va examiner le problème. Merci !'
      );
    } catch (e: any) {
      Alert.alert("Échec de l'envoi", e.message);
    }
  };

  // --- Polling logic for job status ---
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      if (status === 'completed') {
        setTimeout(onAnalysisComplete, 1500); // Wait a moment before refreshing
      }
      return; // Stop polling
    }

    const pollingInterval = setInterval(async () => {
      try {
        const token = await getToken();
        if (!run_id) {
          console.warn('No run_id available to poll for status.');
          setError('No run_id available to poll for status.');
          clearInterval(pollingInterval);
          return;
        }
        const response = await fetch(
          API_ENDPOINTS.TIKTOK_ANALYSIS_STATUS(run_id),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error('Could not update job status.');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setCurrentJob(result.data);
          setError(null);
        } else {
          throw new Error(result.error || 'Failed to parse job status.');
        }
      } catch (e: any) {
        setError(e.message);
        // Stop polling on persistent error to avoid spamming
        clearInterval(pollingInterval);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(pollingInterval);
    };
  }, [status, run_id, getToken, onAnalysisComplete]);

  // --- Waiting message logic ---
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      setWaitingMessage(null); // Clear waiting message on final state
      return;
    }

    // Set initial message
    setWaitingMessage(WaitingMessagesService.getNextMessage());

    // Start interval for random messages
    const messageInterval = setInterval(() => {
      setWaitingMessage(WaitingMessagesService.getNextMessage());
    }, 7000); // Change message every 7 seconds

    return () => {
      clearInterval(messageInterval);
    };
  }, [status]);

  // Dynamically determine the status message and color
  const getDynamicStatus = (): { message: string; color: string } => {
    if (status === 'failed') {
      return { message: "L'analyse a échoué", color: '#F87171' };
    }
    if (status === 'completed') {
      return { message: 'Analyse terminée !', color: '#34D399' };
    }

    const lastEvent =
      currentJob.logs?.events?.[currentJob.logs.events.length - 1];
    const eventMessage = lastEvent?.message;
    const message =
      typeof eventMessage === 'string' && eventMessage
        ? eventMessage
        : `Analyse en cours... (${status})`;

    // Determine color based on job status for consistency
    const color = status === 'analyzing_data' ? '#FBBF24' : '#60A5FA';

    return { message, color };
  };

  const { message: statusMessage, color: statusColor } = getDynamicStatus();
  const progress = status === 'completed' ? 100 : currentJob.progress || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <AnalysisHeader title={'Analyse en cours'} onBack={() => router.back()} />
      <ScrollView style={styles.container}>
        <View style={styles.scrollContent}>
          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIcon,
                  status === 'completed'
                    ? styles.statusIconCompleted
                    : status === 'failed'
                    ? styles.statusIconFailed
                    : styles.statusIconProcessing,
                ]}
              >
                {status === 'completed' ? (
                  <Text style={{ fontSize: 24, color: '#10b981' }}>✓</Text>
                ) : status === 'failed' ? (
                  <Text style={{ fontSize: 24, color: '#ef4444' }}>✕</Text>
                ) : (
                  <ActivityIndicator size="small" color="#3b82f6" />
                )}
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>{statusMessage}</Text>
                <Text style={styles.statusSubtitle}>
                  {status === 'completed'
                    ? 'Analyse terminée avec succès'
                    : status === 'failed'
                    ? 'Une erreur est survenue'
                    : 'Traitement en cours...'}
                </Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
            {status === 'failed' && currentJob.error_message && (
              <Text style={styles.errorMessage}>
                {currentJob.error_message}
              </Text>
            )}
          </View>

          {/* Waiting Message Card */}
          {waitingMessage && (
            <View style={styles.waitingMessageCard}>
              <Text style={styles.waitingMessageTitle}>
                {waitingMessage.title}
              </Text>
              <Text style={styles.waitingMessageText}>
                {waitingMessage.message}
              </Text>
            </View>
          )}

          {/* Failure Actions */}
          {status === 'failed' && (
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={onRetry}>
                <Text style={styles.actionButtonText}>Réessayer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  reportSent ? styles.supportButtonSent : styles.supportButton,
                ]}
                onPress={handleReportIssue}
              >
                <Text style={styles.actionButtonText}>
                  {reportSent ? 'Rapport envoyé ✓' : 'Contacter le support'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Logs Component */}
          <AnalysisLogs events={currentJob.logs?.events || []} />

          {/* Polling Error */}
          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Erreur</Text>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}
          {/* Quick Actions While Waiting */}
          {status !== 'completed' && status !== 'failed' && (
            <View style={styles.quickActionsCard}>
              <Text style={styles.quickActionsTitle}>
                ⚡ Pendant l&apos;attente
              </Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.push('/')}
                >
                  <Text style={styles.quickActionEmoji}>🏠</Text>
                  <Text style={styles.quickActionText}>Accueil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.back()}
                >
                  <Text style={styles.quickActionEmoji}>↩️</Text>
                  <Text style={styles.quickActionText}>Retour</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => {
                    Alert.alert(
                      'Restez connecté',
                      "Votre analyse continue en arrière-plan. Vous recevrez une notification dès qu'elle sera terminée !",
                      [{ text: 'Compris', style: 'default' }]
                    );
                  }}
                >
                  <Text style={styles.quickActionEmoji}>💡</Text>
                  <Text style={styles.quickActionText}>Conseils</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionButton}
                  onPress={() => router.replace('/')}
                >
                  <Text style={styles.quickActionEmoji}>📱</Text>
                  <Text style={styles.quickActionText}>Menu</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.quickActionsSubtext}>
                💡 Vous pouvez fermer l&apos;app et revenir plus tard, votre
                analyse continuera !
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  // Status display with modern design
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  statusIconProcessing: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },

  statusIconCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },

  statusIconFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },

  statusTextContainer: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 20,
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
    marginBottom: 20,
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
  },

  progressText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    fontWeight: '500',
  },

  progressTrack: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },

  // Waiting message with elegant design
  waitingMessageCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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

  // Quick actions with modern card design
  quickActionsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },

  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },

  quickActionButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#333',
  },

  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },

  quickActionText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Error handling with improved design
  errorCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 12,
    textAlign: 'center',
  },

  errorMessage: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  // Action buttons with modern styling
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
  },

  supportButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },

  supportButtonSent: {
    backgroundColor: '#10b981',
  },

  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Logs section with cleaner design
  logsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },

  logsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },

  quickActionsSubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default AnalysisInProgressScreen;
