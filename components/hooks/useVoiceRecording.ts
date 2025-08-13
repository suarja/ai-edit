import { useState, useEffect, useRef, useCallback } from 'react';
import { useAudioRecorder } from 'expo-audio';
import {
  VoiceRecordingConfig,
  VoiceRecordingState,
  VoiceRecordingActions,
  VoiceRecordingStatus,
  UseVoiceRecordingReturn,
  VoiceRecordingError,
  VoiceRecordingProgress,
  VoiceRecordingResult,
  RecordingState,
  UIState,
  VOICE_RECORDING_ERROR_CODES,
  errorTaxonomy,
  DEFAULT_VOICE_RECORDING_CONFIG,
} from '@/lib/types/voice-recording';

export const useVoiceRecording = (
  config: VoiceRecordingConfig = {}
): UseVoiceRecordingReturn => {
  // Merge with default config
  const fullConfig = { ...DEFAULT_VOICE_RECORDING_CONFIG, ...config };

  // Separate recording state from UI state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [uiState, setUiState] = useState<UIState>('ready');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Audio data
  const recorder = useAudioRecorder({
    android: {
      extension: '.m4a',
      outputFormat: 'mpeg4',
      audioEncoder: 'aac',
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      audioQuality: 'high',
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    web: {},
  });
  
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Error handling
  const [error, setError] = useState<VoiceRecordingError | null>(null);
  const [lastError, setLastError] = useState<VoiceRecordingError | null>(null);

  // Progress tracking
  const [progress, setProgress] = useState<VoiceRecordingProgress | null>(null);

  // Resource tracking for guaranteed cleanup
  const resourceTracker = useRef<{
    timers: number[];
    intervals: number[];
  }>({
    timers: [],
    intervals: [],
  });

  // Duration tracking
  const durationTracker = useRef<{
    startTime: number | null;
    interval: number | null;
  }>({
    startTime: null,
    interval: null,
  });

  // Error creation helper
  const createError = useCallback(
    (code: string, customMessage?: string): VoiceRecordingError => {
      const baseError =
        errorTaxonomy[code] ||
        errorTaxonomy[VOICE_RECORDING_ERROR_CODES.UNKNOWN_ERROR];
      return {
        ...baseError,
        message: customMessage || baseError.message,
        retryAction: async () => {
          clearError();
          if (recordingState === 'error') {
            reset();
          }
        },
      };
    },
    [recordingState]
  );

  // Progress update helper
  const updateProgress = useCallback(
    (
      stage: VoiceRecordingProgress['stage'],
      message: string,
      percent: number
    ) => {
      const progressUpdate: VoiceRecordingProgress = {
        stage,
        message,
        percent,
      };
      setProgress(progressUpdate);
      config.onProgress?.(progressUpdate);
    },
    [config]
  );

  // Resource cleanup
  const cleanupResources = useCallback(async () => {
    try {
      // Stop recording if active
      if (recorder.isRecording) {
        try {
          await recorder.stop();
        } catch (err) {
          console.warn('Error stopping recording:', err);
        }
      }

      // Clear all timers and intervals
      [
        ...resourceTracker.current.timers,
        ...resourceTracker.current.intervals,
      ].forEach((timer) => {
        clearTimeout(timer);
        clearInterval(timer);
      });
      resourceTracker.current.timers = [];
      resourceTracker.current.intervals = [];

      // Clear duration tracker
      if (durationTracker.current.interval) {
        clearInterval(durationTracker.current.interval);
        durationTracker.current.interval = null;
      }
      durationTracker.current.startTime = null;
    } catch (err) {
      console.error('Error during resource cleanup:', err);
    }
  }, [recorder]);

  // Duration tracking
  const startDurationTracking = useCallback(() => {
    durationTracker.current.startTime = Date.now();
    durationTracker.current.interval = setInterval(() => {
      if (durationTracker.current.startTime) {
        const duration = Date.now() - durationTracker.current.startTime;
        setRecordingDuration(duration);

        // Auto-stop if max duration reached
        if (duration >= fullConfig.maxDuration) {
          stopRecording();
        }
      }
    }, 100);

    // Track the interval for cleanup
    if (durationTracker.current.interval) {
      resourceTracker.current.intervals.push(durationTracker.current.interval);
    }
  }, [fullConfig.maxDuration]);

  const stopDurationTracking = useCallback(() => {
    if (durationTracker.current.interval) {
      clearInterval(durationTracker.current.interval);
      durationTracker.current.interval = null;
    }
    durationTracker.current.startTime = null;
  }, []);

  // State transition guards
  const canStartRecording = useCallback(() => {
    return recordingState === 'idle' && uiState !== 'loading' && !isRecording;
  }, [recordingState, uiState, isRecording]);

  const canStopRecording = useCallback(() => {
    return recordingState === 'recording' && recorder.isRecording;
  }, [recordingState, recorder.isRecording]);

  const canRetry = useCallback(() => {
    return error?.recoverable === true || recordingState === 'error';
  }, [error, recordingState]);

  const canSubmit = useCallback(() => {
    return (
      recordingUri !== null && recordingState === 'completed' && !isProcessing
    );
  }, [recordingUri, recordingState, isProcessing]);

  // Actions
  const startRecording = useCallback(async () => {
    if (!canStartRecording()) {
      console.warn('Cannot start recording in current state');
      return;
    }

    try {
      setRecordingState('initializing');
      setUiState('loading');
      setError(null);
      updateProgress('preparing', "Préparation de l'enregistrement...", 0);

      // Request permissions
      const { granted } = await recorder.requestPermissions();
      if (!granted) {
        throw createError(VOICE_RECORDING_ERROR_CODES.PERMISSION_DENIED);
      }

      // Start recording
      await recorder.record();

      // Update state
      setRecordingState('recording');
      setUiState('ready');
      setIsRecording(true);
      setRecordingDuration(0);
      updateProgress('recording', 'Enregistrement en cours...', 20);

      // Start duration tracking
      startDurationTracking();
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setRecordingState('error');
      setUiState('error');

      let error: VoiceRecordingError;
      if (err instanceof Error && err.message.includes('permission')) {
        error = createError(VOICE_RECORDING_ERROR_CODES.PERMISSION_DENIED);
      } else {
        error = createError(
          VOICE_RECORDING_ERROR_CODES.RECORDING_FAILED,
          err.message
        );
      }

      setError(error);
      setLastError(error);
      config.onError?.(error);
    }
  }, [
    canStartRecording,
    createError,
    updateProgress,
    config,
    startDurationTracking,
    recorder,
  ]);

  const stopRecording = useCallback(async () => {
    if (!canStopRecording()) {
      console.warn('Cannot stop recording in current state');
      return;
    }

    try {
      setRecordingState('stopping');
      setUiState('loading');
      updateProgress('processing', "Arrêt de l'enregistrement...", 60);

      // Stop duration tracking first
      stopDurationTracking();

      // Validate minimum duration
      if (recordingDuration < fullConfig.minDuration) {
        await recorder.stop();
        throw createError(
          VOICE_RECORDING_ERROR_CODES.RECORDING_TOO_SHORT,
          `L'enregistrement est trop court. Minimum ${
            fullConfig.minDuration / 1000
          } secondes requis.`
        );
      }

      // Stop recording and get URI
      const uri = await recorder.stop();

      if (!uri) {
        throw createError(
          VOICE_RECORDING_ERROR_CODES.RECORDING_FAILED,
          "Impossible d'obtenir l'URI d'enregistrement"
        );
      }

      // Verify file exists and has content
      try {
        const response = await fetch(uri);
        const blob = await response.blob();

        if (blob.size === 0) {
          throw createError(VOICE_RECORDING_ERROR_CODES.RECORDING_EMPTY);
        }

        // File size validation
        if (blob.size > 10 * 1024 * 1024) {
          // 10MB limit
          throw createError(VOICE_RECORDING_ERROR_CODES.FILE_TOO_LARGE);
        }

        console.log('Recording file size:', blob.size);
      } catch (fetchErr: any) {
        console.error('Error verifying recording file:', fetchErr);
        throw createError(
          VOICE_RECORDING_ERROR_CODES.RECORDING_CORRUPTED,
          "Impossible de vérifier l'enregistrement"
        );
      }

      // Update state
      setRecordingUri(uri);
      setRecordingState('completed');
      setUiState('success');
      setIsRecording(false);
      setIsCompleted(true);
      updateProgress('completed', 'Enregistrement terminé', 100);

      // Auto-submit if configured
      if (fullConfig.autoSubmit) {
        setTimeout(() => submitRecording(), 500);
      }
    } catch (err: any) {
      console.error('Failed to stop recording:', err);
      setRecordingState('error');
      setUiState('error');
      setIsRecording(false);

      let error: VoiceRecordingError;
      if (err.code) {
        error = err; // Already a VoiceRecordingError
      } else {
        error = createError(
          VOICE_RECORDING_ERROR_CODES.RECORDING_FAILED,
          err.message
        );
      }

      setError(error);
      setLastError(error);
      config.onError?.(error);

      // Cleanup recording on error
      if (recorder.isRecording) {
        try {
          await recorder.stop();
        } catch (cleanupErr) {
          console.warn('Error during recording cleanup:', cleanupErr);
        }
      }
    }
  }, [
    canStopRecording,
    recorder,
    recordingDuration,
    fullConfig,
    updateProgress,
    config,
    stopDurationTracking,
    createError,
  ]);

  const cancelRecording = useCallback(async () => {
    setRecordingState('idle');
    setUiState('ready');
    setIsRecording(false);
    setIsProcessing(false);
    setRecordingUri(null);
    setRecordingDuration(0);
    setProgress(null);
    stopDurationTracking();
    await cleanupResources();
  }, [stopDurationTracking, cleanupResources]);

  const clearError = useCallback(() => {
    setError(null);
    if (recordingState === 'error') {
      setRecordingState('idle');
      setUiState('ready');
    }
  }, [recordingState]);

  const retry = useCallback(async () => {
    if (!canRetry()) {
      return;
    }

    clearError();
    await cleanupResources();
    reset();

    // Retry the last action based on state
    if (lastError?.type === 'recording' || lastError?.type === 'permission') {
      setTimeout(() => startRecording(), 100);
    }
  }, [canRetry, clearError, cleanupResources, lastError, startRecording]);

  const reset = useCallback(async () => {
    setRecordingState('idle');
    setUiState('ready');
    setIsRecording(false);
    setIsProcessing(false);
    setIsCompleted(false);
    setRecordingUri(null);
    setRecordingDuration(0);
    setError(null);
    setProgress(null);
    stopDurationTracking();
    await cleanupResources();
  }, [stopDurationTracking, cleanupResources]);

  const submitRecording = useCallback(async () => {
    if (!canSubmit() || !recordingUri) {
      console.warn('Cannot submit recording in current state');
      return;
    }

    try {
      setIsProcessing(true);
      setUiState('loading');
      updateProgress('uploading', 'Soumission en cours...', 80);

      // Create result object
      const result: VoiceRecordingResult = {
        uri: recordingUri,
        duration: recordingDuration,
        fileSize: 0, // Will be populated by caller
        fileName: `recording-${Date.now()}.m4a`,
        successful: true,
      };

      updateProgress('completed', 'Soumission réussie', 100);
      config.onSuccess?.(result);
    } catch (err: any) {
      console.error('Failed to submit recording:', err);
      const error = createError(
        VOICE_RECORDING_ERROR_CODES.BACKEND_ERROR,
        err.message
      );
      setError(error);
      setLastError(error);
      config.onError?.(error);
    } finally {
      setIsProcessing(false);
      setUiState('ready');
    }
  }, [
    canSubmit,
    recordingUri,
    recordingDuration,
    updateProgress,
    config,
    createError,
  ]);

  // Guaranteed cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  // State object
  const state: VoiceRecordingState = {
    recordingState,
    uiState,
    isRecording: recorder.isRecording,
    isProcessing,
    isCompleted,
    recording: null, // Not needed with expo-audio
    recordingUri,
    recordingDuration,
    error,
    lastError,
    progress,
  };

  // Actions object
  const actions: VoiceRecordingActions = {
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
    retry,
    reset,
    submitRecording,
  };

  // Status object
  const status: VoiceRecordingStatus = {
    canStart: canStartRecording(),
    canStop: canStopRecording(),
    canRetry: canRetry(),
    canSubmit: canSubmit(),
    hasError: error !== null,
    isActive: isRecording || isProcessing,
  };

  return { state, actions, status };
};
