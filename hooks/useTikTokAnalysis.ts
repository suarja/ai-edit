import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRevenueCat } from '@/providers/RevenueCat';
import { API_ENDPOINTS } from '@/lib/config/api';

// Development override for RevenueCat (set to true to bypass Pro checks)
// This is a simple code-level toggle for testing - not a UI feature
const DEV_OVERRIDE_PRO = __DEV__ && true; // Change to false when testing Pro flow

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

export interface ExistingAnalysis {
  id: string;
  tiktok_handle: string;
  status: 'pending' | 'scraping' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  result?: TikTokAnalysisResult;
}

export interface TikTokAnalysisState {
  // Flow state
  currentStep: 'paywall' | 'input' | 'validating' | 'analyzing' | 'chat' | 'error';
  
  // Analysis state
  isAnalyzing: boolean;
  progress: number;
  status: 'idle' | 'starting' | 'scraping' | 'analyzing' | 'completed' | 'failed';
  statusMessage: string;
  analysisResult: TikTokAnalysisResult | null;
  error: string | null;
  runId: string | null;
  
  // Handle validation
  handleInput: string;
  handleError: string | null;
  isValidatingHandle: boolean;
  isHandleValid: boolean;
  
  // Existing analysis
  existingAnalysis: ExistingAnalysis | null;
  hasExistingAnalysis: boolean;
}

