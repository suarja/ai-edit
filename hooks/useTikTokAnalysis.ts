import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';

export interface TikTokAnalysisResult {
  account_analysis: {
    followers: number;
    videos_count: number;
    engagement_rate: number;
    handle: string;
  };
  insights: {
    performance_summary: string;
    recommendations: string[];
    content_strategy: string;
    strengths: string[];
    weaknesses: string[];
    audience_insights: string;
  };
  profile_analysis: {
    overview: string;
    strengths: string[];
    weaknesses: string[];
    engagement_rate: number;
    audience_insights: string;
  };
  content_analysis: {
    content_pillars: Array<{
      name: string;
      description: string;
      frequency: string;
    }>;
    performance_patterns: string;
    trending_elements: string[];
    improvement_areas: string[];
  };
}

export interface TikTokAnalysisState {
  isAnalyzing: boolean;
  progress: number;
  status: 'idle' | 'starting' | 'scraping' | 'analyzing' | 'completed' | 'failed';
  statusMessage: string;
  analysisResult: TikTokAnalysisResult | null;
  error: string | null;
  runId: string | null;
}

export function useTikTokAnalysis() {
  const { getToken } = useAuth();
  const { isPro } = useRevenueCat();
  
  const [state, setState] = useState<TikTokAnalysisState>({
    isAnalyzing: false,
    progress: 0,
    status: 'idle',
    statusMessage: '',
    analysisResult: null,
    error: null,
    runId: null,
  });

  const updateState = useCallback((updates: Partial<TikTokAnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const startAnalysis = useCallback(async (tiktokHandle: string) => {
    if (!isPro) {
      throw new Error('Fonctionnalité Pro requise');
    }

    try {
      updateState({
        isAnalyzing: true,
        error: null,
        progress: 5,
        status: 'starting',
        statusMessage: 'Initialisation de l\'analyse...',
      });
// TODO: envoyer subscription 
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_START(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tiktok_handle: tiktokHandle }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors du démarrage de l\'analyse');
      }

      updateState({
        runId: data.data.run_id,
        status: 'scraping',
        progress: 10,
        statusMessage: 'Collecte des données TikTok...',
      });
      
      // Démarrer le polling pour suivre le progrès
      startPolling(data.data.run_id);

    } catch (err: any) {
      updateState({
        error: err.message,
        isAnalyzing: false,
        status: 'failed',
        statusMessage: 'Échec de l\'analyse',
      });
    }
  }, [isPro, getToken, updateState]);

  const startPolling = useCallback((analysisRunId: string) => {
    let pollCount = 0;
    const maxPolls = 60; // 3 minutes max
    
    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        
        const token = await getToken();
        const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_STATUS(analysisRunId), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          const jobData = data.data;
          
          // Mise à jour du progrès et statut
          let progressValue = 10;
          let statusMessage = 'Analyse en cours...';
          let status: TikTokAnalysisState['status'] = 'scraping';
          
          if (jobData.status === 'scraping') {
            progressValue = Math.min(30 + (pollCount * 2), 60);
            statusMessage = 'Collecte des vidéos et données...';
            status = 'scraping';
          } else if (jobData.status === 'analyzing') {
            progressValue = Math.min(60 + (pollCount * 3), 90);
            statusMessage = 'Analyse IA en cours...';
            status = 'analyzing';
          } else if (jobData.status === 'completed') {
            clearInterval(pollInterval);
            updateState({
              progress: 95,
              status: 'completed',
              statusMessage: 'Récupération des résultats...',
            });
            await fetchResult(analysisRunId);
            return;
          } else if (jobData.status === 'failed') {
            clearInterval(pollInterval);
            updateState({
              error: jobData.error_message || 'Analyse échouée',
              isAnalyzing: false,
              status: 'failed',
              statusMessage: 'Échec de l\'analyse',
            });
            return;
          }
          
          updateState({
            progress: progressValue,
            status,
            statusMessage,
          });
        }
        
        // Timeout de sécurité
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          updateState({
            error: 'Timeout - l\'analyse prend trop de temps',
            isAnalyzing: false,
            status: 'failed',
            statusMessage: 'Timeout de l\'analyse',
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Continue polling en cas d'erreur réseau temporaire
      }
    }, 3000); // Poll every 3 seconds
  }, [getToken, updateState]);

  const fetchResult = useCallback(async (analysisRunId: string) => {
    try {
      updateState({
        progress: 98,
        statusMessage: 'Finalisation...',
      });
      
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_RESULT(analysisRunId), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        updateState({
          analysisResult: data.data,
          isAnalyzing: false,
          progress: 100,
          status: 'completed',
          statusMessage: 'Analyse terminée !',
        });
      } else {
        throw new Error(data.error || 'Erreur lors de la récupération des résultats');
      }
    } catch (err: any) {
      updateState({
        error: err.message,
        isAnalyzing: false,
        status: 'failed',
        statusMessage: 'Erreur de récupération',
      });
    }
  }, [getToken, updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const reset = useCallback(() => {
    setState({
      isAnalyzing: false,
      progress: 0,
      status: 'idle',
      statusMessage: '',
      analysisResult: null,
      error: null,
      runId: null,
    });
  }, []);

  return {
    // Actions
    startAnalysis,
    clearError,
    reset,
    
    // State
    isAnalyzing: state.isAnalyzing,
    progress: state.progress,
    status: state.status,
    statusMessage: state.statusMessage,
    analysisResult: state.analysisResult,
    error: state.error,
    runId: state.runId,
    
    // Computed
    hasResult: !!state.analysisResult,
    isComplete: state.status === 'completed',
    isFailed: state.status === 'failed',
  };
} 