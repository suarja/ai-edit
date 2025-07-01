import React, { useState, useEffect } from 'react';
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

// Make the screen accept props to control its state externally
interface StartAnalysisScreenProps {
  isLoading: boolean;
  error: string | null;
  refreshAnalysis: () => void;
}

// 🆕 Validation result type
interface ValidationResult {
  exists: boolean | 'unknown';
  message: string;
  hasCompletedAnalysisForUser?: boolean;
}

export default function StartAnalysisScreen({ isLoading, error: initialError, refreshAnalysis }: StartAnalysisScreenProps) {
  const { getToken } = useAuth();
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 🆕 State for live validation
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    if (!tiktokHandle.trim()) {
      setSubmitError('Veuillez entrer un nom d\'utilisateur TikTok.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const token = await getToken();
      const handle = tiktokHandle.startsWith('@') ? tiktokHandle.substring(1) : tiktokHandle;

      const response = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_START(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tiktokHandle: handle }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Une erreur est survenue lors du lancement de l\'analyse.');
      }

      // Analysis started successfully. The backend will process it.
      // We can now redirect the user. A good place might be a "pending" screen,
      // but for now, we'll just reload the current route which will be handled
      // by the guard to show the main layout.
      Alert.alert(
        'Analyse Lancée !',
        `L'analyse pour @${handle} a commencé. Cela peut prendre quelques minutes. Vous serez notifié lorsque c'est prêt.`
      );
      
      // Instead of navigating, just refresh the analysis state
      // The guard will then re-evaluate and render the correct component
      refreshAnalysis();

    } catch (err: any) {
      setSubmitError(err.message || 'Impossible de contacter le serveur.');
      console.error('Failed to start analysis:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🆕 Debounced effect for handle validation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (tiktokHandle.trim().length > 2) {
        validateHandle(tiktokHandle.trim());
      } else {
        setValidationResult(null);
        setValidationError(null);
      }
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [tiktokHandle]);

  // 🆕 Function to call the validation endpoint
  const validateHandle = async (handle: string) => {
    setIsValidating(true);
    setValidationError(null);
    setValidationResult(null);

    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.TIKTOK_ANALYSIS_START().replace('/account-analysis', '')}/account-analysis/validate-handle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tiktok_handle: handle }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur de validation.');
      }
      
      setValidationResult(result.data);

    } catch (err: any) {
      setValidationError(err.message || 'Impossible de vérifier le nom d\'utilisateur.');
    } finally {
      setIsValidating(false);
    }
  };

  // If the guard is loading, show a full-screen loader
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If the guard has an error (e.g., network), show it
  if (initialError) {
     return (
      <View style={[styles.container, { justifyContent: 'center', padding: 20 }]}>
        <Text style={styles.errorText}>Erreur de chargement: {initialError}</Text>
        <TouchableOpacity style={styles.button} onPress={refreshAnalysis}>
            <Text style={styles.buttonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
                style={styles.input}
                placeholder="@username"
                placeholderTextColor="#555"
                value={tiktokHandle}
                onChangeText={setTiktokHandle}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.iconWrapper}>
                {isValidating ? (
                  <ActivityIndicator color="#888" />
                ) : validationResult ? (
                  validationResult.exists === true ? (
                    <CheckCircle2 color="#2ecc71" size={24} />
                  ) : validationResult.exists === false ? (
                    <XCircle color="#e74c3c" size={24} />
                  ) : (
                    <AlertCircle color="#f39c12" size={24} />
                  )
                ) : null}
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
}

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