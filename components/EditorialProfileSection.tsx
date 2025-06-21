import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Settings } from 'lucide-react-native';
import EditorialProfileCard from './EditorialProfileCard';
import EditorialProfileForm from './EditorialProfileForm';

type EditorialProfile = {
  id: string;
  persona_description: string | null;
  tone_of_voice: string | null;
  audience: string | null;
  style_notes: string | null;
};

type CustomEditorialProfile = {
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
};

type EditorialProfileSectionProps = {
  editorialProfile: EditorialProfile | null;
  useEditorialProfile: boolean;
  customEditorialProfile: CustomEditorialProfile;
  defaultEditorialProfile: CustomEditorialProfile;
  onToggleUseProfile: (value: boolean) => void;
  onUpdateCustomProfile: (profile: CustomEditorialProfile) => void;
};

export default function EditorialProfileSection({
  editorialProfile,
  useEditorialProfile,
  customEditorialProfile,
  defaultEditorialProfile,
  onToggleUseProfile,
  onUpdateCustomProfile,
}: EditorialProfileSectionProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleEditProfile = () => {
    router.push('/settings');
  };

  const handleEditCustomProfile = () => {
    setShowCustomForm(true);
  };

  const handleSaveCustomProfile = (profile: CustomEditorialProfile) => {
    onUpdateCustomProfile(profile);
    setShowCustomForm(false);
  };

  const handleCancelCustomProfile = () => {
    setShowCustomForm(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Profil Éditorial</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowCustomForm(true)}
          >
            <Settings size={16} color="#007AFF" />
          </TouchableOpacity>
          <Switch
            trackColor={{ false: '#333', true: '#007AFF' }}
            thumbColor="#fff"
            value={useEditorialProfile}
            onValueChange={onToggleUseProfile}
          />
        </View>
      </View>

      <Text style={styles.sectionDescription}>
        {useEditorialProfile
          ? 'Utilisez votre profil éditorial sauvegardé'
          : 'Personnalisez le profil pour cette génération'}
      </Text>

      {useEditorialProfile ? (
        <EditorialProfileCard
          profile={editorialProfile}
          isSelected={true}
          onEdit={handleEditProfile}
          showActions={true}
          compact={false}
        />
      ) : (
        <EditorialProfileCard
          profile={{
            id: 'custom',
            persona_description: customEditorialProfile.persona_description,
            tone_of_voice: customEditorialProfile.tone_of_voice,
            audience: customEditorialProfile.audience,
            style_notes: customEditorialProfile.style_notes,
          }}
          isSelected={true}
          onEdit={handleEditCustomProfile}
          showActions={true}
          compact={false}
        />
      )}

      <Modal
        visible={showCustomForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <EditorialProfileForm
          profile={{
            id: 'custom',
            persona_description: customEditorialProfile.persona_description,
            tone_of_voice: customEditorialProfile.tone_of_voice,
            audience: customEditorialProfile.audience,
            style_notes: customEditorialProfile.style_notes,
          }}
          onSave={handleSaveCustomProfile}
          onCancel={handleCancelCustomProfile}
          saving={false}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionDescription: {
    fontSize: 15,
    color: '#888',
    marginBottom: 16,
    lineHeight: 22,
  },
});
