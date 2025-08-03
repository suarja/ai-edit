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
import { useUserProfileManager } from '@/components/hooks/useUserProfileManager';
import {
  SHARED_STYLE_COLORS,
  sharedStyles,
} from '@/lib/constants/sharedStyles';

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
              <X size={24} color={SHARED_STYLE_COLORS.textSecondary} />
            </TouchableOpacity>
            <View style={styles.avatarEditContainer}>
              <Image
                source={{
                  uri: editProfile.avatar_url || defaultAvatarUrl,
                }}
                style={styles.profileImageLarge}
              />
              <TouchableOpacity style={styles.cameraIcon}>
                <Camera size={20} color={SHARED_STYLE_COLORS.text} />
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
              placeholderTextColor={SHARED_STYLE_COLORS.textMuted}
            />
            <Text style={styles.inputLabel}>Avatar URL</Text>
            <TextInput
              style={styles.nameInput}
              value={editProfile.avatar_url || ''}
              onChangeText={(text) =>
                setEditProfile((prev) => ({ ...prev, avatar_url: text }))
              }
              placeholder="Image URL for your avatar"
              placeholderTextColor={SHARED_STYLE_COLORS.textMuted}
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
                <ActivityIndicator color={SHARED_STYLE_COLORS.text} />
              ) : (
                <Check size={20} color={SHARED_STYLE_COLORS.text} />
              )}
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading}
              >
                <LogOut size={20} color={SHARED_STYLE_COLORS.textSecondary} />
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
                  <ActivityIndicator color={SHARED_STYLE_COLORS.error} />
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
    marginBottom: 12,
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
    borderColor: SHARED_STYLE_COLORS.border,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    color: SHARED_STYLE_COLORS.textSecondary,
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
    borderColor: SHARED_STYLE_COLORS.border,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: SHARED_STYLE_COLORS.primary,
    padding: 8,
    borderRadius: 20,
  },
  inputLabel: {
    color: SHARED_STYLE_COLORS.textSecondary,
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontWeight: '500',
  },
  nameInput: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  errorContainer: {
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.error,
  },
  errorText: {
    color: SHARED_STYLE_COLORS.error,
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
    backgroundColor: SHARED_STYLE_COLORS.primary,
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
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  logoutButtonText: {
    color: SHARED_STYLE_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.error,
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
