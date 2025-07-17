import { useState } from 'react';
import { useGetUser } from '@/components/hooks/useGetUser';
import { useAuth } from '@clerk/clerk-expo';

export const useAccountAnalysisApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { fetchUser } = useGetUser();

  const startAnalysis = async (tiktokHandle: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await fetchUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // We need the Clerk JWT to authenticate with our backend
      const token = await getToken();

      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_ANALYZER_URL}/api/analysis/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tiktokHandle,
            userId: user.id, // Pass the database user ID
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start analysis.');
      }

      const data = await response.json();
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return { startAnalysis, isLoading, error };
};
