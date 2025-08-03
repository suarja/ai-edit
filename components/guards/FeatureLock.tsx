import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

type RequiredPlan = 'creator' | 'pro';
const planOrder: RequiredPlan[] = ['creator', 'pro'];

interface FeatureLockProps {
  children: React.ReactNode;
  requiredPlan: RequiredPlan;
  showAsDisabled?: boolean;
  onLockPress?: () => void;
}

export const FeatureLock: React.FC<FeatureLockProps> = ({
  children,
  requiredPlan,
  showAsDisabled = false,
  onLockPress,
}) => {
  const { currentPlan, presentPaywall } = useRevenueCat();

  // Debug logs
  console.log('🔒 FeatureLock Debug:', {
    currentPlan,
    requiredPlan,
    planOrder,
    hasChildren: !!children,
    showAsDisabled,
    onLockPress: !!onLockPress,
  });

  const currentUserLevel = planOrder.indexOf(currentPlan as any);
  const requiredLevel = planOrder.indexOf(requiredPlan);
  const hasAccess = currentUserLevel >= requiredLevel;

  console.log('🔒 Access Check:', {
    currentUserLevel,
    requiredLevel,
    hasAccess,
  });

  // Si l'utilisateur a accès, afficher le contenu normalement
  if (hasAccess) {
    return <>{children}</>;
  }

  // Si on doit afficher comme désactivé
  if (showAsDisabled) {
    return (
      <TouchableOpacity onPress={onLockPress || presentPaywall}>
        <View style={styles.disabledContent}>{children}</View>
      </TouchableOpacity>
    );
  }

  // Sinon, afficher le lock screen
  console.log('🔒 Showing lock screen content');
  return (
    <View style={styles.container}>
      {/* Bouton de fermeture discret en haut à droite */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          console.log('🔒 Close button pressed, navigating to root');
          router.push('/');
        }}
      >
        <X size={20} color="#888" />
      </TouchableOpacity>

      {/* Contenu du lock screen - afficher directement les children */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  disabledContent: {
    opacity: 0.5,
  },
  closeButton: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 100,
    padding: 10,
    position: 'absolute',
    top: 50, // Adjusted for SafeAreaView
    right: 20,
    zIndex: 9999,
    elevation: 10, // For Android shadow/layering
  },
});
