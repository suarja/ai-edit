import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  MoreVertical, 
  Copy, 
  Trash2, 
  CheckCircle,
  Video,
  Edit3
} from 'lucide-react-native';
import { ScriptListItem } from '@/types/script';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';

interface ScriptListActionsProps {
  script: ScriptListItem;
  onScriptDeleted: (scriptId: string) => void;
  onScriptDuplicated: (newScript: ScriptListItem) => void;
}

export default function ScriptListActions({
  script,
  onScriptDeleted,
  onScriptDuplicated,
}: ScriptListActionsProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleEdit = () => {
    setShowActions(false);
    router.push({
      pathname: '/(tabs)/script-chat-demo',
      params: { scriptId: script.id },
    });
  };

  const handleDuplicate = async () => {
    setShowActions(false);
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

      Alert.alert(
        'Script dupliqué',
        'Le script a été dupliqué avec succès. Voulez-vous l\'ouvrir ?',
        [
          { text: 'Plus tard', style: 'cancel' },
          {
            text: 'Ouvrir',
            onPress: () => {
              router.push({
                pathname: '/(tabs)/script-chat-demo',
                params: { scriptId: duplicatedScript.id },
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error duplicating script:', error);
      Alert.alert('Erreur', 'Impossible de dupliquer le script');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setShowActions(false);

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
              Alert.alert('Supprimé', 'Script supprimé avec succès');
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
    setShowActions(false);
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

      Alert.alert('Validé', 'Script validé avec succès !');
      // Optionally refresh the list or update the script status locally
    } catch (error) {
      console.error('Error validating script:', error);
      Alert.alert('Erreur', 'Impossible de valider le script');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateVideo = () => {
    setShowActions(false);
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.moreButton}
        onPress={() => setShowActions(!showActions)}
        disabled={actionLoading !== null}
      >
        {actionLoading ? (
          <ActivityIndicator size="small" color="#666" />
        ) : (
          <MoreVertical size={20} color="#666" />
        )}
      </TouchableOpacity>

      {showActions && (
        <>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => setShowActions(false)}
          />
          
          {/* Actions Menu */}
          <View style={styles.actionsMenu}>
            {/* Edit */}
            <TouchableOpacity style={styles.actionItem} onPress={handleEdit}>
              <Edit3 size={18} color="#007AFF" />
              <Text style={styles.actionText}>Modifier</Text>
            </TouchableOpacity>

            {/* Generate Video */}
            {hasScript && (
              <TouchableOpacity style={styles.actionItem} onPress={handleGenerateVideo}>
                <Video size={18} color="#007AFF" />
                <Text style={styles.actionText}>Générer Vidéo</Text>
              </TouchableOpacity>
            )}

            {/* Validate */}
            {hasScript && !isValidated && (
              <TouchableOpacity style={styles.actionItem} onPress={handleValidate}>
                <CheckCircle size={18} color="#34C759" />
                <Text style={[styles.actionText, { color: '#34C759' }]}>Valider</Text>
              </TouchableOpacity>
            )}

            {/* Duplicate */}
            <TouchableOpacity style={styles.actionItem} onPress={handleDuplicate}>
              <Copy size={18} color="#007AFF" />
              <Text style={styles.actionText}>Dupliquer</Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
              <Trash2 size={18} color="#FF3B30" />
              <Text style={[styles.actionText, { color: '#FF3B30' }]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = {
  container: {
    position: 'relative' as const,
  },
  moreButton: {
    padding: 8,
    borderRadius: 6,
  },
  backdrop: {
    position: 'absolute' as const,
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 1,
  },
  actionsMenu: {
    position: 'absolute' as const,
    top: 40,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 2,
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
}; 