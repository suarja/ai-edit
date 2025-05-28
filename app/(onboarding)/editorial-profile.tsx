import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Save, CircleAlert as AlertCircle, Mic } from 'lucide-react-native';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import * as Haptics from 'expo-haptics';

const ONBOARDING_STEPS = [
  'welcome',
  'survey',
  'voice-recording',
  'processing',
  'editorial-profile',
  'features',
  'trial-offer',
  'subscription',
  'success',
];

export default function EditorialProfileScreen() {
  const { nextStep, markStepCompleted, surveyAnswers } = useOnboarding();
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

  const handleSave = async () => {
    if (
      !profile.persona_description ||
      !profile.tone_of_voice ||
      !profile.audience
    ) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

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
          persona_description: profile.persona_description,
          tone_of_voice: profile.tone_of_voice,
          audience: profile.audience,
          style_notes: profile.style_notes,
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
      setError("Échec de l'enregistrement du profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ProgressBar
          steps={ONBOARDING_STEPS}
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
        steps={ONBOARDING_STEPS}
        currentStep="editorial-profile"
        completedSteps={['welcome', 'survey', 'voice-recording', 'processing']}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Profil éditorial</Text>
        <Text style={styles.subtitle}>Définissez votre style de contenu</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Persona du créateur de contenu</Text>
            <Text style={styles.description}>
              Comment vous décririez-vous en tant que créateur de contenu ?
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Ex: Passionné de technologie partageant des conseils de productivité..."
              placeholderTextColor="#666"
              value={profile.persona_description}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, persona_description: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ton de voix</Text>
            <Text style={styles.description}>
              Comment voulez-vous sonner dans votre contenu ?
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Ex: Professionnel mais amical, utilisant un langage simple..."
              placeholderTextColor="#666"
              value={profile.tone_of_voice}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, tone_of_voice: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Public cible</Text>
            <Text style={styles.description}>
              Pour qui créez-vous du contenu ?
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Ex: Jeunes professionnels intéressés par le développement personnel..."
              placeholderTextColor="#666"
              value={profile.audience}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, audience: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes de style</Text>
            <Text style={styles.description}>
              Des préférences ou directives spécifiques ?
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Ex: Préfère utiliser des exemples concrets..."
              placeholderTextColor="#666"
              value={profile.style_notes}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, style_notes: text }))
              }
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Save size={24} color="#fff" />
              <Text style={styles.saveButtonText}>Continuer</Text>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
