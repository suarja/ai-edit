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
  X
} from 'lucide-react-native';
import { ScriptListItem } from '@/types/script';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';

interface ScriptActionsModalProps {
  script: any | null; // Peut être ScriptListItem ou ScriptDraft
  visible: boolean;
  onClose: () => void;
  onScriptDeleted: (scriptId?: string) => void;
  onScriptDuplicated: (newScript: any) => void;
  onValidate?: () => void;
  onGenerateVideo?: () => void;
}

export default function ScriptActionsModal({
  script,
  visible,
  onClose,
  onScriptDeleted,
  onScriptDuplicated,
  onValidate,
  onGenerateVideo,
}: ScriptActionsModalProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  if (!script) return null;

  const handleEdit = () => {
    onClose();
    router.push({
      pathname: '/(tabs)/script-chat-demo',
      params: { scriptId: script.id },
    });
  };

  const handleDuplicate = async () => {
    setActionLoading('duplicate');

    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.SCRIPTS()}/${script.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate script');
      }

      const result = await response.json();
      const duplicatedScript = result.data.script;

      onScriptDuplicated(duplicatedScript);
      onClose();

      Alert.alert(
        'Script dupliqué',
        'Le script a été dupliqué avec succès.',
        [{ text: 'OK' }]
      );
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
              const response = await fetch(`${API_ENDPOINTS.SCRIPTS()}/${script.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

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
      const response = await fetch(`${API_ENDPOINTS.SCRIPTS()}/${script.id}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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
      Alert.alert('Erreur', 'Ce script est vide et ne peut pas être utilisé pour générer une vidéo');
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
              <Edit3 size={20} color="#007AFF" />
              <Text style={styles.actionText}>Modifier</Text>
            </TouchableOpacity>

            {/* Generate Video */}
            {hasScript && (
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={handleGenerateVideo}
                disabled={actionLoading !== null}
              >
                <Video size={20} color="#007AFF" />
                <Text style={styles.actionText}>Générer Vidéo</Text>
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
                  <ActivityIndicator size="small" color="#34C759" />
                ) : (
                  <CheckCircle size={20} color="#34C759" />
                )}
                <Text style={[styles.actionText, { color: '#34C759' }]}>
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
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Copy size={20} color="#007AFF" />
              )}
              <Text style={styles.actionText}>Dupliquer</Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity 
              style={[styles.actionItem, styles.deleteAction]} 
              onPress={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'delete' ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Trash2 size={20} color="#FF3B30" />
              )}
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    minWidth: 280,
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  actions: {
    padding: 8,
  },
  actionItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  deleteAction: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderRadius: 0,
  },
  actionText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500' as const,
    marginLeft: 12,
  },
}; 