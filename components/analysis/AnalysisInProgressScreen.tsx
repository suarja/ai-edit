import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useAuth } from '@clerk/clerk-expo';

// 🆕 Local Job interface to avoid direct dependency
interface Job {
  id: string;
  status: string;
  progress?: number;
  [key: string]: any; // Allow other properties
}

interface AnalysisInProgressScreenProps {
  initialJob: Job;
  onAnalysisComplete: () => void;
}

const getStatusMessage = (status: string) => {
  switch (status) {
    case 'pending':
      return 'En attente de démarrage...';
    case 'running':
    case 'fetching_data':
      return 'Récupération des données du profil... (Étape 1/4)';
    case 'storing_data':
      return 'Sauvegarde des données... (Étape 2/4)';
    case 'analyzing_data':
      return 'Analyse par l\'IA en cours... (Étape 3/4)';
    case 'completed':
      return 'Analyse terminée !';
    case 'failed':
      return 'L\'analyse a échoué.';
    default:
      return 'Statut inconnu...';
  }
};

const AnalysisInProgressScreen: React.FC<AnalysisInProgressScreenProps> = ({ initialJob, onAnalysisComplete }) => {
  const { colors } = useTheme();
  const { getToken } = useAuth();
  const [currentJob, setCurrentJob] = useState<Job>(initialJob);
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
        const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_STATUS(currentJob.id), {
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
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [currentJob, getToken, onAnalysisComplete]);


  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.title, { color: colors.text }]}>Analyse en cours</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Veuillez ne pas quitter cette page.
      </Text>
      <View style={[styles.statusBox, { backgroundColor: colors.card }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>
          {getStatusMessage(currentJob.status)}
        </Text>
        {currentJob.progress && (
           <Text style={[styles.progressText, { color: colors.primary }]}>
             {currentJob.progress}%
           </Text>
        )}
      </View>
       {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  statusBox: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 16,
  }
});

export default AnalysisInProgressScreen; 