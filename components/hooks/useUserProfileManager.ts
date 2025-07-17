import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useClerkSupabaseClient } from '@/lib/supabase-clerk';
import { useClerk, useAuth } from '@clerk/clerk-expo';
import { useGetUser } from '@/components/hooks/useGetUser';
import { API_ENDPOINTS, API_HEADERS } from '@/lib/config/api';
import { router } from 'expo-router';

export type UserProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  role?: string;
};
// Get a random avatar from the API
const defaultAvatarUrl = 'https://avatar.iran.liara.run/public';

export function useUserProfileManager() {
  const [user, setUser] = useState<UserProfile>({
    id: '',
    full_name: '',
    avatar_url: null,
    email: '',
    role: 'user',
  });
  const [editProfile, setEditProfile] = useState<UserProfile>(user);
  const [modalVisible, setModalVisible] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { client: supabase } = useClerkSupabaseClient();
  const { signOut } = useClerk();
  const { fetchUser, clerkLoaded, isSignedIn } = useGetUser();
  const { getToken } = useAuth();

  // Fetch user profile on mount
  useEffect(() => {
    if (clerkLoaded && isSignedIn) {
      fetchProfile();
    }
  }, [clerkLoaded, isSignedIn]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const userData = await fetchUser();
      if (!userData) {
        router.replace('/(auth)/sign-in');
        return;
      }
      setUser({
        id: userData.id,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        email: userData.email,
        role: userData.role,
      });
      setEditProfile({
        id: userData.id,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        email: userData.email,
        role: userData.role,
      });
    } catch (err) {
      setEditError('Échec du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setEditProfile(user);
    setEditError(null);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setEditError(null);
  };

  const handleSave = async () => {
    setEditLoading(true);
    setEditError(null);
    setUpdating(true);
    try {
      // Get the database user (which includes the database ID)
      const userData = await fetchUser();
      if (!userData) {
        throw new Error('User not found');
      }
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: editProfile.full_name,
          avatar_url: editProfile.avatar_url,
        })
        .eq('id', userData.id);
      if (updateError) throw updateError;
      setUser(editProfile);
      setModalVisible(false);
    } catch (err: any) {
      setEditError(err.message || 'Échec de la mise à jour du profil');
    } finally {
      setEditLoading(false);
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setEditError(null);
    setModalVisible(false);
    try {
      setUser({
        id: '',
        full_name: '',
        avatar_url: null,
        email: '',
        role: '',
      });
      await signOut();
      router.replace('/');
    } catch (err) {
      setEditError('Échec de la déconnexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            setEditError(null);
            setModalVisible(false);
            try {
              const clerkToken = await getToken();
              if (!clerkToken) throw new Error('Token manquant');
              const response = await fetch(API_ENDPOINTS.DELETE_USER(), {
                method: 'POST',
                headers: API_HEADERS.CLERK_AUTH(clerkToken),
              });
              if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(
                  data?.error || 'Erreur lors de la suppression du compte'
                );
              }
              await signOut();
              router.replace('/');
            } catch (err: any) {
              setEditError(
                err.message || 'Erreur lors de la suppression du compte'
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return {
    user,
    editProfile,
    defaultAvatarUrl,
    setEditProfile,
    modalVisible,
    setModalVisible,
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
  };
}
