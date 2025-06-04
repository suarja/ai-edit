import { useMemo } from 'react';
import {
  VoiceClone,
  EditorialProfile,
  CaptionConfiguration,
} from '@/types/video';

/**
 * Custom hook to check if all required configurations are complete
 */
export default function useConfigurationStatus({
  voiceClone,
  editorialProfile,
  captionConfig,
}: {
  voiceClone: VoiceClone | null;
  editorialProfile: EditorialProfile | null;
  captionConfig: CaptionConfiguration | null;
}) {
  // Check if voice is configured
  const voiceConfigured = useMemo(() => {
    return voiceClone && voiceClone.status === 'completed';
  }, [voiceClone]);

  // Check if editorial profile is configured
  const editorialConfigured = useMemo(() => {
    return !!editorialProfile;
  }, [editorialProfile]);

  // Check if captions are configured
  const captionConfigured = useMemo(() => {
    return !!captionConfig && !!captionConfig.presetId;
  }, [captionConfig]);

  // Overall configuration status
  const hasIncompleteConfig = useMemo(() => {
    return !voiceConfigured || !editorialConfigured || !captionConfigured;
  }, [voiceConfigured, editorialConfigured, captionConfigured]);

  return {
    voiceConfigured,
    editorialConfigured,
    captionConfigured,
    hasIncompleteConfig,
  };
}
