import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';
import { Crown } from 'lucide-react-native';

type VoiceCreateButtonProps = {
  onCreate: () => void;
  hasAccess?: boolean;
};

const VoiceCreateButton: React.FC<VoiceCreateButtonProps> = ({ 
  onCreate, 
  hasAccess = true 
}) => (
  <TouchableOpacity style={styles.button} onPress={onCreate}>
    <View style={styles.buttonContent}>
      <Text style={styles.text}>Créer une voix personnalisée</Text>
      {!hasAccess && (
        <Crown size={16} color={SHARED_STYLE_COLORS.warning} style={styles.crownIcon} />
      )}
    </View>
    {!hasAccess && (
      <Text style={styles.premiumText}>Plan Créateur requis</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    opacity: 0.8,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  crownIcon: {
    marginLeft: 4,
  },
  premiumText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 14,
    marginTop: 4,
  },
});

export default VoiceCreateButton;
