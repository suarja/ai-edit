import {
  VoiceRecordingActions,
  VoiceRecordingState,
  VoiceRecordingStatus,
} from '@/types/voice-recording';
import { createContext, useContext } from 'react';

// Context for sharing voice recording state
interface VoiceRecordingContextType {
  state: VoiceRecordingState;
  actions: VoiceRecordingActions;
  status: VoiceRecordingStatus;
}

export const VoiceRecordingContext = createContext<VoiceRecordingContextType | null>(
  null
);

// Hook to use voice recording context
export const useVoiceRecordingContext = () => {
  const context = useContext(VoiceRecordingContext);
  if (!context) {
    throw new Error(
      'useVoiceRecordingContext must be used within VoiceRecordingUI'
    );
  }
  return context;
};
