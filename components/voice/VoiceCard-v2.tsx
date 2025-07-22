/**
 * 🎨 VoiceCard v2 - Migré vers la Palette Editia
 * 
 * MIGRATION:
 * ❌ Avant: 7 couleurs hardcodées (#007AFF, #fff, #888, #1a1a1a, #333, #10b981)
 * ✅ Après: Palette Editia cohérente avec design système
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Switch } from 'react-native';
import { VoiceConfig } from './VoiceScreen';
import { COLORS } from '@/lib/constants/colors'; // ✅ Import centralisé

type VoiceCardProps = {
  voice: VoiceConfig;
  selected: boolean;
  onSelect: () => void;
};

const VoiceCardV2: React.FC<VoiceCardProps> = ({ voice, selected, onSelect }) => {
  return (
    <View style={[styles.card, selected && styles.selected]}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{voice.voiceName}</Text>
        <Switch
          value={selected}
          onValueChange={onSelect}
          trackColor={{ 
            false: COLORS.surface.disabled, // #333333 → surface cohérente
            true: COLORS.interactive.primary // #FF0050 (Rouge Editia!)
          }}
          thumbColor={selected ? COLORS.text.primary : COLORS.text.disabled} // #FFFFFF : #808080
        />
      </View>
      {voice.description && (
        <Text style={styles.description}>{voice.description}</Text>
      )}
      {voice.isCloned && <Text style={styles.cloned}>Clonée</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  // ✅ Card avec design système cohérent
  card: {
    backgroundColor: COLORS.background.secondary, // #1a1a1a
    borderRadius: 12, // Plus moderne (8 → 12)
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: COLORS.shadow.neutral,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  // ✅ Selected state avec Rouge Editia
  selected: {
    borderColor: COLORS.interactive.primary, // #FF0050 (Rouge Editia!)
    shadowColor: COLORS.shadow.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  // ✅ Name avec couleur système
  name: {
    color: COLORS.text.primary, // #FFFFFF
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12, // Espacement du switch
  },
  
  // ✅ Description avec couleur cohérente
  description: {
    color: COLORS.text.tertiary, // #B0B0B0 (plus lisible que #888)
    fontSize: 13,
    marginTop: 2,
    marginBottom: 2,
    lineHeight: 18, // Meilleure lisibilité
  },
  
  // ✅ Cloned badge avec couleur succès
  cloned: {
    color: COLORS.status.success, // #00FF88 (Vert Editia!)
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default VoiceCardV2;

/**
 * 🎨 RÉSUMÉ DE LA MIGRATION VOICE CARD:
 * 
 * ✅ COULEURS MIGRÉES:
 * • borderColor selected: #007AFF → #FF0050 (Rouge Editia)
 * • Switch trackColor true: #007AFF → #FF0050 (Rouge Editia)  
 * • Switch trackColor false: #333 → COLORS.surface.disabled (#333333)
 * • Switch thumbColor selected: #fff → COLORS.text.primary (#FFFFFF)
 * • Switch thumbColor unselected: #888 → COLORS.text.disabled (#808080)
 * • backgroundColor: #1a1a1a → COLORS.background.secondary (#1a1a1a)
 * • name color: #fff → COLORS.text.primary (#FFFFFF)
 * • description color: #888 → COLORS.text.tertiary (#B0B0B0)
 * • cloned color: #10b981 → COLORS.status.success (#00FF88)
 * 
 * 🎯 AMÉLIORATIONS:
 * • BorderRadius: 8 → 12px (plus moderne)
 * • Shadows subtiles pour profondeur
 * • Selected state avec shadow colorée
 * • Line height améliorée pour description
 * • Margin right sur name pour espacement switch
 * • Font weight sur cloned badge
 * 
 * 7 couleurs hardcodées → Interface Voice cohérente Editia ✨
 */