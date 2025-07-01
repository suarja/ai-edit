import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// 🆕 Local interface to avoid direct dependency
export interface HandleValidationResult {
  exists: boolean | 'unknown';
  message: string;
  details?: any;
  hasCompletedAnalysisForUser?: boolean;
}

// Make the screen accept props to control its state externally
interface StartAnalysisScreenProps {
  onAnalysisStart: () => void;
}

const StartAnalysisScreen: React.FC<StartAnalysisScreenProps> = ({ onAnalysisStart }) => {
  const { getToken } = useAuth();
  const { colors } = useTheme();

  const [tiktokHandle, setTiktokHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // State for live validation
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<HandleValidationResult | null>(null);

  const validateHandle = useCallback(async (handle: string) => {
    if (handle.length < 2) {
      setValidationResult(null);
      return;
    }
    setIsValidating(true);
    setValidationResult(null);
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_VALIDATE(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tiktokHandle: handle, userId: 'user_placeholder' }), // TODO: Get real user ID from auth
      });
      const data: HandleValidationResult = await response.json();
      setValidationResult(data);
    } catch (error) {
      setValidationResult({ exists: 'unknown', message: 'Validation failed' });
    } finally {
      setIsValidating(false);
    }
  }, [getToken]);

  const handleStartAnalysis = async () => {
    if (!tiktokHandle || validationResult?.exists === false) {
      setSubmitError("Veuillez entrer un nom d'utilisateur TikTok valide.");
      return;
    }
    
    if (validationResult?.hasCompletedAnalysisForUser) {
        Alert.alert(
            "Analyse Existante",
            "Vous avez déjà une analyse complétée pour ce compte. Voulez-vous la remplacer par une nouvelle ?",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Continuer", onPress: () => proceedWithAnalysis() }
            ]
        );
        return;
    }

    proceedWithAnalysis();
  };

  const proceedWithAnalysis = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getToken();
      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_START(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tiktok_handle: tiktokHandle, is_pro: true }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to start analysis.');
      }

      console.log('🚀 Analysis started:', result.data.run_id);
      onAnalysisStart();

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderValidationIcon = () => {
    if (isValidating) return <ActivityIndicator size="small" />;
    if (!validationResult) return null;

    switch (validationResult.exists) {
      case true:
        return <Icon name="checkmark-circle" size={20} color="green" />;
      case false:
        return <Icon name="close-circle" size={20} color="red" />;
      case 'unknown':
        return <Icon name="warning" size={20} color="orange" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <BarChart3 size={64} color="#007AFF" />
            <Text style={styles.title}>Commencer votre analyse</Text>
            <Text style={styles.subtitle}>
              Entrez votre nom d'utilisateur TikTok pour obtenir des insights personnalisés par l'IA et des recommandations de croissance.
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }
                ]}
                placeholder="@username"
                placeholderTextColor={colors.text}
                value={tiktokHandle}
                onChangeText={(text) => {
                  const cleanText = text.replace(/^@/, '');
                  setTiktokHandle(cleanText);
                  validateHandle(cleanText);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.iconWrapper}>
                {renderValidationIcon()}
              </View>
            </View>

            {validationResult && (
              <Text 
                style={[
                  styles.messageText, 
                  validationResult.exists === false ? styles.errorText : 
                  validationResult.exists === 'unknown' ? styles.warningText : styles.successText
                ]}
              >
                {validationResult.message}
              </Text>
            )}

            {validationResult?.hasCompletedAnalysisForUser && (
                <TouchableOpacity style={styles.infoBox} /* onPress={() => router.push('/(drawer)/account-insights')} */>
                    <Text style={styles.infoText}>Une analyse pour ce compte existe déjà.</Text>
                    <Text style={styles.infoLink}>Voir les résultats</Text>
                </TouchableOpacity>
            )}
            
            {submitError && <Text style={styles.errorText}>{submitError}</Text>}

            <TouchableOpacity
              style={[
                styles.button,
                (validationResult?.exists === false || isSubmitting) && styles.buttonDisabled,
              ]}
              onPress={handleStartAnalysis}
              disabled={validationResult?.exists === false || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Démarrer l'analyse</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  iconWrapper: {
    paddingRight: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#005ecb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  messageText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  successText: {
    color: '#2ecc71',
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 8,
    textAlign: 'center',
  },
  warningText: {
    color: '#f39c12',
  },
  infoBox: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    textAlign: 'center',
  },
  infoLink: {
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 4,
  }
});

export default StartAnalysisScreen; 