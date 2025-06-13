import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Send } from 'lucide-react-native';

type SubmitButtonProps = {
  onSubmit: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  onSubmit,
  isSubmitting,
  isDisabled,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.submitButton,
          (isSubmitting || isDisabled) && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitting || isDisabled}
      >
        {isSubmitting ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.submitButtonText}>Génération en cours...</Text>
          </>
        ) : (
          <>
            <Send size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Générer la Vidéo</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubmitButton;
