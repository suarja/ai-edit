import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Edit,
  Save,
  User,
  MessageSquare,
  Users,
  FileText,
} from 'lucide-react-native';
import SettingsHeader from '@/components/SettingsHeader';
import EditorialProfileForm from '@/components/EditorialProfileForm';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useGetUser } from '@/lib/hooks/useGetUser';

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
  const [originalProfile, setOriginalProfile] =
    useState<EditorialProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { client: supabase } = useClerkSupabaseClient();
  const { fetchUser } = useGetUser();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
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
        setOriginalProfile(profileData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Erreur', 'Échec du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const user = await fetchUser();
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
      };

      const { error } = originalProfile.id
        ? await supabase
            .from('editorial_profiles')
            .update(profileData)
            .eq('id', originalProfile.id)
        : await supabase.from('editorial_profiles').insert(profileData);

      if (error) throw error;

      setOriginalProfile(profile);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil éditorial sauvegardé avec succès !');
    } catch (err) {
      console.error('Error saving profile:', err);
      Alert.alert('Erreur', 'Échec de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const toggleEdit = () => {
    if (!isEditing) {
      setOriginalProfile(profile);
    }
    setIsEditing(!isEditing);
  };

  const handleFormChange = (updatedProfile: EditorialProfile) => {
    setProfile(updatedProfile);
  };

  // Check if profile has content
  const hasProfile =
    profile.persona_description ||
    profile.tone_of_voice ||
    profile.audience ||
    profile.style_notes;

  // Check if profile has changes from original
  const hasChanges =
    isEditing &&
    (profile.persona_description !== originalProfile.persona_description ||
      profile.tone_of_voice !== originalProfile.tone_of_voice ||
      profile.audience !== originalProfile.audience ||
      profile.style_notes !== originalProfile.style_notes);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SettingsHeader title="Profil Éditorial" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SettingsHeader
          title="Modifier le Profil"
          rightButton={{
            icon: <Save size={20} color="#fff" />,
            onPress: handleSave,
            disabled: !hasChanges || saving,
            loading: saving,
          }}
        />
        <EditorialProfileForm
          profile={profile}
          onSave={handleFormChange}
          onCancel={handleCancel}
          saving={saving}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader
        title="Profil Éditorial"
        rightButton={{
          icon: <Edit size={20} color="#fff" />,
          onPress: toggleEdit,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!hasProfile ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <User size={48} color="#666" />
            </View>
            <Text style={styles.emptyTitle}>Aucun profil éditorial</Text>
            <Text style={styles.emptyDescription}>
              Créez votre profil éditorial pour personnaliser le style et le ton
              de vos vidéos générées.
            </Text>
          </View>
        ) : (
          <View style={styles.profileContent}>
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
                  <MessageSquare size={20} color="#007AFF" />
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
                <Text style={styles.sectionContent}>{profile.audience}</Text>
              </View>
            )}

            {profile.style_notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <FileText size={20} color="#007AFF" />
                  <Text style={styles.sectionTitle}>Notes de Style</Text>
                </View>
                <Text style={styles.sectionContent}>{profile.style_notes}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  profileContent: {
    gap: 20,
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
});
