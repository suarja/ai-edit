import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X, LucideIcon } from 'lucide-react-native';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';

export interface FeatureItem {
  icon: React.ReactElement<LucideIcon>;
  text: string;
}

interface StandardFeatureLockProps {
  featureIcon: React.ReactElement<LucideIcon>;
  featureTitle: string;
  featureDescription: string;
  features: FeatureItem[];
  requiredPlan: 'creator' | 'pro';
  onUnlock?: () => void;
  showCloseButton?: boolean;
}

export const StandardFeatureLock: React.FC<StandardFeatureLockProps> = ({
  featureIcon,
  featureTitle,
  featureDescription,
  features,
  requiredPlan,
  onUnlock,
  showCloseButton = true,
}) => {
  const { presentPaywall } = useRevenueCat();

  const handleUnlock = () => {
    if (onUnlock) {
      onUnlock();
    } else {
      presentPaywall();
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const planDisplayName = requiredPlan === 'creator' ? 'Créateur' : 'Pro';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {showCloseButton && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={24} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContent}>
          {/* Feature Icon */}
          <View style={styles.iconContainer}>
              {React.cloneElement(featureIcon)}
          </View>

          {/* Title */}
          <Text style={styles.title}>{featureTitle}</Text>

          {/* Description */}
          <Text style={styles.description}>{featureDescription}</Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                {React.cloneElement(feature.icon)}
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* Upgrade Button */}
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUnlock}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>
              Débloquer avec le Plan {planDisplayName}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SHARED_STYLE_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  closeButton: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 100,
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SHARED_STYLE_COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: SHARED_STYLE_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 40,
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: SHARED_STYLE_COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 250,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});