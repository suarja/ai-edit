import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, Check, LogOut, Trash2 } from 'lucide-react-native';
import { useUserProfileManager } from '@/hooks/useUserProfileManager';

const UserProfileManager: React.FC = () => {
  const {
    user,
    editProfile,
    setEditProfile,
    modalVisible,
    defaultAvatarUrl,
    editError,
    editLoading,
    updating,
    loading,
    deleting,
    handleOpen,
    handleClose,
    handleSave,
    handleLogout,
    handleDelete,
  } = useUserProfileManager();

  return (
    <>
      <TouchableOpacity
        style={styles.profileSection}
        onPress={handleOpen}
        disabled={loading}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user.avatar_url || defaultAvatarUrl,
            }}
            style={styles.profileImage}
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user.full_name || 'Nom non défini'}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#888" />
            </TouchableOpacity>
            <View style={styles.avatarEditContainer}>
              <Image
                source={{
                  uri: editProfile.avatar_url || defaultAvatarUrl,
                }}
                style={styles.profileImageLarge}
              />
            </View>
            <TextInput
              style={styles.nameInput}
              value={editProfile.full_name || ''}
              onChangeText={(text) =>
                setEditProfile((prev) => ({ ...prev, full_name: text }))
              }
              placeholder="Entrez votre nom"
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.nameInput}
              value={editProfile.avatar_url || ''}
              onChangeText={(text) =>
                setEditProfile((prev) => ({ ...prev, avatar_url: text }))
              }
              placeholder="URL de l'avatar"
              placeholderTextColor="#666"
            />
            {editError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{editError}</Text>
              </View>
            )}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (updating || editLoading) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={updating || editLoading}
              >
                {updating || editLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Check size={20} color="#fff" />
                )}
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading}
              >
                <LogOut size={20} color="#666" />
                <Text style={styles.logoutButtonText}>Déconnexion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  deleting && styles.deleteButtonDisabled,
                ]}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator color="#ef4444" />
                ) : (
                  <Text style={styles.deleteButtonText}>Supprimer Compte</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    color: '#888',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#181a20',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  avatarEditContainer: {
    marginBottom: 16,
  },
  profileImageLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  nameInput: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#2D1116',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  logoutButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  deleteButtonDisabled: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserProfileManager;
