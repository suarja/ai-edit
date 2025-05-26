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
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Save, CircleAlert as AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type EditorialProfile = {
  id: string;
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
  content_examples: string[];
};

export default function EditorialScreen() {
  const [profile, setProfile] = useState<EditorialProfile>({
    id: '',
    persona_description: '',
    tone_of_voice: '',
    audience: '',
    style_notes: '',
    content_examples: [''],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      const { data, error } = await supabase
        .from('editorial_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          ...data,
          content_examples: data.content_examples as string[] || [''],
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
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      const profileData = {
        user_id: user.id,
        persona_description: profile.persona_description,
        tone_of_voice: profile.tone_of_voice,
        audience: profile.audience,
        style_notes: profile.style_notes,
        content_examples: profile.content_examples.filter(ex => ex.trim() !== ''),
      };

      const { error } = profile.id
        ? await supabase
            .from('editorial_profiles')
            .update(profileData)
            .eq('id', profile.id)
        : await supabase
            .from('editorial_profiles')
            .insert(profileData);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addContentExample = () => {
    setProfile(prev => ({
      ...prev,
      content_examples: [...prev.content_examples, ''],
    }));
  };

  const updateContentExample = (index: number, value: string) => {
    const newExamples = [...profile.content_examples];
    newExamples[index] = value;
    setProfile(prev => ({
      ...prev,
      content_examples: newExamples,
    }));
  };

  const removeContentExample = (index: number) => {
    setProfile(prev => ({
      ...prev,
      content_examples: prev.content_examples.filter((_, i) => i !== index),
    }));
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
      </View>
      
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>Profile saved successfully!</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Persona Description</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Describe your content creator persona..."
            placeholderTextColor="#666"
            value={profile.persona_description}
            onChangeText={(text) => setProfile(prev => ({ ...prev, persona_description: text }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tone of Voice</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Describe your preferred tone of voice..."
            placeholderTextColor="#666"
            value={profile.tone_of_voice}
            onChangeText={(text) => setProfile(prev => ({ ...prev, tone_of_voice: text }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Audience</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Describe your target audience..."
            placeholderTextColor="#666"
            value={profile.audience}
            onChangeText={(text) => setProfile(prev => ({ ...prev, audience: text }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Style Notes</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Add any specific style preferences or guidelines..."
            placeholderTextColor="#666"
            value={profile.style_notes}
            onChangeText={(text) => setProfile(prev => ({ ...prev, style_notes: text }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Content Examples</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addContentExample}
            >
              <Text style={styles.addButtonText}>Add Example</Text>
            </TouchableOpacity>
          </View>
          
          {profile.content_examples.map((example, index) => (
            <View key={index} style={styles.exampleContainer}>
              <TextInput
                style={styles.exampleInput}
                multiline
                numberOfLines={3}
                placeholder={`Example ${index + 1}`}
                placeholderTextColor="#666"
                value={example}
                onChangeText={(text) => updateContentExample(index, text)}
              />
              {profile.content_examples.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeContentExample(index)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
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
              <Text style={styles.saveButtonText}>Save Profile</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
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
  successContainer: {
    backgroundColor: '#042f2e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  exampleContainer: {
    marginBottom: 12,
  },
  exampleInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  removeButton: {
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#1a1a1a',
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