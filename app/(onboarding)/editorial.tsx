import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Save, CircleAlert as AlertCircle, Mic } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditorialScreen() {
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
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
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
      setError('Please fill in all required fields');
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

      // Navigate based on voice clone status
      if (hasVoiceClone) {
        router.push('/(tabs)/source-videos');
      } else {
        router.push('/(onboarding)/voice-clone');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Editorial Profile</Text>
        <Text style={styles.subtitle}>Define your content style</Text>
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
            <Text style={styles.label}>Content Creator Persona</Text>
            <Text style={styles.description}>
              How would you describe yourself as a content creator?
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="E.g., Tech enthusiast sharing productivity tips..."
              placeholderTextColor="#666"
              value={profile.persona_description}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, persona_description: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tone of Voice</Text>
            <Text style={styles.description}>
              How do you want to sound in your content?
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="E.g., Professional but friendly, using simple language..."
              placeholderTextColor="#666"
              value={profile.tone_of_voice}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, tone_of_voice: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Audience</Text>
            <Text style={styles.description}>
              Who are you creating content for?
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="E.g., Young professionals interested in personal development..."
              placeholderTextColor="#666"
              value={profile.audience}
              onChangeText={(text) =>
                setProfile((prev) => ({ ...prev, audience: text }))
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Style Notes</Text>
            <Text style={styles.description}>
              Any specific preferences or guidelines?
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="E.g., Prefer using real-world examples..."
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
        {!hasVoiceClone && (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={() => router.push('/(onboarding)/welcome')}
          >
            <Mic size={24} color="#fff" />
            <Text style={styles.voiceButtonText}>Record Voice</Text>
          </TouchableOpacity>
        )}

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
              <Text style={styles.saveButtonText}>Continue</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#888',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  footer: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    flexDirection: 'row',
    gap: 12,
  },
  voiceButton: {
    flex: 1,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
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
