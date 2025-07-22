/**
 * 🎨 Scripts Screen v2 - Migré vers la Palette Editia
 * 
 * MIGRATION PHASE 3:
 * ❌ Avant: 28 couleurs hardcodées pour écran de gestion des scripts
 * ✅ Après: Interface cohérente avec palette Editia (#FF0050, #FFD700, #00FF88, #007AFF)
 */

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
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

export default function ScriptsScreen() {
  const { scripts, isLoading, error, loadScripts, deleteScript } =
    useScriptList();
  const [selectedScript, setSelectedScript] = useState<any | null>(null);
  const { scriptConversationsRemaining, presentPaywall } = useRevenueCat();

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
          <ActivityIndicator size="large" color={COLORS.interactive.primary} />
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
            tintColor={COLORS.interactive.primary} // ✅ Rouge Editia pour pull-to-refresh
          />
        }
      >
        {/* ✅ Error container avec design système cohérent */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        )}

        {/* ✅ Empty State avec design moderne */}
        {!isLoading && (!scripts || scripts.length === 0) && (
          <View style={styles.emptyState}>
            <FileText size={64} color={COLORS.text.muted} />
            <Text style={styles.emptyTitle}>Aucun script créé</Text>
            <Text style={styles.emptyDescription}>
              Commencez par créer votre premier script avec l&apos;IA
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateNewScript}
              activeOpacity={0.8}
            >
              <Plus size={20} color={COLORS.interactive.primary} />
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

      {/* ✅ Floating Action Button avec Rouge Editia */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleCreateNewScript}
        activeOpacity={0.8}
      >
        <Plus size={24} color={COLORS.text.primary} />
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
  // ✅ Container principal
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary, // #000000
  },
  
  // ✅ Header styles cohérents (non utilisés mais préparés)
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.divider, // #333333
  },
  
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface.divider,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary, // #FFFFFF
  },
  
  subtitle: {
    fontSize: 16,
    color: COLORS.text.tertiary, // #B0B0B0 (plus lisible que #888)
    marginTop: 4,
  },
  
  createButton: {
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // ✅ Content
  content: {
    flex: 1,
    padding: 20,
  },
  
  // ✅ Loading state avec couleur cohérente
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  
  loadingText: {
    color: COLORS.text.tertiary, // #B0B0B0
    fontSize: 16,
  },
  
  // ✅ Error container avec design système
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)', // Error background système
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)', // Error border système
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  
  errorText: {
    color: COLORS.status.error, // #FF3B30
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // ✅ Empty state moderne et engageant
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
  },
  
  emptyDescription: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  
  // ✅ Empty button avec design cohérent
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.interactive.primaryBackground, // rgba(255, 0, 80, 0.12)
    borderWidth: 1,
    borderColor: COLORS.interactive.primaryBorder, // rgba(255, 0, 80, 0.3)
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    minHeight: 48, // Touch target accessible
  },
  
  emptyButtonText: {
    color: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    fontSize: 16,
    fontWeight: '600',
  },
  
  // ✅ Floating Action Button avec Rouge Editia
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow.primary, // Shadow colorée
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8, // Shadow plus douce
    elevation: 8,
  },
});

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION SCRIPTS SCREEN:
 * 
 * ✅ COULEURS PRINCIPALES MIGRÉES:
 * • #007AFF (bleu) → #FF0050 (Rouge Editia) pour FAB, boutons, et interactions
 * • #FF3B30 → Maintenu comme couleur d'erreur système cohérente
 * • #888/#666 → Hiérarchie cohérente (#B0B0B0, #666666)
 * • #000 → COLORS.shadow.primary pour shadows colorées
 * • Pull-to-refresh en Rouge Editia pour cohérence
 * 
 * 📝 AMÉLIORATIONS ÉCRAN SCRIPTS:
 * • FAB (Floating Action Button) en Rouge Editia avec shadow colorée
 * • Empty state avec icône et bouton cohérents
 * • Error container avec design système (background + border)
 * • Loading indicator en Rouge Editia
 * • Touch targets accessibles (48px minimum)
 * 
 * 🚀 NOUVEAUTÉS:
 * • Empty button avec background primaire transparente et border colorée
 * • Shadows colorées sur tous les éléments interactifs
 * • ActiveOpacity={0.8} pour feedback tactile cohérent
 * • Line heights améliorées pour lisibilité
 * 
 * 28 couleurs hardcodées → Interface de scripts cohérente Editia ✨
 */