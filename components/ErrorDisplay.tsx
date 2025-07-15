import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleAlert as AlertCircle } from 'lucide-react-native';

interface ErrorDisplayProps {
  message: string;
  title?: string;
  onAcknowledge?: () => void;
  acknowledgeLabel?: string;
  children?: React.ReactNode;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  title = 'Erreur',
  onAcknowledge,
  acknowledgeLabel = 'Compris',
  children,
}) => (
  <View style={styles.errorContainer}>
    <View style={styles.errorHeader}>
      <AlertCircle size={20} color="#ef4444" />
      <Text style={styles.errorTitle}>{title}</Text>
    </View>
    <Text style={styles.errorText}>{message}</Text>
    {children}
    {onAcknowledge && (
      <View style={styles.errorActions}>
        <TouchableOpacity style={styles.errorButton} onPress={onAcknowledge}>
          <Text style={styles.errorButtonText}>{acknowledgeLabel}</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#2D1116',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  errorButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ErrorDisplay;
