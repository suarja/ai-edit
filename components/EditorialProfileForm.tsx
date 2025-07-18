import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView as RNScrollView,
  ActivityIndicator,
} from 'react-native';
import { User, MessageCircle, Users, FileText } from 'lucide-react-native';
import VoiceDictation from './VoiceDictation';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';
import { EditorialProfile } from './hooks/useEditorialProfile';

type EditorialProfileFormProps = {
  profile: EditorialProfile;
  onSave: (profile: EditorialProfile) => void;
  onCancel: () => void;
  saving?: boolean;
  editingField?: keyof EditorialProfile | null;
};

const FIELD_CONFIGS = [
  {
    key: 'persona_description' as keyof EditorialProfile,
    title: 'Description du Persona',
    icon: User,
    placeholder:
      "Ex: Créateur de contenu tech passionné par l'innovation et la productivité...",
    description: 'Décrivez votre personnalité de créateur et votre expertise',
    maxLength: 1000,
    numberOfLines: 6,
    tips: [
      "Mentionnez votre domaine d'expertise",
      'Décrivez votre approche unique',
      'Incluez vos valeurs principales',
    ],
  },
  {
    key: 'tone_of_voice' as keyof EditorialProfile,
    title: 'Ton de Voix',
    icon: MessageCircle,
    placeholder:
      'Ex: Conversationnel et amical, tout en restant professionnel et informatif...',
    description: 'Comment vous exprimez-vous dans vos contenus',
    maxLength: 500,
    numberOfLines: 6,
    tips: [
      'Formel ou décontracté ?',
      'Humoristique ou sérieux ?',
      'Technique ou accessible ?',
    ],
  },
  {
    key: 'audience' as keyof EditorialProfile,
    title: 'Public Cible',
    icon: Users,
    placeholder:
      'Ex: Professionnels du marketing digital, entrepreneurs, créateurs de contenu...',
    description: 'Qui sont vos spectateurs idéaux',
    maxLength: 500,
    numberOfLines: 6,
    tips: ['Âge et profession', "Niveau d'expertise", "Centres d'intérêt"],
  },
  {
    key: 'style_notes' as keyof EditorialProfile,
    title: 'Notes de Style',
    icon: FileText,
    placeholder:
      'Ex: Utilisez des exemples concrets, évitez le jargon technique, incluez des call-to-action...',
    description: 'Préférences et directives spécifiques',
    maxLength: 1000,
    numberOfLines: 6,
    tips: ['Structure préférée', 'Éléments à éviter', 'Mots-clés importants'],
  },
];

export default function EditorialProfileForm({
  profile,
  onSave,
  onCancel,
  saving = false,
  editingField: initialEditingField,
}: EditorialProfileFormProps) {
  const [formData, setFormData] = useState<EditorialProfile>(profile);
  const [editingField, setEditingField] = useState<
    keyof EditorialProfile | null
  >(initialEditingField || null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [modalSaving, setModalSaving] = useState(false);

  // Handle external editingField changes
  useEffect(() => {
    if (initialEditingField) {
      setEditingField(initialEditingField);
      setEditingValue(formData[initialEditingField] || '');
    }
  }, [initialEditingField, formData]);

  // Update formData when profile changes
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Ouvre le modal pour éditer un champ
  const openEditModal = (key: keyof EditorialProfile) => {
    setEditingField(key);
    setEditingValue(formData[key] || '');
  };

  // Ferme le modal sans sauvegarder
  const closeEditModal = () => {
    setEditingField(null);
    setEditingValue('');
    onCancel();
  };

  // Sauvegarde la modification du champ
  const saveEditModal = async () => {
    if (editingField) {
      setModalSaving(true);
      try {
        const updatedProfile = { ...formData, [editingField]: editingValue };
        setFormData(updatedProfile);
        await onSave(updatedProfile);
        setEditingField(null);
        setEditingValue('');
      } finally {
        setModalSaving(false);
      }
    }
  };

  // Si aucun champ n'est en cours d'édition, ne rien afficher
  if (!editingField) {
    return null;
  }

  const currentFieldConfig = FIELD_CONFIGS.find((f) => f.key === editingField);

  return (
    <Modal
      visible={editingField !== null}
      animationType="slide"
      transparent
      onRequestClose={closeEditModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <RNScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalTitle}>{currentFieldConfig?.title}</Text>
            <Text style={styles.fieldDescription}>
              {currentFieldConfig?.description}
            </Text>
            <TextInput
              style={styles.modalTextInput}
              multiline
              numberOfLines={currentFieldConfig?.numberOfLines || 3}
              placeholder={currentFieldConfig?.placeholder}
              placeholderTextColor="#666"
              value={editingValue}
              onChangeText={setEditingValue}
              maxLength={currentFieldConfig?.maxLength}
              autoFocus
            />
            <View style={{ alignItems: 'flex-end', marginVertical: 8 }}>
              <VoiceDictation
                currentValue={editingValue}
                onTranscriptChange={setEditingValue}
              />
            </View>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={closeEditModal}
                disabled={modalSaving}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={saveEditModal}
                disabled={modalSaving}
              >
                {modalSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text
                    style={[styles.modalButtonText, styles.modalButtonSaveText]}
                  >
                    Sauvegarder
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </RNScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#181818',
    borderRadius: 18,
    padding: 24,
    width: '90%',
    maxWidth: 420,
    minHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  modalTextInput: {
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 8,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonSave: {
    backgroundColor: SHARED_STYLE_COLORS.secondary,
  },
  modalButtonSaveText: {
    color: '#fff',
  },
});
