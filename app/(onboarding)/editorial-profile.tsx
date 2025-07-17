import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  AlertCircle,
  User,
  MessageCircle,
  Users,
  FileText,
  ArrowRight,
  Edit,
} from 'lucide-react-native';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useOnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/components/hooks/useGetUser';

type EditorialProfile = {
  id: string;
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
};

const DEFAULT_PROFILE: EditorialProfile = {
  id: '',
  persona_description: '',
  tone_of_voice: '',
  audience: '',
  style_notes: '',
};

export default function EditorialProfileScreen() {
  const { nextStep, markStepCompleted, surveyAnswers } = useOnboarding();
  const onboardingSteps = useOnboardingSteps();
  const [profile, setProfile] = useState<EditorialProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = await fetchUser();

      if (!user) {
        console.error('No user found during onboarding');
        setError('Session expirée');
        setLoading(false);
        return;
      }

      const { data: existingProfile } = await supabase
        .from('editorial_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

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
        const defaultProfile = { ...DEFAULT_PROFILE };

        if (surveyAnswers.content_style) {
          defaultProfile.persona_description = `Créateur de contenu axé sur ${surveyAnswers.content_style}`;
        }

        if (surveyAnswers.platform_focus) {
          defaultProfile.audience = `Audience sur la plateforme ${surveyAnswers.platform_focus}`;
        }

        setProfile(defaultProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Échec du chargement des données de profil');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    markStepCompleted('editorial-profile');
    nextStep();
  };

  const handleSkip = () => {
    markStepCompleted('editorial-profile');
    nextStep();
  };

  const handleCustomize = () => {
    // Navigate to the settings editorial page for detailed editing
    router.push('/(settings)/editorial');
  };

  // Check if profile has meaningful content
  const hasProfile =
    profile.persona_description?.trim() ||
    profile.tone_of_voice?.trim() ||
    profile.audience?.trim() ||
    profile.style_notes?.trim();

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
          <Text style={styles.loadingText}>Chargement de votre profil...</Text>
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

      <View style={styles.header}>
        <Text style={styles.title}>Votre Profil Éditorial</Text>
        <Text style={styles.subtitle}>
          {hasProfile
            ? 'Voici votre profil créé automatiquement'
            : 'Nous avons préparé un profil de base pour vous'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.profileContent}>
            {hasProfile ? (
              <>
                {profile.persona_description && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <User size={20} color="#007AFF" />
                      <Text style={styles.sectionTitle}>
                        Description de la Persona
                      </Text>
                    </View>
                    <Text style={styles.sectionContent}>
                      {profile.persona_description}
                    </Text>
                  </View>
                )}

                {profile.tone_of_voice && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <MessageCircle size={20} color="#007AFF" />
                      <Text style={styles.sectionTitle}>Ton de Voix</Text>
                    </View>
                    <Text style={styles.sectionContent}>
                      {profile.tone_of_voice}
                    </Text>
                  </View>
                )}

                {profile.audience && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Users size={20} color="#007AFF" />
                      <Text style={styles.sectionTitle}>Audience Cible</Text>
                    </View>
                    <Text style={styles.sectionContent}>
                      {profile.audience}
                    </Text>
                  </View>
                )}

                {profile.style_notes && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <FileText size={20} color="#007AFF" />
                      <Text style={styles.sectionTitle}>Notes de Style</Text>
                    </View>
                    <Text style={styles.sectionContent}>
                      {profile.style_notes}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.customizeButton}
                  onPress={handleCustomize}
                >
                  <Edit size={20} color="#007AFF" />
                  <Text style={styles.customizeButtonText}>
                    Personnaliser le profil
                  </Text>
                  <ArrowRight size={16} color="#007AFF" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <User size={48} color="#666" />
                </View>
                <Text style={styles.emptyTitle}>
                  Profil en cours de création
                </Text>
                <Text style={styles.emptyDescription}>
                  Basé sur vos réponses au questionnaire, nous créerons
                  automatiquement votre profil éditorial
                </Text>

                <TouchableOpacity
                  style={styles.customizeButton}
                  onPress={handleCustomize}
                >
                  <Edit size={20} color="#007AFF" />
                  <Text style={styles.customizeButtonText}>
                    Créer mon profil maintenant
                  </Text>
                  <ArrowRight size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Passer pour l&apos;instant</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continuer</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  profileContent: {
    gap: 16,
  },
  section: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionContent: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  customizeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  skipButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
