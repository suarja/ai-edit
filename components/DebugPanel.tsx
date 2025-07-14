import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bug, Wand as Wand2, AlertCircle } from 'lucide-react-native';

const DebugPanel: React.FC = () => {
  const router = useRouter();
  const [testingPrompt, setTestingPrompt] = useState('');
  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [testingError, setTestingError] = useState<string | null>(null);
  const [testingLoading, setTestingLoading] = useState(false);

  // Placeholder for video generation debug action
  const handleGenerateVideoTest = async () => {
    setTestingLoading(true);
    setTestingStatus(null);
    setTestingError(null);
    setTimeout(() => {
      setTestingStatus('Vidéo test générée (simulation)');
      setTestingLoading(false);
    }, 1200);
  };

  return (
    <View style={styles.debugContainer}>
      <Text style={styles.debugTitle}>Débogage</Text>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => router.push('/(onboarding)/welcome')}
      >
        <View style={styles.settingInfo}>
          <Bug size={24} color="#fff" />
          <Text style={styles.settingText}>Tester le Flux d&apos;Accueil</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Tester la Génération Vidéo</Text>
        <TextInput
          style={styles.debugInput}
          placeholder="Entrez une description test..."
          placeholderTextColor="#666"
          value={testingPrompt}
          onChangeText={setTestingPrompt}
          multiline
          numberOfLines={3}
        />
        {testingError && (
          <View style={styles.debugError}>
            <AlertCircle size={16} color="#ef4444" />
            <Text style={styles.debugErrorText}>{testingError}</Text>
          </View>
        )}
        {testingStatus && (
          <View style={styles.debugStatus}>
            <Text style={styles.debugStatusText}>{testingStatus}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.debugButton,
            testingLoading && styles.debugButtonDisabled,
          ]}
          onPress={handleGenerateVideoTest}
          disabled={testingLoading}
        >
          {testingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Wand2 size={20} color="#fff" />
              <Text style={styles.debugButtonText}>Générer une Vidéo Test</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  debugContainer: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
    marginBottom: 24,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4b5563',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
  },
  debugInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  debugError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1116',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  debugErrorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  debugStatus: {
    backgroundColor: '#042f2e',
    padding: 12,
    borderRadius: 8,
  },
  debugStatusText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  debugButtonDisabled: {
    opacity: 0.7,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DebugPanel;
