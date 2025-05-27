import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  User,
  MessageCircle,
  Users,
  FileText,
  Edit3,
  Check,
} from 'lucide-react-native';

type EditorialProfile = {
  id: string;
  persona_description: string | null;
  tone_of_voice: string | null;
  audience: string | null;
  style_notes: string | null;
};

type EditorialProfileCardProps = {
  profile: EditorialProfile | null;
  isSelected?: boolean;
  onEdit?: () => void;
  onSelect?: () => void;
  showActions?: boolean;
  compact?: boolean;
};

export default function EditorialProfileCard({
  profile,
  isSelected = false,
  onEdit,
  onSelect,
  showActions = true,
  compact = false,
}: EditorialProfileCardProps) {
  const hasProfile = profile && profile.persona_description;

  const getProfileSummary = () => {
    if (!hasProfile) return 'Aucun profil configuré';

    const parts = [];
    if (profile.persona_description) {
      parts.push(
        profile.persona_description.substring(0, 100) +
          (profile.persona_description.length > 100 ? '...' : '')
      );
    }
    return parts.join(' • ') || 'Profil incomplet';
  };

  const getCompletionPercentage = () => {
    if (!profile) return 0;

    const fields = [
      profile.persona_description,
      profile.tone_of_voice,
      profile.audience,
      profile.style_notes,
    ];

    const filledFields = fields.filter(
      (field) => field && field.trim().length > 0
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completion = getCompletionPercentage();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        !hasProfile && styles.containerEmpty,
      ]}
      onPress={onSelect}
      disabled={!onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.iconContainer,
              hasProfile && styles.iconContainerFilled,
            ]}
          >
            <User size={20} color={hasProfile ? '#fff' : '#666'} />
          </View>
          <View style={styles.titleContent}>
            <Text style={styles.title}>
              {hasProfile ? 'Profil Éditorial' : 'Créer un Profil'}
            </Text>
            {hasProfile && (
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
                <Text style={styles.completionText}>
                  {completion}% complété
                </Text>
              </View>
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectedBadge}>
            <Check size={16} color="#fff" />
          </View>
        )}
      </View>

      {!compact && (
        <View style={styles.content}>
          {hasProfile ? (
            <>
              <Text style={styles.summary} numberOfLines={3}>
                {getProfileSummary()}
              </Text>

              <View style={styles.fieldsGrid}>
                <View style={styles.fieldItem}>
                  <MessageCircle size={14} color="#007AFF" />
                  <Text style={styles.fieldLabel}>Ton</Text>
                  <View
                    style={[
                      styles.fieldStatus,
                      profile.tone_of_voice && styles.fieldStatusFilled,
                    ]}
                  />
                </View>

                <View style={styles.fieldItem}>
                  <Users size={14} color="#007AFF" />
                  <Text style={styles.fieldLabel}>Audience</Text>
                  <View
                    style={[
                      styles.fieldStatus,
                      profile.audience && styles.fieldStatusFilled,
                    ]}
                  />
                </View>

                <View style={styles.fieldItem}>
                  <FileText size={14} color="#007AFF" />
                  <Text style={styles.fieldLabel}>Style</Text>
                  <View
                    style={[
                      styles.fieldStatus,
                      profile.style_notes && styles.fieldStatusFilled,
                    ]}
                  />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyText}>
                Créez votre profil éditorial pour des vidéos plus personnalisées
              </Text>
              <View style={styles.benefitsList}>
                <Text style={styles.benefitItem}>• Ton de voix cohérent</Text>
                <Text style={styles.benefitItem}>
                  • Contenu adapté à votre audience
                </Text>
                <Text style={styles.benefitItem}>• Style personnalisé</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Edit3 size={16} color="#007AFF" />
            <Text style={styles.editButtonText}>
              {hasProfile ? 'Modifier' : 'Créer'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerSelected: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  containerEmpty: {
    borderStyle: 'dashed',
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    backgroundColor: '#333',
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerFilled: {
    backgroundColor: '#007AFF',
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  completionContainer: {
    gap: 6,
  },
  completionBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  completionFillComplete: {
    backgroundColor: '#10b981',
  },
  completionText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  selectedBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginBottom: 16,
  },
  summary: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 16,
  },
  fieldsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 8,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '500',
    flex: 1,
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
  emptyContent: {
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
    lineHeight: 22,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 4,
  },
  benefitItem: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
