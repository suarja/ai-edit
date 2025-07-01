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
import { useAuth } from '@clerk/clerk-expo';
import { API_ENDPOINTS } from '@/lib/config/api';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetUser } from '@/lib/hooks/useGetUser';
import { router } from 'expo-router';
import z from 'zod';
import { JobType } from '@/hooks/useAccountAnalysis';

// Local interface for clarity, though it's simpler now
export interface HandleValidationResult {
  exists: boolean;
  message: string;
  hasCompletedAnalysisForUser: boolean;
}

interface StartAnalysisScreenProps {
  onAnalysisStart: (job: JobType) => void;
}
/* {
      success: true,
      message: 'TikTok analysis started',
      data: {
        run_id: scrapingJob.id,
        status: scrapingJob.status,
        progress: scrapingJob.progress,
        tiktok_handle: cleanHandle,
        account_id: accountId, // 🆕 Include account_id in response
        started_at: scrapingJob.started_at
      }
    } */

      const ResponseSchema = z.object({
        success: z.boolean(),
        message: z.string(),
        data: z.object({
          run_id: z.string(),
          status: z.string(),
          progress: z.number(),
          tiktok_handle: z.string(),
          account_id: z.string(),
          started_at: z.string(),
        }),
      });

      type ResponseType = z.infer<typeof ResponseSchema>;
const StartAnalysisScreen: React.FC<StartAnalysisScreenProps> = ({ onAnalysisStart }) => {
  const { fetchUser } = useGetUser(); // Get userId from Clerk
  const { getToken } = useAuth();

  const [tiktokHandle, setTiktokHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    if (!tiktokHandle) {
      setSubmitError("Veuillez entrer un nom d'utilisateur TikTok.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
        const user = await fetchUser();
        if (!user) {
            setSubmitError("Utilisateur non trouvé.");
            router.push('/(auth)/sign-in');
            return;
        }
        // Step 1: Check for existing analysis silently
        const validationResponse = await fetch(API_ENDPOINTS.TIKTOK_ANALYSIS_VALIDATE(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await getToken()}`,
            },
            body: JSON.stringify({ tiktokHandle: tiktokHandle, userId: user.id }),
        });

        const validationData: HandleValidationResult = await validationResponse.json();

        if (validationData.hasCompletedAnalysisForUser) {
            // Step 2: If analysis exists, ask user if they want to overwrite
            Alert.alert(
                "Analyse Existante",
                "Vous avez déjà une analyse pour ce compte. Voulez-vous la remplacer ?",
                [
                    { text: "Annuler", style: "cancel", onPress: () => setIsSubmitting(false) },
                    { text: "Continuer", onPress: () => proceedWithAnalysis() }
                ]
            );
        } else {
            // Step 3: If no analysis exists, proceed directly
            proceedWithAnalysis();
        }
    } catch (err: any) {
        setSubmitError(err.message || "Une erreur de validation est survenue.");
        setIsSubmitting(false);
    }
  };

  const proceedWithAnalysis = async () => {
    // This function is now called after the check is complete
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

      const data: ResponseType = await response.json();
      const parsedData = ResponseSchema.safeParse(data);

      if (!parsedData.success) {
        throw new Error(parsedData.error.message || 'Failed to start analysis.');
      }

      console.log('🚀 Analysis started:', parsedData.data.data.run_id);
      onAnalysisStart(parsedData.data.data);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="logo-tiktok" size={32} color="#fff" />
          <Text style={styles.title}>Analyse TikTok</Text>
        </View>
        <Text style={styles.subtitle}>
          Lancez une analyse IA de n'importe quel compte TikTok pour obtenir des insights de croissance.
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.atSymbol}>@</Text>
          <TextInput
            style={styles.input}
            placeholder="nomdutilisateur"
            placeholderTextColor="#888"
            value={tiktokHandle}
            onChangeText={(text) => setTiktokHandle(text.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase())}
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor="#007AFF"
            onSubmitEditing={handleStartAnalysis}
            returnKeyType="go"
          />
        </View>
        <TouchableOpacity
          style={[styles.button, { opacity: isSubmitting || !tiktokHandle ? 0.5 : 1 }]}
          onPress={handleStartAnalysis}
          disabled={isSubmitting || !tiktokHandle}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Lancer l'analyse</Text>
          )}
        </TouchableOpacity>
        {submitError && <Text style={styles.errorText}>{submitError}</Text>}
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#A0A0A0',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
    color: '#888',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF453A',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default StartAnalysisScreen; 