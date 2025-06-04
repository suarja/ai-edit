import { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditorialProfileForm from '@/components/EditorialProfileForm';

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

export default function EditorialScreen() {
  const [profile, setProfile] = useState<EditorialProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
          id: data.id,
          persona_description: data.persona_description || '',
          tone_of_voice: data.tone_of_voice || '',
          audience: data.audience || '',
          style_notes: data.style_notes || '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Erreur', 'Échec du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedProfile: EditorialProfile) => {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/(auth)/sign-in');
        return;
      }

      const profileData = {
        user_id: user.id,
        persona_description: updatedProfile.persona_description,
        tone_of_voice: updatedProfile.tone_of_voice,
        audience: updatedProfile.audience,
        style_notes: updatedProfile.style_notes,
      };

      const { error } = profile.id
        ? await supabase
            .from('editorial_profiles')
            .update(profileData)
            .eq('id', profile.id)
        : await supabase.from('editorial_profiles').insert(profileData);

      if (error) throw error;

      Alert.alert('Succès', 'Profil éditorial sauvegardé avec succès !', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Erreur', 'Échec de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#000' }}
        edges={['top']}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <EditorialProfileForm
        profile={profile}
        onSave={handleSave}
        onCancel={handleCancel}
        saving={saving}
      />
    </SafeAreaView>
  );
}
