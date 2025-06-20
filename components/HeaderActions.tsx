import React, { useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { 
  Video, 
  CheckCircle, 
  MoreHorizontal,
  Copy,
  Trash2,
  Share
} from 'lucide-react-native';

interface HeaderActionsProps {
  scriptDraft: any;
  currentScript: string | null;
  isLoading: boolean;
  onValidate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onGenerateVideo: () => void;
}

export default function HeaderActions({
  scriptDraft,
  currentScript,
  isLoading,
  onValidate,
  onDuplicate,
  onDelete,
  onGenerateVideo,
}: HeaderActionsProps) {
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Debug log
  console.log('HeaderActions render:', { 
    hasScriptDraft: !!scriptDraft, 
    hasCurrentScript: !!currentScript,
    scriptStatus: scriptDraft?.status 
  });

  if (!scriptDraft || !currentScript) {
    console.log('HeaderActions: No script or draft, returning null');
    return null;
  }

  const isValidated = scriptDraft.status === 'validated';

  const handleDuplicate = () => {
    setShowMoreActions(false);
    onDuplicate();
  };

  const handleDelete = () => {
    setShowMoreActions(false);
    Alert.alert(
      'Supprimer le script',
      'Êtes-vous sûr ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Primary Action - Generate Video */}
      <TouchableOpacity 
        onPress={onGenerateVideo}
        style={styles.primaryButton}
        disabled={isLoading}
      >
        <Video size={18} color="#007AFF" />
      </TouchableOpacity>
      
      {/* Validate if not validated */}
      {!isValidated && (
        <TouchableOpacity 
          onPress={onValidate}
          style={styles.actionButton}
          disabled={isLoading}
        >
          <CheckCircle size={18} color="#34C759" />
        </TouchableOpacity>
      )}
      
      {/* More Actions */}
      <View style={styles.moreContainer}>
        <TouchableOpacity 
          onPress={() => setShowMoreActions(!showMoreActions)}
          style={styles.actionButton}
          disabled={isLoading}
        >
          <MoreHorizontal size={18} color="#666" />
        </TouchableOpacity>
        
        {showMoreActions && (
          <>
            {/* Backdrop */}
            <TouchableOpacity
              style={styles.backdrop}
              onPress={() => setShowMoreActions(false)}
              activeOpacity={1}
            />
            
            {/* More Actions Menu */}
            <View style={styles.moreMenu}>
              <TouchableOpacity style={styles.menuItem} onPress={handleDuplicate}>
                <Copy size={16} color="#007AFF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Trash2 size={16} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  primaryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: 8,
  },
  moreContainer: {
    position: 'relative' as const,
  },
  backdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  moreMenu: {
    position: 'absolute' as const,
    top: 40,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 9999,
    zIndex: 9999,
  },
  menuItem: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
}; 