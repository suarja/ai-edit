import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/components/hooks/useGetUser';

export type EditorialProfile = {
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

export const useEditorialProfile = () => {
  const [profile, setProfile] = useState<EditorialProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<
    keyof EditorialProfile | null
  >(null);

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const user = await fetchUser();
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
        const profileData = {
          id: data.id,
          persona_description: data.persona_description || '',
          tone_of_voice: data.tone_of_voice || '',
          audience: data.audience || '',
          style_notes: data.style_notes || '',
        };
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Erreur', 'Échec du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: EditorialProfile) => {
    try {
      setSaving(true);

      const user = await fetchUser();
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

      setProfile(updatedProfile);
      setEditingField(null);

      Alert.alert('Succès', 'Profil éditorial sauvegardé avec succès !');
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Erreur', 'Échec de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof EditorialProfile, value: string) => {
    const updatedProfile = { ...profile, [field]: value };
    setProfile(updatedProfile);
  };

  const openEditModal = (field: keyof EditorialProfile) => {
    setEditingField(field);
  };

  const closeEditModal = () => {
    setEditingField(null);
  };

  const getCompletionPercentage = () => {
    const fields = [
      'persona_description',
      'tone_of_voice',
      'audience',
      'style_notes',
    ] as const;
    const filledFields = fields.filter(
      (field) => profile[field] && profile[field].trim().length > 0
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const hasProfile =
    profile.persona_description ||
    profile.tone_of_voice ||
    profile.audience ||
    profile.style_notes;

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    // State
    profile,
    loading,
    saving,
    editingField,
    hasProfile,

    // Computed values
    completionPercentage: getCompletionPercentage(),

    // Actions
    fetchProfile,
    saveProfile,
    updateField,
    openEditModal,
    closeEditModal,
  };
};
