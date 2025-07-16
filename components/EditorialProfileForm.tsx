import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView as RNScrollView,
} from 'react-native';
import {
  User,
  MessageCircle,
  Users,
  FileText,
  Lightbulb,
} from 'lucide-react-native';
import VoiceDictation from './VoiceDictation';

type EditorialProfile = {
  id: string;
  persona_description: string;
  tone_of_voice: string;
  audience: string;
  style_notes: string;
};

type EditorialProfileFormProps = {
  profile: EditorialProfile;
  onSave: (profile: EditorialProfile) => void;
  onCancel: () => void;
  saving?: boolean;
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
    numberOfLines: 4,
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
    numberOfLines: 3,
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
    numberOfLines: 3,
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
    numberOfLines: 4,
    tips: ['Structure préférée', 'Éléments à éviter', 'Mots-clés importants'],
  },
];

export default function EditorialProfileForm({
  profile,
  onSave,
  onCancel,
  saving = false,
}: EditorialProfileFormProps) {
  const [formData, setFormData] = useState<EditorialProfile>(profile);
  const [editingField, setEditingField] = useState<
    keyof EditorialProfile | null
  >(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [activeField, setActiveField] = useState<string | null>(null);
  // Ajout : champ actuellement en dictée
  const [activeDictationField, setActiveDictationField] = useState<
    string | null
  >(null);

  // Add ref for ScrollView to enable programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});

  // Update parent component whenever form data changes
  useEffect(() => {
    onSave(formData);
  }, [formData, onSave]);

  const updateField = (key: keyof EditorialProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Ajout : callback pour VoiceDictation
  const handleDictationTranscript = (
    key: keyof EditorialProfile,
    text: string
  ) => {
    // N'appliquer la transcription que si le champ est actif
    if (activeDictationField === key) {
      updateField(key, text);
    }
  };

  // Ajout : callback pour fin de dictée
  const handleDictationEnd = (key: keyof EditorialProfile) => {
    if (activeDictationField === key) {
      setActiveDictationField(null);
    }
  };

  const handleInputFocus = (key: string) => {
    setActiveField(key);

    // Scroll to focused input with a small delay to ensure keyboard is open
    setTimeout(() => {
      const inputRef = inputRefs.current[key];
      if (inputRef && scrollViewRef.current) {
        inputRef.measureLayout(
          scrollViewRef.current as any,
          (x, y, width, height) => {
            // Scroll to show the input with some extra space above
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, y - 100),
              animated: true,
            });
          },
          () => {
            // Fallback: scroll to end if measure fails
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        );
      }
    }, 300);
  };

  const getCompletionPercentage = () => {
    const fields = FIELD_CONFIGS.map((config) => formData[config.key]);
    const filledFields = fields.filter(
      (field) => field && field.trim().length > 0
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = getCompletionPercentage();

  // Ouvre le modal pour éditer un champ
  const openEditModal = (key: keyof EditorialProfile) => {
    setEditingField(key);
    setEditingValue(formData[key] || '');
  };

  // Ferme le modal sans sauvegarder
  const closeEditModal = () => {
    setEditingField(null);
    setEditingValue('');
  };

  // Sauvegarde la modification du champ
  const saveEditModal = () => {
    if (editingField) {
      setFormData((prev) => ({ ...prev, [editingField]: editingValue }));
      setEditingField(null);
      setEditingValue('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.completionContainer}>
          <View style={styles.completionBar}>
            <View
              style={[
                styles.completionFill,
                { width: `${getCompletionPercentage()}%` },
                getCompletionPercentage() === 100 &&
                  styles.completionFillComplete,
              ]}
            />
          </View>
          <Text style={styles.completionText}>
            {getCompletionPercentage()}% complété
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {FIELD_CONFIGS.map((config) => {
          const Icon = config.icon;
          const value = formData[config.key];
          const isFilled = value && value.trim().length > 0;

          return (
            <TouchableOpacity
              key={config.key}
              style={styles.cardContainer}
              activeOpacity={0.8}
              onPress={() => openEditModal(config.key)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.fieldIconContainer}>
                  <View
                    style={[
                      styles.fieldIcon,
                      isFilled && styles.fieldIconFilled,
                    ]}
                  >
                    <Icon size={16} color={isFilled ? '#fff' : '#666'} />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.fieldTitle}>{config.title}</Text>
                  <Text style={styles.cardValue} numberOfLines={2}>
                    {value ? (
                      value
                    ) : (
                      <Text style={{ color: '#666' }}>
                        {config.placeholder}
                      </Text>
                    )}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal d'édition d'un champ */}
      <Modal
        visible={editingField !== null}
        animationType="slide"
        transparent
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {editingField && (
              <RNScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>
                  {FIELD_CONFIGS.find((f) => f.key === editingField)?.title}
                </Text>
                <Text style={styles.fieldDescription}>
                  {
                    FIELD_CONFIGS.find((f) => f.key === editingField)
                      ?.description
                  }
                </Text>
                <TextInput
                  style={styles.modalTextInput}
                  multiline
                  numberOfLines={
                    FIELD_CONFIGS.find((f) => f.key === editingField)
                      ?.numberOfLines || 3
                  }
                  placeholder={
                    FIELD_CONFIGS.find((f) => f.key === editingField)
                      ?.placeholder
                  }
                  placeholderTextColor="#666"
                  value={editingValue}
                  onChangeText={setEditingValue}
                  maxLength={
                    FIELD_CONFIGS.find((f) => f.key === editingField)?.maxLength
                  }
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
                  >
                    <Text style={styles.modalButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSave]}
                    onPress={saveEditModal}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        styles.modalButtonSaveText,
                      ]}
                    >
                      Sauvegarder
                    </Text>
                  </TouchableOpacity>
                </View>
              </RNScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  completionContainer: {
    gap: 6,
  },
  completionBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  completionFillComplete: {
    backgroundColor: '#10b981',
  },
  completionText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40, // Extra padding at bottom to ensure last field is accessible
  },
  fieldContainer: {
    marginBottom: 32,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fieldTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  fieldIcon: {
    backgroundColor: '#333',
    borderRadius: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldIconFilled: {
    backgroundColor: '#007AFF',
  },
  fieldTitleContent: {
    flex: 1,
  },
  fieldTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  fieldDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  fieldMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  fieldStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
  },
  fieldStatusFilled: {
    backgroundColor: '#10b981',
  },

  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333',
    lineHeight: 22,
  },
  textInputActive: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  tipsContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  tipText: {
    fontSize: 12,
    color: '#007AFF',
    lineHeight: 18,
    marginBottom: 2,
  },
  cardContainer: {
    backgroundColor: '#181818',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fieldIconContainer: {
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardValue: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
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
    backgroundColor: '#10b981',
  },
  modalButtonSaveText: {
    color: '#fff',
  },
});
