import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw, AlertTriangle } from 'lucide-react-native';
import { VoiceRecordingError } from '@/types/voice-recording';

interface VoiceRecordingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

interface VoiceRecordingErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: string) => void;
  fallbackComponent?: (error: Error, retry: () => void) => ReactNode;
}

export class VoiceRecordingErrorBoundary extends Component<
  VoiceRecordingErrorBoundaryProps,
  VoiceRecordingErrorBoundaryState
> {
  constructor(props: VoiceRecordingErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): VoiceRecordingErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: error.stack || error.toString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      'VoiceRecordingErrorBoundary caught an error:',
      error,
      errorInfo
    );

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo.componentStack);

    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // If a custom fallback component is provided, use it
      if (this.props.fallbackComponent && this.state.error) {
        return this.props.fallbackComponent(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <AlertTriangle size={48} color="#ef4444" style={styles.errorIcon} />

            <Text style={styles.errorTitle}>Erreur d'enregistrement vocal</Text>

            <Text style={styles.errorMessage}>
              Une erreur inattendue s'est produite pendant l'enregistrement.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Détails (développement):</Text>
                <Text style={styles.debugText}>{this.state.error.message}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText} numberOfLines={3}>
                    {this.state.errorInfo}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleRetry}
            >
              <RefreshCw size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper component for easier integration with hooks
interface VoiceRecordingErrorWrapperProps {
  children: ReactNode;
  onError?: (error: VoiceRecordingError) => void;
  customFallback?: (error: Error, retry: () => void) => ReactNode;
}

export const VoiceRecordingErrorWrapper: React.FC<
  VoiceRecordingErrorWrapperProps
> = ({ children, onError, customFallback }) => {
  const handleError = (error: Error, errorInfo: string) => {
    // Convert to VoiceRecordingError format if needed
    const voiceError: VoiceRecordingError = {
      type: 'recording',
      code: 'COMPONENT_ERROR',
      message: error.message,
      recoverable: true,
      userAction: "Réessayez ou redémarrez l'application",
    };

    onError?.(voiceError);
  };

  return (
    <VoiceRecordingErrorBoundary
      onError={handleError}
      fallbackComponent={customFallback}
    >
      {children}
    </VoiceRecordingErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  debugContainer: {
    backgroundColor: '#2a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#d1d5db',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
