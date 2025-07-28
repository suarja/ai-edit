import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleAlert as AlertCircle } from 'lucide-react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

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
      <AlertCircle size={20} color={SHARED_STYLE_COLORS.error} />
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
    backgroundColor: SHARED_STYLE_COLORS.primaryOverlay,
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
    color: SHARED_STYLE_COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: SHARED_STYLE_COLORS.error,
    fontSize: 14,
    marginBottom: 12,
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  errorButton: {
    backgroundColor: SHARED_STYLE_COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ErrorDisplay;
