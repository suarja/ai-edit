import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface SettingsHeaderProps {
  title: string;
  onBack?: () => void;
  rightButton?: {
    icon: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}

export default function SettingsHeader({
  title,
  onBack,
  rightButton,
}: SettingsHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {rightButton ? (
        <TouchableOpacity
          style={[
            styles.rightButton,
            (rightButton.disabled || rightButton.loading) &&
              styles.rightButtonDisabled,
          ]}
          onPress={rightButton.onPress}
          disabled={rightButton.disabled || rightButton.loading}
        >
          {rightButton.loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            rightButton.icon
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.rightButtonPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  rightButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonDisabled: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)',
  },
  rightButtonPlaceholder: {
    width: 44,
    height: 44,
  },
});
