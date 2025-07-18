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
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Profil Éditorial" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions Card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            Personnalisez votre style éditorial
          </Text>
          <Text style={styles.instructionText}>
            Définissez votre persona, ton de voix, audience cible et notes de
            style pour personnaliser automatiquement le contenu de vos vidéos
            générées.
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.card}>
          <View style={styles.progressContainer}>
            <View style={styles.completionBar}>
              <View
                style={[
                  styles.completionFill,
                  { width: `${completionPercentage}%` },
                  completionPercentage === 100 && styles.completionFillComplete,
                ]}
              />
            </View>
            <Text style={styles.completionText}>
              {completionPercentage}% complété
            </Text>
          </View>
        </View>

        {/* Profile Fields */}
        {FIELD_CONFIGS.map((config) => {
          const Icon = config.icon;
          const value = profile[config.key];
          const isFilled = value && value.trim().length > 0;

          return (
            <TouchableOpacity
              key={config.key}
              style={styles.card}
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
                    <Icon size={20} color={isFilled ? '#fff' : '#666'} />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{config.title}</Text>
                  <Text style={styles.cardDescription}>
                    {config.description}
                  </Text>
                  <Text style={styles.cardValue} numberOfLines={2}>
                    {value ? (
                      value
                    ) : (
                      <Text style={{ color: '#666', fontStyle: 'italic' }}>
                        Cliquez pour ajouter...
                      </Text>
                    )}
                  </Text>
                </View>
                <View style={styles.cardAction}>
                  <Edit3 size={16} color="#666" />
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
    backgroundColor: '#000',
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
    backgroundColor: '#18181b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#23232a',
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
    backgroundColor: '#23232a',
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldIconFilled: {
    backgroundColor: '#007AFF',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  cardAction: {
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 15,
    color: '#888',
    lineHeight: 22,
  },
  progressContainer: {
    gap: 8,
  },
  completionBar: {
    height: 8,
    backgroundColor: '#23232a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  completionFillComplete: {
    backgroundColor: '#10b981',
  },
  completionText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
});
