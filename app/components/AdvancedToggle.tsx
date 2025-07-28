import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

type AdvancedToggleProps = {
  showAdvanced: boolean;
  hasIncompleteConfig: boolean;
  onToggle: () => void;
};

const AdvancedToggle: React.FC<AdvancedToggleProps> = ({
  showAdvanced,
  hasIncompleteConfig,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.advancedToggle,
        hasIncompleteConfig && styles.advancedToggleWarning,
      ]}
      onPress={onToggle}
    >
      <Settings size={16} color={hasIncompleteConfig ? SHARED_STYLE_COLORS.warning : SHARED_STYLE_COLORS.text} />
      <Text
        style={[
          styles.advancedToggleText,
          hasIncompleteConfig && styles.advancedToggleTextWarning,
        ]}
      >
        {showAdvanced ? 'Masquer' : 'Afficher'} les options de configuration
        {hasIncompleteConfig ? ' (configuration requise)' : ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  advancedToggleWarning: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  advancedToggleText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  advancedToggleTextWarning: {
    color: SHARED_STYLE_COLORS.warning,
  },
});

export default AdvancedToggle;
