import { useMemo } from 'react';
import { CaptionConfiguration } from '@/lib/types/video.types';
import { VoiceConfig } from '@/lib/services/voiceService';

// VoiceClone type definition that matches useVideoRequest
type VoiceClone = {
  id: string;
  elevenlabs_voice_id: string;
  status: string;
};

// EditorialProfile type that matches useVideoRequest (with nullable fields)
type EditorialProfile = {
  id: string;
  persona_description: string | null;
  tone_of_voice: string | null;
  audience: string | null;
  style_notes: string | null;
};

/**
 * Custom hook to check if all required configurations are complete
 */
export default function useConfigurationStatus({
  voiceClone,
  editorialProfile,
  captionConfig,
}: {
  voiceClone: VoiceConfig | null;
  editorialProfile: EditorialProfile | null;
  captionConfig: CaptionConfiguration | null;
}) {
  // Check if voice is configured
  const voiceConfigured = useMemo(() => {
    return Boolean(voiceClone);
  }, [voiceClone]);

  // Check if editorial profile is configured
  const editorialConfigured = useMemo(() => {
    return Boolean(editorialProfile);
  }, [editorialProfile]);

  // Check if captions are configured
  const captionConfigured = useMemo(() => {
    return Boolean(captionConfig && captionConfig.presetId);
  }, [captionConfig]);

  // Overall configuration status
  const hasIncompleteConfig = useMemo(() => {
    return Boolean(
      !voiceConfigured || !editorialConfigured || !captionConfigured
    );
  }, [voiceConfigured, editorialConfigured, captionConfigured]);

  return {
    voiceConfigured,
    editorialConfigured,
    captionConfigured,
    hasIncompleteConfig,
  };
}
