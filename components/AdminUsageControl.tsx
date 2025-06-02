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
import { supabase } from '@/lib/supabase';
import { User, Shield } from 'lucide-react-native';

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

      // First, check if current user has admin privileges in user_roles
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        throw new Error('Not authenticated');
      }

      const { data: adminRole, error: roleError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', authData.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleError) {
        console.error('Error checking admin privileges:', roleError);
      }

      console.log('Admin privileges check:', adminRole ? 'Yes' : 'No');

      // Proceed with update
      const { error } = await supabase
        .from('user_usage')
        .update({ videos_limit: limitValue })
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
        <Shield size={20} color="#FF9500" />
        <Text style={styles.title}>Admin: Contrôle d'Utilisation</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <User size={16} color="#999" />
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
          placeholderTextColor="#666"
        />
      </View>

      <TouchableOpacity
        style={[styles.updateButton, loading && styles.updateButtonDisabled]}
        onPress={updateLimit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.updateButtonText}>Mettre à jour la limite</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
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
    color: '#FF9500',
  },
  infoContainer: {
    backgroundColor: '#222',
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
    color: '#999',
  },
  userId: {
    fontSize: 12,
    color: '#888',
    flex: 1,
    textAlign: 'right',
  },
  currentLimit: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    height: 44,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#FFF',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#FF9500',
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
