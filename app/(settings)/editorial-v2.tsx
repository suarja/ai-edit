/**
 * 🎨 Editorial Screen v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 3:
 * ❌ Avant: 20+ couleurs hardcodées pour écran profil éditorial
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

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
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

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

export default function EditorialScreenV2() {
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
          <ActivityIndicator size="large" color={COLORS.interactive.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SettingsHeader title="Profil Éditorial" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ✅ Instructions Card */}
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

        {/* ✅ Progress Bar */}
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

        {/* ✅ Profile Fields */}
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
                    <Icon 
                      size={20} 
                      color={isFilled ? COLORS.text.primary : COLORS.text.disabled} 
                    />
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
                      <Text style={styles.cardValueEmpty}>
                        Cliquez pour ajouter...
                      </Text>
                    )}
                  </Text>
                </View>
                <View style={styles.cardAction}>
                  {isSaving ? (
                    <ActivityIndicator size="small" color={COLORS.interactive.primary} />
                  ) : (
                    <Edit3 size={16} color={COLORS.text.disabled} />
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
  // ✅ Container principal
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary, // #000000
  },
  
  // ✅ Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  // ✅ Content
  content: {
    flex: 1,
    padding: 16,
  },
  
  // ✅ Cards avec design système cohérent
  card: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a (plus cohérent que #18181b)
    borderRadius: 16, // Plus moderne (18 → 16)
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border, // rgba(255, 255, 255, 0.1) (plus cohérent que #23232a)
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  compactCard: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.surface.border,
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // ✅ Typography cohérente
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary, // #FFFFFF
    marginBottom: 2,
  },
  
  compactText: {
    fontSize: 13,
    color: COLORS.text.tertiary, // #B0B0B0 (plus lisible que #888)
    lineHeight: 20,
  },
  
  // ✅ Progress bar
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  progressContainer: {
    flex: 1,
    marginRight: 10,
  },
  
  // ✅ Completion bar avec couleurs cohérentes
  completionBar: {
    height: 8,
    backgroundColor: COLORS.surface.disabled, // #333333 (plus cohérent que #23232a)
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  completionFill: {
    height: '100%',
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderRadius: 4,
  },
  
  // ✅ Complete state avec Vert Editia
  completionFillComplete: {
    backgroundColor: COLORS.status.success, // #00FF88 (Vert Editia!)
  },
  
  completionText: {
    fontSize: 14,
    color: COLORS.text.tertiary, // #B0B0B0
    fontWeight: '500',
  },
  
  // ✅ Card structure
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  fieldIconContainer: {
    flexShrink: 0,
  },
  
  // ✅ Field icon avec états cohérents
  fieldIcon: {
    backgroundColor: COLORS.surface.disabled, // #333333 (plus cohérent que #23232a)
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ✅ Filled state avec Rouge Editia
  fieldIconFilled: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardContent: {
    flex: 1,
  },
  
  // ✅ Card typography
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary, // #FFFFFF
    marginBottom: 2,
  },
  
  cardDescription: {
    fontSize: 13,
    color: COLORS.text.tertiary, // #B0B0B0
    marginBottom: 6,
    lineHeight: 18, // Meilleure lisibilité
  },
  
  cardValue: {
    fontSize: 14,
    color: COLORS.text.secondary, // #E0E0E0 (plus lisible que #ccc)
    lineHeight: 20,
  },
  
  // ✅ Card value empty state
  cardValueEmpty: {
    color: COLORS.text.disabled, // #808080
    fontStyle: 'italic',
  },
  
  cardAction: {
    flexShrink: 0,
  },
  
  // ✅ Section styles (unused but prepared)
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary, // #FFFFFF
    marginBottom: 8,
  },
  
  instructionText: {
    fontSize: 15,
    color: COLORS.text.tertiary, // #B0B0B0
    lineHeight: 22,
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION EDITORIAL SCREEN:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • ActivityIndicator: #007AFF → #FF0050 (Rouge Editia)
 * • Progress bar fill: #007AFF → #FF0050 (Rouge Editia)
 * • Progress bar complete: #10b981 → #00FF88 (Vert Editia)
 * • Field icon filled: #007AFF → #FF0050 (Rouge Editia)
 * • backgroundColor cards: #18181b → #1a1a1a (Background secondary)
 * • borderColor: #23232a → rgba(255, 255, 255, 0.1) (Surface border)
 * • completionBar: #23232a → #333333 (Surface disabled)
 * • fieldIcon default: #23232a → #333333 (Surface disabled)
 * • Text colors: #fff/#888/#ccc → Hiérarchie COLORS cohérente
 * • Icons: #666 → COLORS.text.disabled (#808080)
 * 
 * 🎯 AMÉLIORATIONS INTERFACE:
 * • BorderRadius: 18 → 16px (plus cohérent avec système)
 * • Shadows avec couleurs système neutres
 * • Field icon filled avec shadow colorée Rouge Editia
 * • Line heights améliorées pour lisibilité
 * • Card value empty state avec style dédié
 * • Loading container avec gap moderne
 * • Typography hiérarchisée (primary, secondary, tertiary, disabled)
 * 
 * 🚀 NOUVEAUTÉS:
 * • Progress bar en Rouge Editia, complete en Vert Editia
 * • Field icons avec states visuels améliorés
 * • Borders cohérentes avec design système
 * • ActivityIndicator en Rouge Editia partout
 * • Touch feedback conservé (activeOpacity={0.8})
 * • Card value empty avec style italique distinctif
 * 
 * 20+ couleurs hardcodées → Interface Profil Éditorial cohérente Editia ✨
 */