export function useTikTokAnalysis() {
  const { getToken } = useAuth();
  const { isPro } = useRevenueCat();
  const validationTimeoutRef = useRef<number | null>(null);
  
  // Effective Pro status (with dev override)
  const effectiveIsPro = DEV_OVERRIDE_PRO || isPro;
  
  const [state, setState] = useState<TikTokAnalysisState>({
    currentStep: effectiveIsPro ? 'input' : 'paywall',
    isAnalyzing: false,
    progress: 0,
    status: 'idle',
    statusMessage: '',
    analysisResult: null,
    error: null,
    runId: null,
    handleInput: '',
    handleError: null,
    isValidatingHandle: false,
    isHandleValid: false,
    existingAnalysis: null,
    hasExistingAnalysis: false,
  });

  const updateState = useCallback((updates: Partial<TikTokAnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Check for existing analysis on mount
  useEffect(() => {
    if (effectiveIsPro) {
      checkExistingAnalysis();
    }
  }, [effectiveIsPro]);

  // Update current step based on Pro status
  useEffect(() => {
    if (!effectiveIsPro && state.currentStep !== 'paywall') {
      updateState({ currentStep: 'paywall' });
    } else if (effectiveIsPro && state.currentStep === 'paywall') {
      updateState({ currentStep: state.hasExistingAnalysis ? 'chat' : 'input' });
    }
  }, [effectiveIsPro, state.hasExistingAnalysis]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Check if user has existing completed analysis
   */
  const checkExistingAnalysis = useCallback(async () => {
    if (!effectiveIsPro) return;

    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING(), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.data) {
        updateState({
          existingAnalysis: data.data,
          hasExistingAnalysis: true,
          currentStep: 'chat',
          analysisResult: data.data.result,
          status: 'completed',
        });
      }
    } catch (error) {
      console.warn('Failed to check existing analysis:', error);
    }
  }, [effectiveIsPro, getToken, updateState]);

  /**
   * Update handle input (with debounced validation)
   */
  const updateHandleInput = useCallback((handle: string) => {
    // Clean handle (remove @ and spaces)
    const cleanHandle = handle.replace(/[@\s]/g, '');
    updateState({ 
      handleInput: cleanHandle,
      handleError: null, // Clear any previous errors when user types
      isHandleValid: false // Reset validation state when typing
    });

    // Clear existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Set new timeout for validation (2 seconds after user stops typing)
    if (cleanHandle.length >= 2) {
      validationTimeoutRef.current = setTimeout(async () => {
        // Inline validation to avoid dependency issues
        if (cleanHandle.length < 2) return;
        
        updateState({ 
          isValidatingHandle: true, 
          handleError: null 
        });

        try {
          const token = await getToken();
          const response = await fetch(API_ENDPOINTS.TIKTOK_HANDLE_VALIDATE(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ tiktok_handle: cleanHandle }),
          });

          const data = await response.json();
          
          if (!data.success) {
            updateState({ 
              handleError: data.error || 'Handle invalide',
              isValidatingHandle: false 
            });
            return;
          }

          // Check if analysis already exists for this handle
          if (data.data.hasExistingAnalysis) {
            updateState({
              existingAnalysis: data.data.analysis,
              hasExistingAnalysis: true,
              currentStep: 'chat',
              analysisResult: data.data.analysis.result,
              status: 'completed',
              isValidatingHandle: false,
            });
            return;
          }

          updateState({ 
            isValidatingHandle: false,
            handleError: null,
            isHandleValid: true
          });
        } catch (error) {
          updateState({ 
            handleError: 'Erreur de validation',
            isValidatingHandle: false 
          });
        }
      }, 2000);
    }
  }, [updateState, getToken]);

  /**
   * Validate TikTok handle (call this explicitly, not on every keystroke)
   */
  const validateHandle = useCallback(async (handle?: string): Promise<boolean> => {
    const targetHandle = handle || state.handleInput;
    
    if (!targetHandle.trim()) {
      updateState({ handleError: 'Veuillez entrer un handle TikTok' });
      return false;
    }

    // Clean handle (remove @ and spaces)
    const cleanHandle = targetHandle.replace(/[@\s]/g, '');
    
    if (cleanHandle.length < 2) {
      updateState({ handleError: 'Handle trop court (minimum 2 caractères)' });
      return false;
    }

    updateState({ 
      isValidatingHandle: true, 
      handleError: null,
      handleInput: cleanHandle 
    });

    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_HANDLE_VALIDATE(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tiktok_handle: cleanHandle }),
      });

      const data = await response.json();
      
      if (!data.success) {
        updateState({ 
          handleError: data.error || 'Handle invalide',
          isValidatingHandle: false,
          isHandleValid: false
        });
        return false;
      }

      // Check if analysis already exists for this handle
      if (data.data.hasExistingAnalysis) {
        updateState({
          existingAnalysis: data.data.analysis,
          hasExistingAnalysis: true,
          currentStep: 'chat',
          analysisResult: data.data.analysis.result,
          status: 'completed',
          isValidatingHandle: false,
        });
        return true;
      }

      updateState({ 
        isValidatingHandle: false,
        handleError: null 
      });
      return true;

    } catch (error) {
      updateState({ 
        handleError: 'Erreur de validation',
        isValidatingHandle: false,
        isHandleValid: false
      });
      return false;
    }
  }, [getToken, updateState, state.handleInput]);

  /**
   * Start new analysis
   */
  const startAnalysis = useCallback(async (tiktokHandle?: string) => {
    const handle = tiktokHandle || state.handleInput;
    
    if (!effectiveIsPro) {
      throw new Error('Fonctionnalité Pro requise');
    }

    // Validate handle first
    const isValid = await validateHandle(handle);
    if (!isValid) return;

    // If existing analysis found during validation, don't start new one
    if (state.hasExistingAnalysis) return;

    try {
      updateState({
        currentStep: 'analyzing',
        isAnalyzing: true,
        error: null,
        progress: 5,
        status: 'starting',
        statusMessage: 'Initialisation de l\'analyse...',
      });

      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_START(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          tiktok_handle: handle,
          is_pro: effectiveIsPro 
        }),
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
      
      // Start polling for progress
      startPolling(data.data.run_id);

    } catch (err: any) {
      updateState({
        error: err.message,
        isAnalyzing: false,
        status: 'failed',
        statusMessage: 'Échec de l\'analyse',
        currentStep: 'error',
      });
    }
  }, [effectiveIsPro, state.handleInput, state.hasExistingAnalysis, getToken, updateState, validateHandle]);

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
              currentStep: 'error',
            });
            return;
          }
          
          updateState({
            progress: progressValue,
            status,
            statusMessage,
          });
        }
        
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          updateState({
            error: 'Timeout - l\'analyse prend trop de temps',
            isAnalyzing: false,
            status: 'failed',
            statusMessage: 'Timeout de l\'analyse',
            currentStep: 'error',
          });
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
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
          currentStep: 'chat',
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
        currentStep: 'error',
      });
    }
  }, [getToken, updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const reset = useCallback(() => {
    setState({
      currentStep: effectiveIsPro ? 'input' : 'paywall',
      isAnalyzing: false,
      progress: 0,
      status: 'idle',
      statusMessage: '',
      analysisResult: null,
      error: null,
      runId: null,
      handleInput: '',
      handleError: null,
      isValidatingHandle: false,
      isHandleValid: false,
      existingAnalysis: null,
      hasExistingAnalysis: false,
    });
  }, [effectiveIsPro]);

  const retryFromError = useCallback(() => {
    updateState({ 
      currentStep: 'input',
      error: null,
      status: 'idle',
      isAnalyzing: false,
    });
  }, [updateState]);

  return {
    // Actions
    startAnalysis,
    updateHandleInput,
    validateHandle,
    clearError,
    reset,
    retryFromError,
    checkExistingAnalysis,
    
    // State
    currentStep: state.currentStep,
    isAnalyzing: state.isAnalyzing,
    progress: state.progress,
    status: state.status,
    statusMessage: state.statusMessage,
    analysisResult: state.analysisResult,
    error: state.error,
    runId: state.runId,
    
    // Handle validation
    handleInput: state.handleInput,
    handleError: state.handleError,
    isValidatingHandle: state.isValidatingHandle,
    isHandleValid: state.isHandleValid,
    
    // Existing analysis
    existingAnalysis: state.existingAnalysis,
    hasExistingAnalysis: state.hasExistingAnalysis,
    
    // Computed
    hasResult: !!state.analysisResult,
    isComplete: state.status === 'completed',
    isFailed: state.status === 'failed',
    effectiveIsPro,
    
    // Dev overrides
    DEV_OVERRIDE_PRO,
  };
} 