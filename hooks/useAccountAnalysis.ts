import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';

interface TikTokAnalysis {
  id: string;
  tiktok_handle: string;
  status: 'completed' | 'pending' | 'failed';
  result?: any;
}

interface UseAccountAnalysisReturn {
  analysis: TikTokAnalysis | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalysis: () => void;
}

export default function useAccountAnalysis(): UseAccountAnalysisReturn {
  const { getToken } = useAuth();
  const [analysis, setAnalysis] = useState<TikTokAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    // Don't refetch if already loading
    if (isLoading && analysis) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('User not authenticated.');
      }
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setAnalysis(null);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch analysis status');
        }
      } else {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (e: any) {
      setError(e.message);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return { analysis, isLoading, error, refreshAnalysis: fetchAnalysis };
} 