import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
import { Plan, PlanIdentifier } from '@/lib/types/revenueCat';

type BillingPeriod = 'monthly' | 'annually';

interface UsePaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseComplete?: (success: boolean) => void;
}

interface PlanData {
  id: PlanIdentifier;
  title: string;
  price: string;
  isFeatured: boolean;
  features: string[];
  package: PurchasesPackage | null;
}

export const usePaywall = ({
  visible,
  onClose,
  onPurchaseComplete,
}: UsePaywallProps) => {
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  const { offerings, plans, currentPlan, hasOfferingError, isDevMode } =
    useRevenueCat();

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      // Les offerings sont déjà chargés via le contexte RevenueCat
      setLoading(false);
    } catch (error) {
      console.error('Failed to load offerings:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les forfaits. Veuillez réessayer.'
      );
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(true);

      const purchaseResult = await Purchases.purchasePackage(packageToPurchase);

      if (
        purchaseResult.customerInfo.entitlements.active['Pro'] ||
        purchaseResult.customerInfo.entitlements.active['Creator']
      ) {
        Alert.alert('Succès !', 'Votre abonnement a été activé ! 🎉');
        onPurchaseComplete?.(true);
        onClose();
      }
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('Purchase was cancelled by user');
        onClose();
      } else {
        console.error('Purchase failed:', error);
        Alert.alert(
          'Achat échoué',
          "Une erreur s'est produite. Veuillez réessayer."
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

      if (
        restoreResult.entitlements.active['Pro'] ||
        restoreResult.entitlements.active['Creator']
      ) {
        Alert.alert('Restauré !', 'Votre abonnement a été restauré ! 🎉');
        onPurchaseComplete?.(true);
        onClose();
      } else {
        Alert.alert(
          'Aucun achat trouvé',
          'Aucun abonnement actif à restaurer.'
        );
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert(
        'Restauration échouée',
        'Impossible de restaurer les achats. Veuillez réessayer.'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const getPackageForPlan = (
    planId: PlanIdentifier,
    period: BillingPeriod
  ): PurchasesPackage | null => {
    if (!offerings?.all) return null;

    // Mapping des plans vers les offerings
    const offeringMap = {
      'creator': 'Creator Offerings',
      'pro': 'default',
    };

    const offeringKey = offeringMap[planId];
    if (!offeringKey) return null;

    const offering = offerings.all[offeringKey];
    if (!offering) return null;

    // Récupérer le package selon la période
    if (period === 'monthly') {
      return offering.monthly || null;
    } else {
      return offering.annual || null;
    }
  };

  const getPackagePrice = (pkg: PurchasesPackage | null): string => {
    if (!pkg) return 'Non disponible';
    
    // Utiliser le prix formaté de RevenueCat
    return pkg.product.priceString;
  };

  const getPlanFeatures = (planId: PlanIdentifier): string[] => {
    const plan = plans?.[planId];
    if (!plan) return [];

    const features = [];

    if (plan.videos_generated_limit === -1) {
      features.push('Vidéos illimitées');
    } else {
      features.push(`${plan.videos_generated_limit} vidéos par mois`);
    }

    if (plan.source_videos_limit === -1) {
      features.push('Vidéos sources illimitées');
    } else {
      features.push(`${plan.source_videos_limit} vidéos sources`);
    }

    if (plan.voice_clones_limit > 0) {
      features.push(
        `${plan.voice_clones_limit} clone${
          plan.voice_clones_limit > 1 ? 's' : ''
        } vocal${plan.voice_clones_limit > 1 ? 'aux' : ''}`
      );
    }

    if (plan.account_analysis_limit > 0) {
      features.push(
        `${plan.account_analysis_limit} analyse${
          plan.account_analysis_limit > 1 ? 's' : ''
        } de compte`
      );
    }

    // Ajouter des fonctionnalités spécifiques selon le plan
    if (planId === 'creator') {
      features.push('Traitement prioritaire');
      features.push('Modèles premium');
    } else if (planId === 'pro') {
      features.push('Traitement prioritaire');
      features.push('Tous les modèles');
      features.push('Support prioritaire');
      features.push('Analyses avancées');
    }

    return features;
  };

  // Générer les plans dynamiquement avec les vraies données RevenueCat
  const getPlansData = (): PlanData[] => {
    const plansData = [
      {
        id: 'free' as PlanIdentifier,
        title: 'Découverte',
        price: 'Gratuit',
        isFeatured: false,
        features: getPlanFeatures('free'),
        package: null,
      },
      {
        id: 'creator' as PlanIdentifier,
        title: 'Créateur',
        isFeatured: true,
        features: getPlanFeatures('creator'),
        package: getPackageForPlan('creator', billingPeriod),
      },
      {
        id: 'pro' as PlanIdentifier,
        title: 'Pro',
        isFeatured: false,
        features: getPlanFeatures('pro'),
        package: getPackageForPlan('pro', billingPeriod),
      },
    ];

    // Ajouter les prix dynamiques
    return plansData.map(plan => ({
      ...plan,
      price: plan.id === 'free' ? 'Gratuit' : getPackagePrice(plan.package),
    }));
  };

  const plansData = getPlansData();

  return {
    // State
    loading,
    purchasing,
    selectedPackage,
    billingPeriod,
    plansData,
    
    // Actions
    setBillingPeriod,
    handlePurchase,
    handleRestore,
    setSelectedPackage,
  };
}; 