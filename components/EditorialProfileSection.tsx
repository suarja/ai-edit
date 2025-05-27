import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { CreditCard as Edit3 } from 'lucide-react-native';

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
  const updateCustomField = (
    field: keyof CustomEditorialProfile,
    value: string
  ) => {
    onUpdateCustomProfile({
      ...customEditorialProfile,
      [field]: value,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Profil Éditorial</Text>
        <Switch
          trackColor={{ false: '#333', true: '#007AFF' }}
          thumbColor="#fff"
          value={useEditorialProfile}
          onValueChange={onToggleUseProfile}
        />
      </View>

      {useEditorialProfile ? (
        editorialProfile ? (
          <View style={styles.editorialProfile}>
            <Text style={styles.editorialText}>
              {editorialProfile.persona_description}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/(tabs)/editorial')}
            >
              <Edit3 size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Modifier le Profil</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editorialProfile}>
            <Text style={styles.editorialText}>
              {defaultEditorialProfile.persona_description}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/(tabs)/editorial')}
            >
              <Edit3 size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Personnaliser le Profil</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.customProfile}>
          <TextInput
            style={styles.customInput}
            multiline
            numberOfLines={3}
            placeholder="Description du persona..."
            placeholderTextColor="#666"
            value={customEditorialProfile.persona_description}
            onChangeText={(text) =>
              updateCustomField('persona_description', text)
            }
          />
          <TextInput
            style={styles.customInput}
            multiline
            numberOfLines={2}
            placeholder="Ton de voix..."
            placeholderTextColor="#666"
            value={customEditorialProfile.tone_of_voice}
            onChangeText={(text) => updateCustomField('tone_of_voice', text)}
          />
          <TextInput
            style={styles.customInput}
            multiline
            numberOfLines={2}
            placeholder="Public cible..."
            placeholderTextColor="#666"
            value={customEditorialProfile.audience}
            onChangeText={(text) => updateCustomField('audience', text)}
          />
          <TextInput
            style={styles.customInput}
            multiline
            numberOfLines={3}
            placeholder="Notes de style..."
            placeholderTextColor="#666"
            value={customEditorialProfile.style_notes}
            onChangeText={(text) => updateCustomField('style_notes', text)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  editorialProfile: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  editorialText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  customProfile: {
    gap: 12,
  },
  customInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    textAlignVertical: 'top',
  },
});
