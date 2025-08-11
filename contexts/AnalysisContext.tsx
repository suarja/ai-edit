import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';
import { z } from 'zod';

// Types
interface TikTokAnalysis {
  id: string;
  tiktok_handle: string;
  status: 'completed' | 'pending' | 'failed';
  result?: any;
  account_id: string;
}

interface JobType {
  run_id: string;
  status: string;
  progress?: number;
  tiktok_handle?: string;
  account_id?: string;
  started_at?: string;
  error_message?: string;
  logs?: {
    events?: Array<{
      event: string;
      timestamp: string;
    }>;
  };
}

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message?: {
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  };
  context?: {
    tiktok_handle?: string;
    analysis_id?: string;
  };
}

interface AnalysisContextType {
  // État
  analysis: TikTokAnalysis | null;
  activeJob: JobType | null;
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // État de chargement
  isLoading: boolean;
  isConversationsLoading: boolean;
  error: string | null;
  isInitialized: boolean; // NEW: Track if initial load is complete
  
  // Actions
  startAnalysis: (tiktokHandle: string) => Promise<void>;
  refreshAnalysis: () => Promise<void>;
  loadConversations: () => Promise<void>;
  setCurrentConversation: (conversationId: string | null) => void;
  
  // Navigation helpers
  hasAnalysis: boolean;
  isAnalysisInProgress: boolean;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getToken } = useAuth();
  
  // État principal
  const [analysis, setAnalysis] = useState<TikTokAnalysis | null>(null);
  const [activeJob, setActiveJob] = useState<JobType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  // État de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isConversationsLoading, setIsConversationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Add a ref to track if conversations are being loaded to prevent race conditions
  const loadingConversationsRef = useRef(false);

  // Chargement initial de l'analyse (avec gestion améliorée des états)
  const fetchAnalysis = useCallback(async () => {
    console.log('🔄 AnalysisContext: fetchAnalysis called');
    setIsLoading(true);
    setError(null);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available.');
      }

      // 1. Vérifier s'il y a une analyse existante
      const analysisResponse = await fetch(
        API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING(),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();
        if (analysisResult.success && analysisResult.data) {
          console.log('✅ AnalysisContext: Found existing analysis:', analysisResult.data.status);
          setAnalysis(analysisResult.data);
          setActiveJob(null);
          setIsLoading(false);
          return;
        }
      }

      // 2. Vérifier s'il y a un job actif
      const activeJobResponse = await fetch(
        API_ENDPOINTS.TIKTOK_ANALYSIS_ACTIVE_JOB(),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (activeJobResponse.ok) {
        const activeJobData = await activeJobResponse.json();
        if (activeJobData) {
          console.log('🔄 AnalysisContext: Found active job:', activeJobData.status);
          setActiveJob(activeJobData);
          setAnalysis(null);
          // Démarrer le polling
          startPolling(activeJobData.run_id);
          setIsLoading(false);
          return;
        }
      }

      // 3. Pas d'analyse ni de job actif
      console.log('❌ AnalysisContext: No analysis or job found');
      setAnalysis(null);
      setActiveJob(null);
    } catch (e: any) {
      console.error('❌ AnalysisContext: Error fetching analysis:', e);
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [getToken]);

  // Démarrer une nouvelle analyse
  const startAnalysis = useCallback(async (tiktokHandle: string) => {
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_START(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tiktok_handle: tiktokHandle, is_pro: true }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('🚀 Analysis started:', data.data.run_id);
        setActiveJob(data.data);
        setAnalysis(null);
        // Démarrer le polling
        startPolling(data.data.run_id);
      } else {
        throw new Error(data.error || 'Failed to start analysis');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [getToken]);

  // Polling pour le statut du job (avec cleanup pour éviter les fuites)
  const startPolling = useCallback((runId: string) => {
    console.log('🔄 Starting polling for job:', runId);
    const pollInterval = setInterval(async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          API_ENDPOINTS.TIKTOK_ANALYSIS_STATUS(runId),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        
        if (data) {
          setActiveJob(data);
          
          if (data.status === 'completed') {
            clearInterval(pollInterval);
            console.log('✅ AnalysisContext: Job completed, refreshing analysis...');
            // Recharger l'analyse complète avec un délai pour éviter les conflits
            setTimeout(() => {
              fetchAnalysis();
            }, 500);
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            setError(data.error_message || 'Analysis failed');
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll toutes les 3 secondes

    // Nettoyer l'intervalle quand le composant est démonté
    return () => {
      console.log('🛑 Stopping polling for job:', runId);
      clearInterval(pollInterval);
    };
  }, [getToken, fetchAnalysis]);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    console.log('🔄 AnalysisContext: loadConversations called, currentlyLoading:', loadingConversationsRef.current);
    
    // Prevent multiple simultaneous calls using ref
    if (loadingConversationsRef.current) {
      console.log('⏸️ AnalysisContext: Already loading conversations, skipping');
      return;
    }

    loadingConversationsRef.current = true;
    setIsConversationsLoading(true);
    
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log('📡 AnalysisContext: Fetching conversations from API');
      const response = await fetch(API_ENDPOINTS.TIKTOK_CONVERSATIONS(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log('📥 AnalysisContext: Conversations API response:', { success: data.success, count: data.data?.length });
      
      if (data.success) {
        setConversations(data.data || []);
      } else {
        console.warn('❌ AnalysisContext: Conversations API returned error:', data.error);
      }
    } catch (err) {
      console.error('❌ AnalysisContext: Error loading conversations:', err);
    } finally {
      loadingConversationsRef.current = false;
      setIsConversationsLoading(false);
      console.log('✅ AnalysisContext: loadConversations completed');
    }
  }, [getToken]);

  // Définir la conversation actuelle
  const setCurrentConversation = useCallback((conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  }, []);

  // Rafraîchir l'analyse
  const refreshAnalysis = useCallback(async () => {
    await fetchAnalysis();
  }, [fetchAnalysis]);

  // Ref pour éviter les re-runs du useEffect
  const fetchAnalysisRef = useRef(fetchAnalysis);
  fetchAnalysisRef.current = fetchAnalysis;

  // Chargement initial (une seule fois au montage)
  useEffect(() => {
    console.log('🚀 AnalysisContext: Initial load');
    fetchAnalysisRef.current();
  }, []);

  // Helpers (memoized pour éviter les recalculs)
  const hasAnalysis = useMemo(() => {
    const result = analysis !== null && analysis.status === 'completed';
    console.log('🔍 hasAnalysis:', result, 'analysis:', analysis?.status);
    return result;
  }, [analysis]);
  
  const isAnalysisInProgress = useMemo(() => {
    const result = activeJob !== null && activeJob.status !== 'failed';
    console.log('🔍 isAnalysisInProgress:', result, 'activeJob:', activeJob?.status);
    return result;
  }, [activeJob]);

  const value: AnalysisContextType = {
    // État
    analysis,
    activeJob,
    conversations,
    currentConversationId,
    
    // État de chargement
    isLoading,
    isConversationsLoading,
    error,
    isInitialized,
    
    // Actions
    startAnalysis,
    refreshAnalysis,
    loadConversations,
    setCurrentConversation,
    
    // Helpers
    hasAnalysis,
    isAnalysisInProgress,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};