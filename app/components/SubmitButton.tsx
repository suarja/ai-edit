import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Send, Crown } from 'lucide-react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

type SubmitButtonProps = {
  onSubmit: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
  showWatermarkInfo?: boolean;
  onUpgradePress?: () => void;
};

const SubmitButton: React.FC<SubmitButtonProps> = ({
  onSubmit,
  isSubmitting,
  isDisabled,
  showWatermarkInfo = false,
  onUpgradePress,
}) => {
  if (showWatermarkInfo && onUpgradePress) {
    // Design avec deux boutons alignés pour les utilisateurs gratuits
    return (
      <View style={styles.container}>
        <View style={styles.dualButtonContainer}>
          <TouchableOpacity
            style={[styles.generateButton, styles.generateButtonWithWatermark, isDisabled && styles.generateButtonDisabled]}
            onPress={onSubmit}
            disabled={isSubmitting || isDisabled}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.generateButtonText}>Génération...</Text>
              </>
            ) : (
              <>
                <Send size={18} color="#fff" />
                <Text style={styles.generateButtonText}>Générer</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgradePress}
          >
            <Crown size={18} color={SHARED_STYLE_COLORS.background} />
            <Text style={styles.upgradeButtonText}>Pro</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.watermarkInfoText}>
          📹 Vidéo avec filigrane Editia
        </Text>
      </View>
    );
  }

  // Design classique pour les utilisateurs payants
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.generateButton,
          (isSubmitting || isDisabled) && styles.generateButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitting || isDisabled}
      >
        {isSubmitting ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.generateButtonText}>
              Génération en cours...
            </Text>
          </>
        ) : (
          <>
            <Send size={20} color="#fff" />
            <Text style={styles.generateButtonText}>Générer la Vidéo</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#000',
  },
  dualButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: SHARED_STYLE_COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  generateButtonWithWatermark: {
    flex: 1,
  
  },
  generateButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: SHARED_STYLE_COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: SHARED_STYLE_COLORS.success,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 80,
  },
  upgradeButtonText: {
    color: SHARED_STYLE_COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  watermarkInfoText: {
    color: '#999',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default SubmitButton;
