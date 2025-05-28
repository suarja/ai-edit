import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface OptionCardProps {
  text: string;
  selected: boolean;
  onSelect: () => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  text,
  selected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selectedContainer]}
      onPress={onSelect}
      activeOpacity={0.7}
      testID="option-card"
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{text}</Text>
      {selected && (
        <View style={styles.checkContainer} testID="check-icon">
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  selectedContainer: {
    backgroundColor: '#004C99',
  },
  text: {
    fontSize: 16,
    color: '#ddd',
    flex: 1,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '500',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
