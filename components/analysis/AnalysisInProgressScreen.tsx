import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useAuth } from '@clerk/clerk-expo';
import { JobType } from '@/hooks/useAccountAnalysis';
import AnalysisHeader from './AnalysisHeader';
import { router } from 'expo-router';
import AnalysisLogs from './AnalysisLogs';
import { AlertCircle, CheckCircle } from 'lucide-react-native';

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
}

const ProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} />
  </View>
);

const AnalysisInProgressScreen: React.FC<AnalysisInProgressScreenProps> = ({ initialJob, onAnalysisComplete }) => {
  const { colors } = useTheme();
  const { getToken } = useAuth();
  const [currentJob, setCurrentJob] = useState<JobType>(initialJob);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentJob.status === 'completed' || currentJob.status === 'failed') {
      if (currentJob.status === 'completed') {
        setTimeout(onAnalysisComplete, 1500); // Wait a moment before refreshing
      }
      return;
    }

    const interval = setInterval(async () => {
      try {
        const token = await getToken();
        if (!currentJob.run_id) {
          console.warn("No run_id available to poll for status.");
          setError("No run_id available to poll for status.");
          clearInterval(interval);
          return;
        }
        const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_STATUS(currentJob.run_id), {
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
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [currentJob, getToken, onAnalysisComplete]);

  // Dynamically determine the status message and color
  const getDynamicStatus = () => {
    if (currentJob.status === 'failed') {
      return { message: "L'analyse a échoué", color: '#F87171' };
    }
    if (currentJob.status === 'completed') {
      return { message: 'Analyse terminée !', color: '#34D399' };
    }

    const lastEvent = currentJob.logs?.events?.[currentJob.logs.events.length - 1];
    const message = lastEvent?.message || `Analyse en cours... (${currentJob.status})`;
    
    // Determine color based on job status for consistency
    const color = currentJob.status === 'analyzing_data' ? '#FBBF24' : '#60A5FA';

    return { message, color };
  };

  const { message: statusMessage, color: statusColor } = getDynamicStatus();
  const progress = currentJob.status === 'completed' ? 100 : (currentJob.progress || 0);

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
            {currentJob.status === 'failed' ? (
                  <AlertCircle size={20} color={statusColor} />
                ) : currentJob.status === 'completed' ? (
                  <CheckCircle size={20} color={statusColor} />
                ) : (
                  <ActivityIndicator size="small" color={statusColor} />
                )}
                </View>
              <ProgressBar progress={progress} color={statusColor} />
              <Text style={styles.progressText}>
                {progress}%
              </Text>
              {currentJob.status === 'failed' && currentJob.error_message && (
                <Text style={styles.errorMessageDetail}>{currentJob.error_message}</Text>
              )}
            </View>

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