import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

interface CustomPaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseComplete?: (success: boolean) => void;
}

const { width, height } = Dimensions.get('window');

export const CustomPaywall: React.FC<CustomPaywallProps> = ({
  visible,
  onClose,
  onPurchaseComplete,
}) => {
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      if (currentOffering) {
        setOffering(currentOffering);
        // Pre-select the monthly package if available
        const monthlyPackage =
          currentOffering.monthly || currentOffering.availablePackages[0];
        setSelectedPackage(monthlyPackage);
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
      Alert.alert(
        'Error',
        'Failed to load subscription plans. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(true);

      const purchaseResult = await Purchases.purchasePackage(packageToPurchase);

      if (purchaseResult.customerInfo.entitlements.active['Pro']) {
        Alert.alert('Success!', 'Welcome to AI Edit Pro! 🎉');
        onPurchaseComplete?.(true);
        onClose();
      }
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('Purchase was cancelled by user');
        // Just close the paywall, no error alert needed
        onClose();
      } else {
        console.error('Purchase failed:', error);
        Alert.alert(
          'Purchase Failed',
          'Something went wrong. Please try again.'
        );
        onPurchaseComplete?.(false);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      const restoreResult = await Purchases.restorePurchases();

      if (restoreResult.entitlements.active['Pro']) {
        Alert.alert('Restored!', 'Your Pro subscription has been restored! 🎉');
        onPurchaseComplete?.(true);
        onClose();
      } else {
        Alert.alert(
          'No Purchases Found',
          'No active subscriptions found to restore.'
        );
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again.'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const formatPrice = (packageInfo: PurchasesPackage) => {
    return packageInfo.product.priceString;
  };

  const getPackageDescription = (packageInfo: PurchasesPackage) => {
    const identifier = packageInfo.identifier.toLowerCase();
    if (identifier.includes('month')) return 'per month';
    if (identifier.includes('year')) return 'per year';
    if (identifier.includes('week')) return 'per week';
    return 'one-time';
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#a855f7']}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={purchasing}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : (
              <>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="diamond" size={60} color="white" />
                  </View>
                  <Text style={styles.title}>Upgrade to AI Edit Pro</Text>
                  <Text style={styles.subtitle}>
                    Unlock unlimited video generation and premium features
                  </Text>
                </View>

                {/* Features */}
                <View style={styles.featuresSection}>
                  <FeatureItem
                    icon="videocam"
                    text="Generate up to 30 videos per month"
                  />
                  <FeatureItem
                    icon="flash"
                    text="Priority processing & faster generation"
                  />
                  <FeatureItem
                    icon="color-palette"
                    text="Access to premium templates & styles"
                  />
                  <FeatureItem
                    icon="headset"
                    text="Priority customer support"
                  />
                </View>

                {/* Packages */}
                {offering && (
                  <View style={styles.packagesSection}>
                    {offering.availablePackages.map((pkg, index) => (
                      <TouchableOpacity
                        key={pkg.identifier}
                        style={[
                          styles.packageCard,
                          selectedPackage?.identifier === pkg.identifier &&
                            styles.selectedPackage,
                        ]}
                        onPress={() => setSelectedPackage(pkg)}
                        disabled={purchasing}
                      >
                        <View style={styles.packageInfo}>
                          <Text style={styles.packageTitle}>
                            {pkg.product.title}
                          </Text>
                          <Text style={styles.packagePrice}>
                            {formatPrice(pkg)} {getPackageDescription(pkg)}
                          </Text>
                        </View>
                        {selectedPackage?.identifier === pkg.identifier && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#10b981"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                  <TouchableOpacity
                    style={[
                      styles.subscribeButton,
                      (!selectedPackage || purchasing) && styles.disabledButton,
                    ]}
                    onPress={() =>
                      selectedPackage && handlePurchase(selectedPackage)
                    }
                    disabled={!selectedPackage || purchasing}
                  >
                    {purchasing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.subscribeButtonText}>
                        Start Pro Subscription
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.restoreButton}
                    onPress={handleRestore}
                    disabled={purchasing}
                  >
                    <Text style={styles.restoreButtonText}>
                      Restore Purchases
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text style={styles.termsText}>
                  Subscriptions automatically renew unless cancelled. Cancel
                  anytime in Settings.
                </Text>
              </>
            )}
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const FeatureItem: React.FC<{ icon: any; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Ionicons name={icon} size={24} color="white" style={styles.featureIcon} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
  },
  packagesSection: {
    marginBottom: 32,
  },
  packageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPackage: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionsSection: {
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  restoreButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
