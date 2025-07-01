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

const JobSchema = z.object({
  run_id: z.string(),
  status: z.string(),
  progress: z.number(),
  tiktok_handle: z.string(),
  account_id: z.string(),
  started_at: z.string(),
})

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
      } else {
       const activeJobResponse = await fetch(`${API_ENDPOINTS.TIKTOK_ANALYSIS_START().replace('/account-analysis', '')}/account-analysis/active-job`, {
          headers: { Authorization: `Bearer ${token}` },
        });

      if (activeJobResponse.ok) {
        const activeJobData = await activeJobResponse.json();
        if (activeJobData) {
          console.log('✅ Found an active job:', activeJobData);
          setActiveJob(activeJobData);
          setAnalysis(null);
          setIsLoading(false);
          return;
        }
      } else {
        console.warn('⚠️ Could not check for active job, proceeding...');
      }
      }

      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis status. Please try again.');
      }

      const result = await response.json();

      if (result.success && result.data) {
        console.log('✅ Existing analysis found:', result.data);
        setAnalysis(result.data);
      } else {
        console.log('ℹ️ No existing analysis found.');
        setAnalysis(null);
      }
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