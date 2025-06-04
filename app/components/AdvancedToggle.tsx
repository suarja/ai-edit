import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';

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
      <Settings size={16} color={hasIncompleteConfig ? '#FF9500' : '#007AFF'} />
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
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
  advancedToggleTextWarning: {
    color: '#FF9500',
  },
});

export default AdvancedToggle;
