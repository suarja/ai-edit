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
  SafeAreaView,
} from 'react-native';
import { X, Check, LogOut, Camera } from 'lucide-react-native';
import { useUserProfileManager } from '@/hooks/useUserProfileManager';
import { SHARED_STYLE_COLORS, sharedStyles } from '@/constants/sharedStyles';

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
            {user.full_name || 'Anonymous User'}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#9ca3af" />
            </TouchableOpacity>
            <View style={styles.avatarEditContainer}>
              <Image
                source={{
                  uri: editProfile.avatar_url || defaultAvatarUrl,
                }}
                style={styles.profileImageLarge}
              />
              <TouchableOpacity style={styles.cameraIcon}>
                <Camera size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.nameInput}
              value={editProfile.full_name || ''}
              onChangeText={(text) =>
                setEditProfile((prev) => ({ ...prev, full_name: text }))
              }
              placeholder="Enter your name"
              placeholderTextColor="#6b7280"
            />
            <Text style={styles.inputLabel}>Avatar URL</Text>
            <TextInput
              style={styles.nameInput}
              value={editProfile.avatar_url || ''}
              onChangeText={(text) =>
                setEditProfile((prev) => ({ ...prev, avatar_url: text }))
              }
              placeholder="Image URL for your avatar"
              placeholderTextColor="#6b7280"
            />
            {editError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{editError}</Text>
              </View>
            )}
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
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading}
              >
                <LogOut size={20} color="#9ca3af" />
                <Text style={styles.logoutButtonText}>Logout</Text>
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
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sharedStyles.sectionContainer.backgroundColor,
    padding: 16,
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: sharedStyles.modalOverlay.backgroundColor,
  },
  modalContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 2,
  },
  avatarEditContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  profileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4b5563',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10b981',
    padding: 8,
    borderRadius: 20,
  },
  inputLabel: {
    color: '#d1d5db',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '500',
  },
  nameInput: {
    color: '#f9fafb',
    fontSize: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  errorContainer: {
    backgroundColor: '#3f1212',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4b5563',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  logoutButtonText: {
    color: '#9ca3af',
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
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserProfileManager;
