import React, { useState, useEffect } from 'react';
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
import { EditorialProfile } from './hooks/useEditorialProfile';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

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
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentFieldConfig?.title}</Text>
              <Text style={styles.fieldDescription}>
                {currentFieldConfig?.description}
              </Text>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                style={styles.modalTextInput}
                multiline
                numberOfLines={currentFieldConfig?.numberOfLines || 6}
                placeholder={currentFieldConfig?.placeholder}
                placeholderTextColor={SHARED_STYLE_COLORS.textMuted}
                value={editingValue}
                onChangeText={setEditingValue}
                maxLength={currentFieldConfig?.maxLength}
                autoFocus
                textAlignVertical="top"
              />

              <View style={styles.voiceContainer}>
                <VoiceDictation
                  currentValue={editingValue}
                  onTranscriptChange={setEditingValue}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
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
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.text} />
                    <Text
                      style={[
                        styles.modalButtonText,
                        styles.modalButtonSaveText,
                        styles.loadingText,
                      ]}
                    >
                      Sauvegarde...
                    </Text>
                  </View>
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 18,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: SHARED_STYLE_COLORS.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 6,
  },
  fieldDescription: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textMuted,
    lineHeight: 20,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTextInput: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 12,
    padding: 16,
    color: SHARED_STYLE_COLORS.text,
    fontSize: 15,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.backgroundTertiary,
    lineHeight: 22,
    minHeight: 120,
  },
  voiceContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.backgroundTertiary,
  },
  modalButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonSave: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderColor: SHARED_STYLE_COLORS.primary,
  },
  modalButtonSaveText: {
    color: SHARED_STYLE_COLORS.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 15,
  },
});
