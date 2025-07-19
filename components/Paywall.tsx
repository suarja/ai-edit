import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { usePaywall } from '@/components/hooks/usePaywall';
import { paywallStyles } from '@/lib/utils/styles/paywall.styles';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseComplete?: (success: boolean) => void;
}

export const Paywall: React.FC<PaywallProps> = ({
  visible,
  onClose,
  onPurchaseComplete,
}) => {
  const { currentPlan } = useRevenueCat();

  const {
    loading,
    purchasing,
    billingPeriod,
    plansData,
    setBillingPeriod,
    handlePurchase,
    handleRestore,
    setSelectedPackage,
  } = usePaywall({
    visible,
    onClose,
    onPurchaseComplete,
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={paywallStyles.container} edges={['top']}>
        <View style={paywallStyles.background}>
          {/* Header */}
          <View style={paywallStyles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={paywallStyles.closeButton}
              disabled={purchasing}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={paywallStyles.content}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={paywallStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={paywallStyles.loadingText}>
                  Chargement des forfaits...
                </Text>
              </View>
            ) : (
              <>
                {/* Hero Section - Proposition de valeur claire */}
                <View style={paywallStyles.heroSection}>
                  <View style={paywallStyles.iconContainer}>
                    <Ionicons name="diamond" size={60} color="#007AFF" />
                  </View>
                  <Text style={paywallStyles.title}>
                    Débloquez toutes les fonctionnalités
                  </Text>
                  <Text style={paywallStyles.subtitle}>
                    Générez des vidéos illimitées avec votre voix clonée et des
                    outils avancés
                  </Text>
                </View>

                {/* Billing Toggle */}
                <View style={paywallStyles.billingToggleContainer}>
                  <Text style={paywallStyles.billingLabel}>
                    Choisissez votre période de facturation
                  </Text>
                  <View style={paywallStyles.billingToggle}>
                    <TouchableOpacity
                      style={[
                        paywallStyles.toggleOption,
                        billingPeriod === 'monthly' &&
                          paywallStyles.toggleOptionActive,
                      ]}
                      onPress={() => setBillingPeriod('monthly')}
                    >
                      <Text
                        style={[
                          paywallStyles.toggleText,
                          billingPeriod === 'monthly' &&
                            paywallStyles.toggleTextActive,
                        ]}
                      >
                        Mensuel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        paywallStyles.toggleOption,
                        billingPeriod === 'annually' &&
                          paywallStyles.toggleOptionActive,
                      ]}
                      onPress={() => setBillingPeriod('annually')}
                    >
                      <Text
                        style={[
                          paywallStyles.toggleText,
                          billingPeriod === 'annually' &&
                            paywallStyles.toggleTextActive,
                        ]}
                      >
                        Annuel
                      </Text>
                      <View style={paywallStyles.savingsBadge}>
                        <Text style={paywallStyles.savingsText}>
                          Économisez 25%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Plans */}
                <View style={paywallStyles.plansContainer}>
                  {plansData.map((plan) => {
                    const isCurrentPlan = currentPlan === plan.id;

                    return (
                      <View
                        key={plan.id}
                        style={[
                          paywallStyles.planCard,
                          plan.isFeatured && paywallStyles.featuredPlan,
                          isCurrentPlan && paywallStyles.currentPlan,
                        ]}
                      >
                        {plan.isFeatured && (
                          <View style={paywallStyles.featuredBadge}>
                            <Text style={paywallStyles.featuredText}>
                              Recommandé
                            </Text>
                          </View>
                        )}

                        {isCurrentPlan && (
                          <View style={paywallStyles.currentPlanBadge}>
                            <Text style={paywallStyles.currentPlanText}>
                              Plan actuel
                            </Text>
                          </View>
                        )}

                        <Text style={paywallStyles.planTitle}>
                          {plan.title}
                        </Text>

                        {/* Prix clairement affiché avec coût par période */}
                        {plan.id === 'free' ? (
                          <Text style={paywallStyles.planPrice}>Gratuit</Text>
                        ) : (
                          <View style={paywallStyles.priceContainer}>
                            <Text style={paywallStyles.planPrice}>
                              {plan.price}
                            </Text>
                            <Text style={paywallStyles.periodText}>
                              {billingPeriod === 'annually'
                                ? 'par an'
                                : 'par mois'}
                            </Text>
                            {billingPeriod === 'annually' && plan.package && (
                              <Text style={paywallStyles.pricePerMonth}>
                                soit {plan.package.product.pricePerMonthString}
                                /mois
                              </Text>
                            )}
                          </View>
                        )}

                        <View style={paywallStyles.featuresList}>
                          {plan.features.map((feature, index) => (
                            <View key={index} style={paywallStyles.featureItem}>
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#10b981"
                                style={paywallStyles.featureIcon}
                              />
                              <Text style={paywallStyles.featureText}>
                                {feature}
                              </Text>
                            </View>
                          ))}
                        </View>

                        {plan.id !== 'free' && plan.package && (
                          <TouchableOpacity
                            style={[
                              paywallStyles.selectButton,
                              isCurrentPlan && paywallStyles.currentPlanButton,
                            ]}
                            onPress={() => {
                              setSelectedPackage(plan.package);
                              handlePurchase(plan.package!);
                            }}
                            disabled={purchasing || isCurrentPlan}
                          >
                            {purchasing ? (
                              <ActivityIndicator color="white" size="small" />
                            ) : (
                              <Text style={paywallStyles.selectButtonText}>
                                {isCurrentPlan
                                  ? 'Plan actuel'
                                  : `S&apos;abonner à ${plan.title}`}
                              </Text>
                            )}
                          </TouchableOpacity>
                        )}

                        {plan.id === 'free' && (
                          <TouchableOpacity
                            style={paywallStyles.freeButton}
                            onPress={onClose}
                          >
                            <Text style={paywallStyles.freeButtonText}>
                              Continuer avec le plan gratuit
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Bouton Restaurer les Achats - Exigence non négociable */}
                <TouchableOpacity
                  style={paywallStyles.restoreButton}
                  onPress={handleRestore}
                  disabled={purchasing}
                >
                  <Text style={paywallStyles.restoreButtonText}>
                    Restaurer les achats
                  </Text>
                </TouchableOpacity>

                {/* Informations sur le renouvellement automatique - Exigence Apple */}
                <Text style={paywallStyles.termsText}>
                  L&apos;abonnement se renouvelle automatiquement sauf s&apos;il
                  est annulé. Annulez à tout moment dans les Réglages de votre
                  appareil.
                </Text>

                {/* Liens vers les politiques - Conformité légale */}
                <View style={paywallStyles.policiesContainer}>
                  <TouchableOpacity
                    style={paywallStyles.policyLink}
                    onPress={() => {
                      Linking.openURL('https://editia.app/privacy-policy');
                    }}
                  >
                    <Text style={paywallStyles.policyLinkText}>
                      Politique de confidentialité
                    </Text>
                  </TouchableOpacity>

                  <Text style={paywallStyles.policySeparator}>•</Text>

                  <TouchableOpacity
                    style={paywallStyles.policyLink}
                    onPress={() => {
                      Linking.openURL('https://editia.app/payment-policy');
                    }}
                  >
                    <Text style={paywallStyles.policyLinkText}>
                      Politique de paiement
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
