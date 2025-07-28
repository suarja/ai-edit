import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  MessageSquare,
  Users,
  FileText,
  Edit3,
} from 'lucide-react-native';
import SettingsHeader from '@/components/SettingsHeader';
import EditorialProfileForm from '@/components/EditorialProfileForm';
import {
  useEditorialProfile,
  EditorialProfile,
} from '@/components/hooks/useEditorialProfile';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

const FIELD_CONFIGS = [
  {
    key: 'persona_description' as keyof EditorialProfile,
    title: 'Description de la Persona',
    icon: User,
    description: 'Décrivez votre personnalité de créateur et votre expertise',
  },
  {
    key: 'tone_of_voice' as keyof EditorialProfile,
    title: 'Ton de Voix',
    icon: MessageSquare,
    description: 'Comment vous exprimez-vous dans vos contenus',
  },
  {
    key: 'audience' as keyof EditorialProfile,
    title: 'Public Cible',
    icon: Users,
    description: 'Qui sont vos spectateurs idéaux',
  },
  {
    key: 'style_notes' as keyof EditorialProfile,
    title: 'Notes de Style',
    icon: FileText,
    description: 'Préférences et directives spécifiques',
  },
];

export default function EditorialScreen() {
  const {
    profile,
    loading,
    saving,
    editingField,
    completionPercentage,
    openEditModal,
    closeEditModal,
    saveProfile,
  } = useEditorialProfile();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <SettingsHeader title="Profil Éditorial" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SHARED_STYLE_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Profil Éditorial" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions Card */}
        <View style={styles.compactCard}>
          <Text style={styles.compactTitle}>
            Personnalisez votre style éditorial
          </Text>
          <Text style={styles.compactText}>
            Définissez votre persona, ton de voix, audience cible et notes de
            style pour personnaliser automatiquement le contenu de vos vidéos
            générées.
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.compactCard}>
          <View style={styles.progressRow}>
            <View style={styles.progressContainer}>
              <View style={styles.completionBar}>
                <View
                  style={[
                    styles.completionFill,
                    { width: `${completionPercentage}%` },
                    completionPercentage === 100 &&
                      styles.completionFillComplete,
                  ]}
                />
              </View>
            </View>
            <Text style={styles.completionText}>{completionPercentage}%</Text>
          </View>
        </View>

        {/* Profile Fields */}
        {FIELD_CONFIGS.map((config) => {
          const Icon = config.icon;
          const value = profile[config.key];
          const isFilled = value && value.trim().length > 0;
          const isSaving = saving && editingField === config.key;

          return (
            <TouchableOpacity
              key={config.key}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => openEditModal(config.key)}
              disabled={isSaving}
            >
              <View style={styles.cardHeader}>
                <View style={styles.fieldIconContainer}>
                  <View
                    style={[
                      styles.fieldIcon,
                      isFilled && styles.fieldIconFilled,
                    ]}
                  >
                    <Icon size={20} color={isFilled ? SHARED_STYLE_COLORS.text : SHARED_STYLE_COLORS.textMuted} />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{config.title}</Text>
                  <Text style={styles.cardDescription}>
                    {config.description}
                  </Text>
                  <Text style={styles.cardValue} numberOfLines={4}>
                    {value ? (
                      value
                    ) : (
                      <Text style={{ color: SHARED_STYLE_COLORS.textMuted, fontStyle: 'italic' }}>
                        Cliquez pour ajouter...
                      </Text>
                    )}
                  </Text>
                </View>
                <View style={styles.cardAction}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.primary} />
                  ) : (
                    <Edit3 size={16} color={SHARED_STYLE_COLORS.textMuted} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <EditorialProfileForm
        profile={profile}
        onSave={saveProfile}
        onCancel={closeEditModal}
        saving={saving}
        editingField={editingField}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  compactCard: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 2,
  },
  compactText: {
    fontSize: 13,
    color: SHARED_STYLE_COLORS.textMuted,
    lineHeight: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    marginRight: 10,
  },
  completionBar: {
    height: 8,
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: SHARED_STYLE_COLORS.primary,
    borderRadius: 4,
  },
  completionFillComplete: {
    backgroundColor: SHARED_STYLE_COLORS.success,
  },
  completionText: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textMuted,
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fieldIconContainer: {
    flexShrink: 0,
  },
  fieldIcon: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldIconFilled: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: SHARED_STYLE_COLORS.textMuted,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textSecondary,
    lineHeight: 20,
  },
  cardAction: {
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    color: SHARED_STYLE_COLORS.textMuted,
    lineHeight: 22,
  },
});
