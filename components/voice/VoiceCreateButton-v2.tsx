/**
 * 🎨 VoiceCreateButton v2 - Migré vers la Palette Editia
 * 
 * MIGRATION:
 * ❌ Avant: #007AFF (bleu), #fff, styles hardcodés
 * ✅ Après: Utilise Button UI component avec Rouge Editia (#FF0050)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button'; // ✅ Utilise le composant UI migré
import { Plus } from 'lucide-react-native';
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

type VoiceCreateButtonProps = {
  onCreate: () => void;
};

const VoiceCreateButtonV2: React.FC<VoiceCreateButtonProps> = ({ onCreate }) => (
  <View style={styles.container}>
    <Button 
      variant="primary"
      onPress={onCreate}
      size="large"
      icon={<Plus size={20} color={COLORS.text.primary} />}
    >
      Créer une voix personnalisée
    </Button>
  </View>
);

const styles = StyleSheet.create({
  // ✅ Container avec padding cohérent
  container: {
    padding: 20,
    paddingTop: 16,
  },
});

export default VoiceCreateButtonV2;

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VOICE CREATE BUTTON:
 * 
 * ✅ CHANGEMENTS PRINCIPAUX:
 * • TouchableOpacity + styles hardcodés → Button UI component
 * • backgroundColor: #007AFF → COLORS.interactive.primary (#FF0050) via Button variant
 * • color: #fff → COLORS.text.primary via Button variant
 * • Ajout icône Plus cohérente avec design système
 * 
 * 🎯 AMÉLIORATIONS:
 * • Utilise le système de variants (primary)
 * • Size large pour meilleure accessibilité
 * • Container padding cohérent
 * • Icon Plus intégrée pour meilleur UX
 * 
 * 2 couleurs hardcodées → Composant UI système cohérent ✨
 */