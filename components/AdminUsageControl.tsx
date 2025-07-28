import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { User, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useGetUser } from './hooks/useGetUser';
import { useClerkSupabaseClient } from '@/lib/config/supabase-clerk';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

type AdminUsageControlProps = {
  userId: string;
  currentLimit: number;
  onUpdate?: () => void;
};

export default function AdminUsageControl({
  userId,
  currentLimit,
  onUpdate,
}: AdminUsageControlProps) {
  const [newLimit, setNewLimit] = useState(currentLimit.toString());
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useGetUser();
  const { client: supabase } = useClerkSupabaseClient();
  const updateLimit = async () => {
    try {
      setLoading(true);
      const limitValue = parseInt(newLimit, 10);

      if (isNaN(limitValue) || limitValue < 1) {
        Alert.alert(
          'Limite invalide',
          'Veuillez entrer un nombre valide supérieur à 0'
        );
        return;
      }

      console.log(`Updating limit for user ${userId} to ${limitValue}`);

      const user = await fetchUser();

      if (!user) {
        router.push('/(auth)/sign-in');
        return;
      }

      const { data: adminRole, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('Error checking admin privileges:', roleError);
      }

      console.log('Admin privileges check:', adminRole ? 'Yes' : 'No');

      // Proceed with update
      const { error } = await supabase
        .from('user_usage')
        .update({ videos_generated_limit: limitValue })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating limit:', error);

        if (error.code === 'PGRST109') {
          Alert.alert(
            'Erreur de permissions',
            "Vous n'avez pas les droits administrateur nécessaires. Vérifiez que votre compte est configuré correctement."
          );
          return;
        }

        throw error;
      }

      Alert.alert(
        'Succès',
        `Limite utilisateur mise à jour à ${limitValue} vidéos`
      );

      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de la limite:', err);
      Alert.alert(
        'Erreur',
        err.message || 'Échec de la mise à jour de la limite'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Shield size={20} color={SHARED_STYLE_COLORS.warning} />
        <Text style={styles.title}>Admin: Contrôle d&apos;Utilisation</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <User size={16} color={SHARED_STYLE_COLORS.textTertiary} />
            <Text style={styles.labelText}>ID Utilisateur:</Text>
          </View>
          <Text style={styles.userId}>{userId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.labelText}>Limite actuelle:</Text>
          <Text style={styles.currentLimit}>{currentLimit} vidéos</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nouvelle limite:</Text>
        <TextInput
          style={styles.input}
          value={newLimit}
          onChangeText={setNewLimit}
          keyboardType="number-pad"
          returnKeyType="done"
          placeholder="5"
          placeholderTextColor={SHARED_STYLE_COLORS.textMuted}
        />
      </View>

      <TouchableOpacity
        style={[styles.updateButton, loading && styles.updateButtonDisabled]}
        onPress={updateLimit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={SHARED_STYLE_COLORS.text} />
        ) : (
          <Text style={styles.updateButtonText}>Mettre à jour la limite</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.backgroundTertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.warning,
  },
  infoContainer: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.textTertiary,
  },
  userId: {
    fontSize: 12,
    color: SHARED_STYLE_COLORS.textMuted,
    flex: 1,
    textAlign: 'right',
  },
  currentLimit: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.text,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 8,
  },
  input: {
    height: 44,
    backgroundColor: SHARED_STYLE_COLORS.backgroundTertiary,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: SHARED_STYLE_COLORS.warning,
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
