import React, { useState } from 'react';
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
import { BarChart3, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';
import { router } from 'expo-router';

// Make the screen accept props to control its state externally
interface StartAnalysisScreenProps {
  isLoading: boolean;
  error: string | null;
  refreshAnalysis: () => void;
}

export default function StartAnalysisScreen({ isLoading, error: initialError, refreshAnalysis }: StartAnalysisScreenProps) {
  const { getToken } = useAuth();
  const [tiktokHandle, setTiktokHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
            <TextInput
              style={styles.input}
              placeholder="@username"
              placeholderTextColor="#555"
              value={tiktokHandle}
              onChangeText={setTiktokHandle}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {submitError && <Text style={styles.errorText}>{submitError}</Text>}

            <TouchableOpacity 
              style={[styles.button, isSubmitting && styles.buttonDisabled]} 
              onPress={handleStartAnalysis}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Lancer l'analyse</Text>
                  <ChevronRight size={20} color="#fff" />
                </>
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
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
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
  errorText: {
    color: '#ff5555',
    textAlign: 'center',
    marginBottom: 12,
  },
}); 