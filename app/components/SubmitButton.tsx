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
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default SubmitButton;
