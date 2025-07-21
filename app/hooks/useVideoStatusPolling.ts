/**
 * useVideoStatusPolling Hook
 * Provides real-time status updates for video generation requests
 * Implements periodic polling of video-request status from server-primary
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoRequestStatus } from 'editia-core';

interface VideoStatusPollingOptions {
  /** Video request ID to poll */
  requestId?: string;
  /** Polling interval in milliseconds (default: 5000) */
  interval?: number;
  /** Whether to start polling immediately */
  enabled?: boolean;
  /** Maximum number of polling attempts (default: 60) */
  maxAttempts?: number;
  /** Callback when status changes */
  onStatusChange?: (status: VideoRequestStatus, data?: any) => void;
  /** Callback when polling completes (success or failure) */
  onComplete?: (success: boolean, data?: any) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

interface VideoStatusData {
  id: string;
  status: VideoRequestStatus;
  progress?: number;
  error_message?: string;
  video_url?: string;
  thumbnail_url?: string;
  updated_at: string;
}

interface UseVideoStatusPollingReturn {
  /** Current status of the video request */
  status: VideoRequestStatus | null;
  /** Current progress (0-100) if available */
  progress: number | null;
  /** Error message if status is failed */
  errorMessage: string | null;
  /** Generated video URL if completed */
  videoUrl: string | null;
  /** Thumbnail URL if available */
  thumbnailUrl: string | null;
  /** Whether polling is currently active */
  isPolling: boolean;
  /** Loading state for initial request */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Last updated timestamp */
  lastUpdated: string | null;
  /** Manually start polling */
  startPolling: () => void;
  /** Stop polling */
  stopPolling: () => void;
  /** Reset all state */
  reset: () => void;
  /** Force refresh status once */
  refreshStatus: () => Promise<void>;
}

// Base server URL from environment
const getServerUrl = () => {
  return process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3001';
};

export const useVideoStatusPolling = ({
  requestId,
  interval = 5000,
  enabled = true,
  maxAttempts = 60, // 5 minutes at 5s intervals
  onStatusChange,
  onComplete,
  onError,
}: VideoStatusPollingOptions = {}): UseVideoStatusPollingReturn => {
  // State management
  const [status, setStatus] = useState<VideoRequestStatus | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Refs for managing polling
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);
  const isUnmountedRef = useRef(false);

  /**
   * Fetches video status from server-primary
   */
  const fetchVideoStatus = useCallback(async (): Promise<VideoStatusData | null> => {
    if (!requestId) {
      throw new Error('Request ID is required for status polling');
    }

    try {
      const serverUrl = getServerUrl();
      const response = await fetch(`${serverUrl}/api/video/status/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get video status');
      }

      return data.data as VideoStatusData;
    } catch (error) {
      throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [requestId]);

  /**
   * Updates state with new status data
   */
  const updateStatus = useCallback((data: VideoStatusData) => {
    if (isUnmountedRef.current) return;

    const previousStatus = status;
    
    setStatus(data.status);
    setProgress(data.progress ?? null);
    setErrorMessage(data.error_message ?? null);
    setVideoUrl(data.video_url ?? null);
    setThumbnailUrl(data.thumbnail_url ?? null);
    setLastUpdated(data.updated_at);
    setError(null);

    // Trigger status change callback if status actually changed
    if (previousStatus !== data.status) {
      onStatusChange?.(data.status, data);
    }
  }, [status, onStatusChange]);

  /**
   * Checks if polling should continue based on status
   */
  const shouldContinuePolling = useCallback((currentStatus: VideoRequestStatus): boolean => {
    return currentStatus !== VideoRequestStatus.COMPLETED && 
           currentStatus !== VideoRequestStatus.FAILED;
  }, []);

  /**
   * Performs a single polling attempt
   */
  const pollOnce = useCallback(async () => {
    if (!requestId || isUnmountedRef.current) return;

    try {
      setIsLoading(true);
      const data = await fetchVideoStatus();
      
      if (data && !isUnmountedRef.current) {
        updateStatus(data);
        attemptCountRef.current++;

        // Check if we should stop polling
        if (!shouldContinuePolling(data.status)) {
          setIsPolling(false);
          onComplete?.(data.status === VideoRequestStatus.COMPLETED, data);
          return false; // Stop polling
        }

        // Check max attempts
        if (attemptCountRef.current >= maxAttempts) {
          setIsPolling(false);
          const timeoutError = new Error('Polling timeout: Maximum attempts reached');
          setError(timeoutError);
          onError?.(timeoutError);
          onComplete?.(false, data);
          return false; // Stop polling
        }

        return true; // Continue polling
      }
    } catch (err) {
      if (isUnmountedRef.current) return false;
      
      const error = err instanceof Error ? err : new Error('Unknown polling error');
      setError(error);
      setIsPolling(false);
      onError?.(error);
      onComplete?.(false, null);
      return false; // Stop polling
    } finally {
      if (!isUnmountedRef.current) {
        setIsLoading(false);
      }
    }

    return false;
  }, [requestId, fetchVideoStatus, updateStatus, shouldContinuePolling, maxAttempts, onComplete, onError]);

  /**
   * Starts the polling process
   */
  const startPolling = useCallback(() => {
    if (!requestId || isPolling || isUnmountedRef.current) return;

    setIsPolling(true);
    setError(null);
    attemptCountRef.current = 0;

    // Initial poll
    pollOnce().then((shouldContinue) => {
      if (shouldContinue && !isUnmountedRef.current) {
        // Set up interval for subsequent polls
        intervalRef.current = setInterval(async () => {
          const continuePolling = await pollOnce();
          if (!continuePolling && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }, interval);
      }
    });
  }, [requestId, isPolling, pollOnce, interval]);

  /**
   * Stops the polling process
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  /**
   * Resets all state to initial values
   */
  const reset = useCallback(() => {
    stopPolling();
    setStatus(null);
    setProgress(null);
    setErrorMessage(null);
    setVideoUrl(null);
    setThumbnailUrl(null);
    setIsLoading(false);
    setError(null);
    setLastUpdated(null);
    attemptCountRef.current = 0;
  }, [stopPolling]);

  /**
   * Manually refresh status once (non-polling)
   */
  const refreshStatus = useCallback(async () => {
    if (!requestId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchVideoStatus();
      if (data) {
        updateStatus(data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh status');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, fetchVideoStatus, updateStatus, onError]);

  // Auto-start polling when requestId changes and enabled is true
  useEffect(() => {
    if (requestId && enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [requestId, enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    status,
    progress,
    errorMessage,
    videoUrl,
    thumbnailUrl,
    isPolling,
    isLoading,
    error,
    lastUpdated,
    startPolling,
    stopPolling,
    reset,
    refreshStatus,
  };
};