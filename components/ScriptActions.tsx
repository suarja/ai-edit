import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Copy, 
  Trash2, 
  CheckCircle, 
  MoreHorizontal,
  Video,
  Edit3
} from 'lucide-react-native';
import { ScriptDraft } from '@/types/script';

interface ScriptActionsProps {
  scriptDraft: ScriptDraft | null;
  currentScript: string;
  isLoading: boolean;
  onValidate: () => Promise<void>;
  onDuplicate: () => Promise<ScriptDraft | null>;
  onDelete: () => Promise<boolean>;
  onGenerateVideo?: () => void;
}

export default function ScriptActions({
  scriptDraft,
  currentScript,
  isLoading,
  onValidate,
  onDuplicate,
  onDelete,
  onGenerateVideo,
}: ScriptActionsProps) {
  const router = useRouter();
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!scriptDraft || !currentScript.trim()) {
      Alert.alert('Erreur', 'Aucun script à valider');
      return;
    }

    Alert.alert(
      'Valider le script',
      'Êtes-vous sûr de vouloir valider ce script ? Il sera marqué comme prêt pour la génération vidéo.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          style: 'default',
          onPress: async () => {
            setActionLoading('validate');
            try {
              await onValidate();
              Alert.alert('Succès', 'Script validé avec succès !');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de valider le script');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleDuplicate = async () => {
    if (!scriptDraft) return;

    setActionLoading('duplicate');
    try {
      const duplicatedScript = await onDuplicate();
      if (duplicatedScript) {
        Alert.alert(
          'Script dupliqué',
          'Le script a été dupliqué avec succès. Voulez-vous l\'ouvrir ?',
          [
            { text: 'Plus tard', style: 'cancel' },
            {
              text: 'Ouvrir',
              onPress: () => {
                router.push(`/chat?scriptId=${duplicatedScript.id}`);
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de dupliquer le script');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!scriptDraft) return;

    Alert.alert(
      'Supprimer le script',
      'Êtes-vous sûr de vouloir supprimer ce script ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setActionLoading('delete');
            try {
              const success = await onDelete();
              if (success) {
                Alert.alert('Supprimé', 'Script supprimé avec succès', [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)/scripts'),
                  },
                ]);
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le script');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleGenerateVideo = () => {
    if (!scriptDraft || !currentScript.trim()) {
      Alert.alert('Erreur', 'Aucun script à utiliser pour la vidéo');
      return;
    }

    if (onGenerateVideo) {
      onGenerateVideo();
    }
  };

  if (!scriptDraft) return null;

  const isValidated = scriptDraft.status === 'validated';
  const hasScript = currentScript.trim().length > 0;

  // Only show if there are actions to display
  if (!hasScript && isValidated) return null;

  return (
    <View style={styles.container}>
      {/* Primary Actions */}
      <View style={styles.primaryActions}>
        {/* Generate Video Button - Most Important */}
        {hasScript && (
          <TouchableOpacity
            style={[styles.primaryButton, styles.generateButton]}
            onPress={handleGenerateVideo}
            disabled={isLoading}
          >
            <Video size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Vidéo</Text>
          </TouchableOpacity>
        )}

        {/* Validate Button */}
        {hasScript && !isValidated && (
          <TouchableOpacity
            style={[styles.primaryButton, styles.validateButton]}
            onPress={handleValidate}
            disabled={isLoading || actionLoading === 'validate'}
          >
            {actionLoading === 'validate' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <CheckCircle size={18} color="#fff" />
            )}
            <Text style={styles.primaryButtonText}>
              {actionLoading === 'validate' ? 'Validation...' : 'Valider'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Secondary Actions */}
      <View style={styles.secondaryActions}>
        {/* More Actions Toggle */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowActions(!showActions)}
        >
          <MoreHorizontal size={20} color="#666" />
        </TouchableOpacity>

        {/* Actions Menu */}
        {showActions && (
          <View style={styles.actionsMenu}>
            {/* Duplicate */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleDuplicate}
              disabled={actionLoading === 'duplicate'}
            >
              {actionLoading === 'duplicate' ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Copy size={18} color="#007AFF" />
              )}
              <Text style={styles.actionText}>
                {actionLoading === 'duplicate' ? 'Duplication...' : 'Dupliquer'}
              </Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleDelete}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Trash2 size={18} color="#FF3B30" />
              )}
              <Text style={[styles.actionText, styles.deleteText]}>
                {actionLoading === 'delete' ? 'Suppression...' : 'Supprimer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Status Indicator */}
      {isValidated && (
        <View style={styles.statusIndicator}>
          <CheckCircle size={16} color="#34C759" />
          <Text style={styles.statusText}>Validé</Text>
        </View>
      )}
    </View>
  );
}

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000',
    minHeight: 60, // Plus compact
  },
  primaryActions: {
    flexDirection: 'row' as const,
    gap: 8,
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center' as const,
  },
  generateButton: {
    backgroundColor: '#007AFF',
  },
  validateButton: {
    backgroundColor: '#34C759',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  secondaryActions: {
    position: 'relative' as const,
  },
  moreButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
  },
  actionsMenu: {
    position: 'absolute' as const,
    bottom: 48,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  actionItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  deleteText: {
    color: '#FF3B30',
  },
  statusIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 4,
  },
  statusText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '500' as const,
  },
}; 