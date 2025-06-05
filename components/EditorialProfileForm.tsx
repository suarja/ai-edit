import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import {
  User,
  MessageCircle,
  Users,
  FileText,
  Lightbulb,
} from 'lucide-react-native';

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
    maxLength: 500,
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
    maxLength: 300,
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
    maxLength: 300,
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
    maxLength: 400,
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
  const [activeField, setActiveField] = useState<string | null>(null);

  // Update parent component whenever form data changes
  useEffect(() => {
    onSave(formData);
  }, [formData, onSave]);

  const updateField = (key: keyof EditorialProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const getCompletionPercentage = () => {
    const fields = FIELD_CONFIGS.map((config) => formData[config.key]);
    const filledFields = fields.filter(
      (field) => field && field.trim().length > 0
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = getCompletionPercentage();

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.completionContainer}>
          <View style={styles.completionBar}>
            <View
              style={[
                styles.completionFill,
                { width: `${completion}%` },
                completion === 100 && styles.completionFillComplete,
              ]}
            />
          </View>
          <Text style={styles.completionText}>{completion}% complété</Text>
        </View>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {FIELD_CONFIGS.map((config, index) => {
          const Icon = config.icon;
          const value = formData[config.key];
          const isActive = activeField === config.key;
          const isFilled = value && value.trim().length > 0;

          return (
            <View key={config.key} style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                <View style={styles.fieldTitleContainer}>
                  <View
                    style={[
                      styles.fieldIcon,
                      isFilled && styles.fieldIconFilled,
                    ]}
                  >
                    <Icon size={16} color={isFilled ? '#fff' : '#666'} />
                  </View>
                  <View style={styles.fieldTitleContent}>
                    <Text style={styles.fieldTitle}>{config.title}</Text>
                    <Text style={styles.fieldDescription}>
                      {config.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.fieldMeta}>
                  <Text style={styles.charCount}>
                    {value?.length || 0}/{config.maxLength}
                  </Text>
                  <View
                    style={[
                      styles.fieldStatus,
                      isFilled && styles.fieldStatusFilled,
                    ]}
                  />
                </View>
              </View>

              <TextInput
                style={[styles.textInput, isActive && styles.textInputActive]}
                multiline
                numberOfLines={config.numberOfLines}
                placeholder={config.placeholder}
                placeholderTextColor="#666"
                value={value}
                onChangeText={(text) => updateField(config.key, text)}
                onFocus={() => setActiveField(config.key)}
                onBlur={() => setActiveField(null)}
                maxLength={config.maxLength}
              />

              {isActive && (
                <View style={styles.tipsContainer}>
                  <View style={styles.tipsHeader}>
                    <Lightbulb size={14} color="#007AFF" />
                    <Text style={styles.tipsTitle}>Conseils</Text>
                  </View>
                  {config.tips.map((tip, tipIndex) => (
                    <Text key={tipIndex} style={styles.tipText}>
                      • {tip}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
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
    padding: 20,
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
    alignItems: 'flex-end',
    gap: 6,
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
});
