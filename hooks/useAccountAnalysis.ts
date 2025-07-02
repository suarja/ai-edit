import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';
import { z } from 'zod';

interface TikTokAnalysis {
  id: string;
  tiktok_handle: string;
  status: 'completed' | 'pending' | 'failed';
  result?: any;
  account_id: string;
}

interface UseAccountAnalysisReturn {
  analysis: TikTokAnalysis | null;
  activeJob: any | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalysis: (job?: JobType) => void;
}

const LogEventSchema = z.object({
  event: z.string(),
  timestamp: z.string(),
}).passthrough(); // Allows other properties not explicitly defined

const JobSchema = z.object({
  run_id: z.string(),
  status: z.string(),
  progress: z.number().optional(),
  tiktok_handle: z.string().optional(),
  account_id: z.string().optional(),
  started_at: z.string().optional(),
  error_message: z.string().optional(),
  logs: z.object({
    events: z.array(LogEventSchema).optional()
  }).optional(),
}).passthrough();

export type JobType = z.infer<typeof JobSchema>;

export function useAccountAnalysis(): UseAccountAnalysisReturn {
  const { getToken } = useAuth();
  const [analysis, setAnalysis] = useState<TikTokAnalysis | null>(null);
  const [activeJob, setActiveJob] = useState<JobType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (job?: JobType) => {
    console.log('🔄 useAccountAnalysis: Fetching analysis data...');
    setIsLoading(true);
    setError(null);
    setActiveJob(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available.');
      }

      if (job) {
       setActiveJob(job);
       setIsLoading(false);
       return;
      }

      // STEP 1: First check for existing completed analysis
      // This ensures we prioritize showing results over the start screen
      const analysisResponse = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();
        if (analysisResult.success && analysisResult.data) {
          console.log('✅ Existing analysis found, showing results:', analysisResult.data);
          setAnalysis(analysisResult.data);
          setIsLoading(false);
          return; // Exit early - show the analysis results
        }
      }

      // STEP 2: No completed analysis found, check for active job
      const activeJobResponse = await fetch(`${API_ENDPOINTS.TIKTOK_ANALYSIS_START().replace('/account-analysis', '')}/account-analysis/active-job`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (activeJobResponse.ok) {
        const activeJobData = await activeJobResponse.json();
        if (activeJobData) {
          console.log('✅ Found an active job, showing progress screen:', activeJobData);
          setActiveJob(activeJobData);
          setAnalysis(null);
          setIsLoading(false);
          return; // Exit early - show the progress screen
        }
      } else {
        console.warn('⚠️ Could not check for active job, proceeding to start screen...');
      }

      // STEP 3: Neither completed analysis nor active job found
      console.log('ℹ️ No existing analysis or active job found, showing start screen.');
      setAnalysis(null);

    } catch (e: any) {
      console.error('❌ useAccountAnalysis: Error fetching analysis:', e);
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return { analysis, activeJob, isLoading, error, refreshAnalysis: fetchAnalysis };
} 