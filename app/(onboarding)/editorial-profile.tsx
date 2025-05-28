import { useOnboardingSteps } from "@/components/onboarding/OnboardingSteps";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { CircleAlert as AlertCircle } from 'lucide-react-native';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import * as Haptics from 'expo-haptics';
import EditorialProfileForm from '@/components/EditorialProfileForm';


  export default function EditorialProfileScreen() {
  const onboardingSteps = useOnboardingSteps();  const { nextStep, markStepCompleted, surveyAnswers } = useOnboarding();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    id: '',
    persona_description: '',
    tone_of_voice: '',
    audience: '',
    style_notes: '',
  });
  const [hasVoiceClone, setHasVoiceClone] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      // Fetch editorial profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('editorial_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Check if user has a voice clone
      const { data: voiceClone } = await supabase
        .from('voice_clones')
        .select('id, status')
        .eq('user_id', user.id)
        .single();

      setHasVoiceClone(!!voiceClone);

      if (existingProfile) {
        setProfile({
          id: existingProfile.id,
          persona_description: existingProfile.persona_description || '',
          tone_of_voice: existingProfile.tone_of_voice || '',
          audience: existingProfile.audience || '',
          style_notes: existingProfile.style_notes || '',
        });
      } else {
        // Pre-fill based on survey answers if available
        if (surveyAnswers.content_style) {
          setProfile((prev) => ({
            ...prev,
            persona_description: `Créateur de contenu axé sur ${surveyAnswers.content_style}`,
          }));
        }

        if (surveyAnswers.platform_focus) {
          setProfile((prev) => ({
            ...prev,
            audience: `Audience sur la plateforme ${surveyAnswers.platform_focus}`,
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Échec du chargement des données de profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedProfile: {
    id: string;
    persona_description: string;
    tone_of_voice: string;
    audience: string;
    style_notes: string;
  }) => {
    try {
      setSaving(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      const { error: saveError } = await supabase
        .from('editorial_profiles')
        .upsert({
          ...(profile.id ? { id: profile.id } : {}),
          user_id: user.id,
          persona_description: updatedProfile.persona_description,
          tone_of_voice: updatedProfile.tone_of_voice,
          audience: updatedProfile.audience,
          style_notes: updatedProfile.style_notes,
        });

      if (saveError) throw saveError;

      // Mark step as completed and proceed to next step in onboarding flow
      markStepCompleted('editorial-profile');

      // Provide haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available');
      }

      nextStep();
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert(
        'Erreur',
        "Échec de l'enregistrement du profil. Veuillez réessayer.",
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Quitter sans enregistrer',
      'Êtes-vous sûr de vouloir continuer sans enregistrer votre profil ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Continuer',
          onPress: () => {
            markStepCompleted('editorial-profile');
            nextStep();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProgressBar
          steps={onboardingSteps}
          currentStep="editorial-profile"
          completedSteps={[
            'welcome',
            'survey',
            'voice-recording',
            'processing',
          ]}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={onboardingSteps}
        currentStep="editorial-profile"
        completedSteps={['welcome', 'survey', 'voice-recording', 'processing']}
      />

      {error ? (
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <EditorialProfileForm
          profile={profile}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    margin: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
});
