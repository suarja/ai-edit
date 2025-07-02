import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useAuth } from '@clerk/clerk-expo';
import { JobType } from '@/hooks/useAccountAnalysis';
import AnalysisHeader from './AnalysisHeader';
import { router } from 'expo-router';
import AnalysisLogs from './AnalysisLogs';
import { AlertCircle, CheckCircle } from 'lucide-react-native';
import { WaitingMessagesService } from '@/lib/services/ui/waitingMessagesService';
import { SupportService } from '@/lib/services/support/supportService';

// 🆕 Local Job interface to avoid direct dependency
interface Job {
  id: string;
  status: string;
  progress?: number;
  [key: string]: any; // Allow other properties
}

interface AnalysisInProgressScreenProps {
  initialJob: JobType;
  onAnalysisComplete: () => void;
  onRetry: () => void;
}

const ProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

const AnalysisInProgressScreen: React.FC<AnalysisInProgressScreenProps> = ({ initialJob, onAnalysisComplete, onRetry }) => {
  const { colors } = useTheme();
  const { getToken } = useAuth();
  const [currentJob, setCurrentJob] = useState<JobType>(initialJob);
  const [error, setError] = useState<string | null>(null);
  const [waitingMessage, setWaitingMessage] = useState<{ title: string, message: string } | null>(null);
  const messageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { status, run_id } = currentJob;

  // Function to handle reporting an issue
  const handleReportIssue = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Erreur", "Authentification impossible.");
        return;
      }
      
      await SupportService.reportIssue({
        jobId: currentJob.run_id,
        errorMessage: currentJob.error_message,
        token,
      });

      Alert.alert("Rapport envoyé", "Notre équipe a été notifiée et va examiner le problème. Merci !");
    } catch (e: any) {
      Alert.alert("Échec de l'envoi", e.message);
    }
  };

  useEffect(() => {
    // Clear any existing intervals when status changes
    if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      messageIntervalRef.current = null;
    }

    if (status === 'completed' || status === 'failed') {
      if (status === 'completed') {
        setTimeout(onAnalysisComplete, 1500); // Wait a moment before refreshing
      }
      setWaitingMessage(null); // Clear waiting message on final state
      return;
    }

    // Set initial message
    setWaitingMessage(WaitingMessagesService.getNextMessage());

    // Start interval for random messages
    messageIntervalRef.current = setInterval(() => {
      setWaitingMessage(WaitingMessagesService.getNextMessage());
    }, 7000); // Change message every 7 seconds

    // Polling logic
    const pollingInterval = setInterval(async () => {
      try {
        const token = await getToken();
        if (!run_id) {
          console.warn("No run_id available to poll for status.");
          setError("No run_id available to poll for status.");
          clearInterval(pollingInterval);
          return;
        }
        const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_STATUS(run_id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
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
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [status, run_id, getToken, onAnalysisComplete]);

  // Dynamically determine the status message and color
  const getDynamicStatus = (): { message: string; color: string } => {
    if (status === 'failed') {
      return { message: "L'analyse a échoué", color: '#F87171' };
    }
    if (status === 'completed') {
      return { message: 'Analyse terminée !', color: '#34D399' };
    }

    const lastEvent = currentJob.logs?.events?.[currentJob.logs.events.length - 1];
    const eventMessage = lastEvent?.message;
    const message = typeof eventMessage === 'string' && eventMessage ? eventMessage : `Analyse en cours... (${status})`;
    
    // Determine color based on job status for consistency
    const color = status === 'analyzing_data' ? '#FBBF24' : '#60A5FA';

    return { message, color };
  };

  const { message: statusMessage, color: statusColor } = getDynamicStatus();
  const progress = status === 'completed' ? 100 : (currentJob.progress || 0);

  return (
      <SafeAreaView style={styles.safeArea}> 
        <AnalysisHeader
          title={'Analyse en cours'}
          onBack={() => router.back()}
        />
        <ScrollView style={styles.container}>
          <View style={styles.content}> 
            {/* Status Card */}
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                {status === 'failed' ? (
                  <AlertCircle size={24} color={statusColor} />
                ) : status === 'completed' ? (
                  <CheckCircle size={24} color={statusColor} />
                ) : (
                  <ActivityIndicator size="small" color={statusColor} />
                )}
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusMessage}
                </Text>
              </View>
              <ProgressBar progress={progress} color={statusColor} />
              <Text style={styles.progressText}>
                {progress}%
              </Text>
              {status === 'failed' && currentJob.error_message && (
                <Text style={styles.errorMessageDetail}>{currentJob.error_message}</Text>
              )}
            </View>

            {/* Waiting Message Card */}
            {waitingMessage && (
              <View style={styles.waitingMessageCard}>
                <Text style={styles.waitingMessageTitle}>{waitingMessage.title}</Text>
                <Text style={styles.waitingMessageText}>{waitingMessage.message}</Text>
              </View>
            )}

            {/* Failure Actions */}
            {status === 'failed' && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={onRetry}>
                  <Text style={styles.actionButtonText}>Réessayer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.supportButton]} onPress={handleReportIssue}>
                  <Text style={styles.actionButtonText}>Contacter le support</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Logs Component */}
            <AnalysisLogs events={currentJob.logs?.events || []} />

            {/* Polling Error */}
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color="#F87171" />
                <Text style={styles.errorText}>
                  Error polling status: {error}
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
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  errorMessageDetail: {
    fontSize: 14,
    color: '#F87171',
    marginTop: 12,
    textAlign: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  waitingMessageCard: {
    marginTop: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
  },
  waitingMessageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 8,
  },
  waitingMessageText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  supportButton: {
    backgroundColor: '#333',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: '#F87171',
    flex: 1,
  }
});

export default AnalysisInProgressScreen; 