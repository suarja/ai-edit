import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Edit3,
  Video,
  CheckCircle,
  Copy,
  Trash2,
  X,
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

interface ScriptActionsModalProps {
  script: any | null; // Peut être ScriptListItem ou ScriptDraft
  visible: boolean;
  onClose: () => void;
  onScriptDeleted: (scriptId?: string) => void;
  onScriptDuplicated: (newScript: any) => void;
  onValidate?: () => void;
  onGenerateVideo?: () => void;
  onEdit?: () => void;
}

export default function ScriptActionsModal({
  script,
  visible,
  onClose,
  onScriptDeleted,
  onScriptDuplicated,
  onValidate,
  onGenerateVideo,
  onEdit,
}: ScriptActionsModalProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { userUsage, presentPaywall, videosRemaining, currentPlan } =
    useRevenueCat();
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  if (!script) return null;

  const handleEdit = () => {
    console.log('ScriptActionsModal handleEdit called');
    if (onEdit) {
      console.log('onEdit called');
      onEdit();
      return;
    }
    onClose();
    router.push({
      pathname: '/chat',
      params: { scriptId: script.id },
    });
  };

  const handleDuplicate = async () => {
    setActionLoading('duplicate');

    try {
      const token = await getToken();
      const response = await fetch(
        `${API_ENDPOINTS.SCRIPTS()}/${script.id}/duplicate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to duplicate script');
      }

      const result = await response.json();
      const duplicatedScript = result.data.script;

      onScriptDuplicated(duplicatedScript);
      onClose();

      Alert.alert('Script dupliqué', 'Le script a été dupliqué avec succès.', [
        { text: 'OK' },
      ]);
    } catch (error) {
      console.error('Error duplicating script:', error);
      Alert.alert('Erreur', 'Impossible de dupliquer le script');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Supprimer le script',
      `Êtes-vous sûr de vouloir supprimer "${script.title}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setActionLoading('delete');
            try {
              const token = await getToken();
              const response = await fetch(
                `${API_ENDPOINTS.SCRIPTS()}/${script.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (!response.ok) {
                throw new Error('Failed to delete script');
              }

              onScriptDeleted(script.id);
              onClose();
            } catch (error) {
              console.error('Error deleting script:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le script');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleValidate = async () => {
    if (onValidate) {
      onClose();
      onValidate();
      return;
    }

    setActionLoading('validate');

    try {
      const token = await getToken();
      const response = await fetch(
        `${API_ENDPOINTS.SCRIPTS()}/${script.id}/validate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to validate script');
      }

      onClose();
      Alert.alert('Validé', 'Script validé avec succès !');
    } catch (error) {
      console.error('Error validating script:', error);
      Alert.alert('Erreur', 'Impossible de valider le script');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateVideo = () => {
    onClose();

    if (onGenerateVideo) {
      onGenerateVideo();
      return;
    }

    if (!script.current_script?.trim()) {
      Alert.alert(
        'Erreur',
        'Ce script est vide et ne peut pas être utilisé pour générer une vidéo'
      );
      return;
    }

    router.push({
      pathname: '/script-video-settings',
      params: {
        scriptId: script.id,
        script: script.current_script,
        wordCount: script.word_count?.toString() || '0',
        estimatedDuration: script.estimated_duration?.toString() || '0',
        title: script.title,
      },
    });
  };

  const isValidated = script.status === 'validated';
  const hasScript = script.current_script?.trim().length > 0;


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {script.title || 'Script sans titre'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {/* Edit */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleEdit}
              disabled={actionLoading !== null}
            >
              <Edit3 size={22} color={SHARED_STYLE_COLORS.success} />
              <Text style={[styles.actionText, { color: SHARED_STYLE_COLORS.success }]}>
                Modifier
              </Text>
            </TouchableOpacity>

            {/* Generate Video */}
            {hasScript && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleGenerateVideo}
                disabled={actionLoading !== null}
              >
                <Video size={22} color={SHARED_STYLE_COLORS.secondary} />
                <View style={styles.generateVideoContent}>
                  <Text style={[{ fontSize: 16, fontWeight: '600' }, { color: SHARED_STYLE_COLORS.secondary }]}>
                    Générer Vidéo
                  </Text>
                  {currentPlan === 'free' && (
                    <Text style={styles.watermarkNote}>
                      Avec filigrane Editia
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}

            {/* Validate */}
            {hasScript && !isValidated && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleValidate}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'validate' ? (
                  <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.success} />
                ) : (
                  <CheckCircle size={22} color={SHARED_STYLE_COLORS.success} />
                )}
                <Text style={[styles.actionText, { color: SHARED_STYLE_COLORS.success }]}>
                  Valider
                </Text>
              </TouchableOpacity>
            )}

            {/* Duplicate */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleDuplicate}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'duplicate' ? (
                <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.accent} />
              ) : (
                <Copy size={22} color={SHARED_STYLE_COLORS.accent} />
              )}
              <Text style={[styles.actionText, { color: SHARED_STYLE_COLORS.accent }]}>
                Dupliquer
              </Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={[styles.actionItem, styles.deleteAction]}
              onPress={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'delete' ? (
                <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.error} />
              ) : (
                <Trash2 size={22} color={SHARED_STYLE_COLORS.error} />
              )}
              <Text style={[styles.actionText, { color: SHARED_STYLE_COLORS.error }]}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modal: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 20,
    minWidth: 300,
    maxWidth: 360,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: SHARED_STYLE_COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  actions: {
    padding: 12,
  },
  actionItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 18,
    borderRadius: 16,
    marginVertical: 3,
    backgroundColor: 'transparent',
  },
  deleteAction: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: SHARED_STYLE_COLORS.border,
    borderRadius: 0,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
    marginLeft: 16,
  },
  generateVideoContent: {
    flexDirection: 'column' as const,
    alignItems: 'flex-start' as const,
    marginLeft: 16,
    flex: 1,
  },
  watermarkNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
    fontStyle: 'italic' as const,
    fontWeight: '400' as const,
    marginLeft: 0,
  },
};
