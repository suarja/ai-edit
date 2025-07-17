import { Audio } from 'expo-av';

// Voice recording configuration
export interface VoiceRecordingConfig {
  minDuration?: number;
  maxDuration?: number;
  autoSubmit?: boolean;
  variant?: 'onboarding' | 'settings';
  onSuccess?: (result: VoiceRecordingResult) => void;
  onError?: (error: VoiceRecordingError) => void;
  onProgress?: (progress: VoiceRecordingProgress) => void;
}

// Voice recording result
export interface VoiceRecordingResult {
  uri: string;
  duration: number;
  fileSize: number;
  fileName: string;
  successful: boolean;
  voiceCloneId?: string;
}

// Voice recording progress
export interface VoiceRecordingProgress {
  stage: 'preparing' | 'recording' | 'processing' | 'uploading' | 'completed';
  message: string;
  percent: number;
}

// Voice recording error types
export type VoiceRecordingErrorType =
  | 'permission'
  | 'recording'
  | 'processing'
  | 'network'
  | 'validation'
  | 'backend'
  | 'timeout';

// Voice recording error
export interface VoiceRecordingError {
  type: VoiceRecordingErrorType;
  code: string;
  message: string;
  recoverable: boolean;
  retryAction?: () => Promise<void>;
  userAction: string;
}

// Recording states
export type RecordingState =
  | 'idle'
  | 'initializing'
  | 'recording'
  | 'stopping'
  | 'processing'
  | 'completed'
  | 'error';

// UI states
export type UIState = 'ready' | 'loading' | 'disabled' | 'success' | 'error';

// Main voice recording state
export interface VoiceRecordingState {
  // Recording states
  recordingState: RecordingState;
  uiState: UIState;
  isRecording: boolean;
  isProcessing: boolean;
  isCompleted: boolean;

  // Audio data
  recording: Audio.Recording | null;
  recordingUri: string | null;
  recordingDuration: number;

  // Error handling
  error: VoiceRecordingError | null;
  lastError: VoiceRecordingError | null;

  // Progress tracking
  progress: VoiceRecordingProgress | null;
}

// Voice recording actions
export interface VoiceRecordingActions {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;
  clearError: () => void;
  retry: () => Promise<void>;
  reset: () => void;
  submitRecording: () => Promise<void>;
}

// Voice recording status for external components
export interface VoiceRecordingStatus {
  canStart: boolean;
  canStop: boolean;
  canRetry: boolean;
  canSubmit: boolean;
  hasError: boolean;
  isActive: boolean;
}

// Resource tracker for cleanup
export interface VoiceRecordingResources {
  recording: Audio.Recording | null;
  timers: number[];
  intervals: number[];
  sounds: Audio.Sound[];
}

// Hook return type
export interface UseVoiceRecordingReturn {
  state: VoiceRecordingState;
  actions: VoiceRecordingActions;
  status: VoiceRecordingStatus;
}

// Error taxonomy for consistent error handling
export const VOICE_RECORDING_ERROR_CODES = {
  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_RESTRICTED: 'PERMISSION_RESTRICTED',

  // Recording errors
  RECORDING_FAILED: 'RECORDING_FAILED',
  RECORDING_TOO_SHORT: 'RECORDING_TOO_SHORT',
  RECORDING_TOO_LONG: 'RECORDING_TOO_LONG',
  RECORDING_EMPTY: 'RECORDING_EMPTY',
  RECORDING_CORRUPTED: 'RECORDING_CORRUPTED',

  // Processing errors
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  PROCESSING_TIMEOUT: 'PROCESSING_TIMEOUT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',

  // Backend errors
  BACKEND_ERROR: 'BACKEND_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',

  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RESOURCE_CLEANUP_ERROR: 'RESOURCE_CLEANUP_ERROR',
} as const;

// Error taxonomy mapping
export const errorTaxonomy: Record<
  string,
  Omit<VoiceRecordingError, 'retryAction'>
> = {
  [VOICE_RECORDING_ERROR_CODES.PERMISSION_DENIED]: {
    type: 'permission',
    code: VOICE_RECORDING_ERROR_CODES.PERMISSION_DENIED,
    message: "Autorisation d'enregistrement refusée",
    recoverable: true,
    userAction: "Activez l'autorisation microphone dans les paramètres",
  },
  [VOICE_RECORDING_ERROR_CODES.RECORDING_FAILED]: {
    type: 'recording',
    code: VOICE_RECORDING_ERROR_CODES.RECORDING_FAILED,
    message: "Échec de l'enregistrement",
    recoverable: true,
    userAction: "Réessayez l'enregistrement",
  },
  [VOICE_RECORDING_ERROR_CODES.RECORDING_TOO_SHORT]: {
    type: 'validation',
    code: VOICE_RECORDING_ERROR_CODES.RECORDING_TOO_SHORT,
    message: "L'enregistrement est trop court",
    recoverable: true,
    userAction: 'Enregistrez pendant au moins 3 secondes',
  },
  [VOICE_RECORDING_ERROR_CODES.PROCESSING_TIMEOUT]: {
    type: 'processing',
    code: VOICE_RECORDING_ERROR_CODES.PROCESSING_TIMEOUT,
    message: 'Délai de traitement dépassé',
    recoverable: true,
    userAction: 'Réessayez la soumission',
  },
  [VOICE_RECORDING_ERROR_CODES.NETWORK_ERROR]: {
    type: 'network',
    code: VOICE_RECORDING_ERROR_CODES.NETWORK_ERROR,
    message: 'Erreur de connexion réseau',
    recoverable: true,
    userAction: 'Vérifiez votre connexion et réessayez',
  },
  [VOICE_RECORDING_ERROR_CODES.BACKEND_ERROR]: {
    type: 'backend',
    code: VOICE_RECORDING_ERROR_CODES.BACKEND_ERROR,
    message: 'Erreur du serveur',
    recoverable: true,
    userAction: 'Réessayez dans quelques instants',
  },
  [VOICE_RECORDING_ERROR_CODES.VALIDATION_ERROR]: {
    type: 'validation',
    code: VOICE_RECORDING_ERROR_CODES.VALIDATION_ERROR,
    message: "Les exigences d'enregistrement ne sont pas respectées",
    recoverable: false,
    userAction: "Vérifiez la qualité et la durée de l'enregistrement",
  },
};

// Default configuration
export const DEFAULT_VOICE_RECORDING_CONFIG: Required<
  Omit<VoiceRecordingConfig, 'onSuccess' | 'onError' | 'onProgress'>
> = {
  minDuration: 3000, // 3 seconds
  maxDuration: 120000, // 2 minutes
  autoSubmit: false,
  variant: 'onboarding',
};
