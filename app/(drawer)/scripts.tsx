import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Plus,
  FileText,
} from 'lucide-react-native';

// Hooks
import { useScriptList } from '@/app/hooks/useScriptChat';

// Components
import ScriptActionsModal from '@/components/ScriptActionsModal';
import ScriptCard from '@/components/ScriptCard';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

export default function ScriptsScreen() {
  const { scripts, isLoading, error, loadScripts, deleteScript } =
    useScriptList();
  const [selectedScript, setSelectedScript] = useState<any | null>(null);
  const { scriptConversationsRemaining,  presentPaywall } = useRevenueCat();

  const handleCreateNewScript = async () => {
    if (!scriptConversationsRemaining) {
      const result = await presentPaywall();
      if (!result) {
        return;
      }
    }
    // Navigate to chat interface without scriptId (new script)
    router.push('/chat?new=true');
  };

  const handleEditScript = (scriptId: string) => {
    // Navigate to chat interface with scriptId (edit existing)
    router.push({
      pathname: '/chat',
      params: { scriptId },
    });
  };


  const handleScriptDeleted = async (scriptId?: string) => {
    if (!scriptId) return;
    try {
      await deleteScript(scriptId);
      // Close modal and reload scripts
      setSelectedScript(null);
      await loadScripts();
    } catch (error) {
      console.error('Error deleting script:', error);
    }
  };

  const handleScriptDuplicated = async (newScript: any) => {
    // Close modal and reload scripts
    setSelectedScript(null);
    await loadScripts();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement des scripts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadScripts()}
            tintColor="#007AFF"
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && (!scripts || scripts.length === 0) && (
          <View style={styles.emptyState}>
            <FileText size={64} color="#666" />
            <Text style={styles.emptyTitle}>Aucun script créé</Text>
            <Text style={styles.emptyDescription}>
              Commencez par créer votre premier script avec l&apos;IA
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateNewScript}
            >
              <Plus size={20} color="#007AFF" />
              <Text style={styles.emptyButtonText}>Créer un script</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Scripts List */}
        {scripts &&
          scripts.map((script, index) => (
            <ScriptCard
              key={script.id}
              script={script}
              onPress={() => handleEditScript(script.id)}
              onMorePress={() => setSelectedScript(script)}
            />
          ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCreateNewScript}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {/* Actions Modal */}
      <ScriptActionsModal
        script={selectedScript}
        visible={!!selectedScript}
        onClose={() => setSelectedScript(null)}
        onScriptDeleted={handleScriptDeleted}
        onScriptDuplicated={handleScriptDuplicated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
