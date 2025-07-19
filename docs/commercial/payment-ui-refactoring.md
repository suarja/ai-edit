# Plan de Refactoring de l'UI de Paiement et Gating (Version Détaillée)

## 1. Objectif

Ce document détaille le plan d'action pour refactoriser l'interface utilisateur (UI) liée à la monétisation. L'objectif est de **consolider les composants**, **clarifier le parcours utilisateur**, **harmoniser l'expérience de "gating"** et **optimiser le taux de conversion** en présentant nos offres de manière cohérente et attrayante.

## 2. Principes Directeurs

1.  **Un seul Paywall :** Un composant `Paywall.tsx` modulaire.
2.  **Un seul Gating Lock :** Un composant `FeatureLock.tsx` générique.
3.  **Clarté des Limites :** L'utilisateur sait toujours où il en est.
4.  **Conversion Contextuelle :** Proposer la bonne offre au bon moment.

---

## 3. Plan d'Action par Composant (Avec Exemples)

### 3.1. Consolidation du Paywall (`Paywall.tsx`)

Ce composant devient le point d'entrée unique pour tous les abonnements.

**Logique Clé :**
- Il récupère les offres de RevenueCat.
- Il affiche les 3 plans côte à côte.
- Il gère un ��tat pour le sélecteur `mensuel/annuel`.

**Exemple de Structure (Pseudo-code JSX) :**
```tsx
// components/Paywall.tsx

const Paywall = ({ visible, onClose }) => {
  const { currentOffering } = useRevenueCat();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');

  const plansData = [
    { id: 'free', title: 'Découverte', price: 'Gratuit', features: [...] },
    { id: 'creator', title: 'Créateur', isFeatured: true, features: [...] },
    { id: 'pro', title: 'Pro', features: [...] }
  ];

  const handlePurchase = (pkg: PurchasesPackage) => { /* ... */ };

  return (
    <Modal>
      {/* ... Header avec bouton de fermeture ... */}
      <BillingToggle selected={billingPeriod} onSelect={setBillingPeriod} />
      
      <View style={styles.plansContainer}>
        {plansData.map(plan => {
          // Trouve le bon package (mensuel/annuel) dans l'offre de RevenueCat
          const rcPackage = findPackageForPlan(currentOffering, plan.id, billingPeriod);
          
          return (
            <PlanCard 
              key={plan.id}
              plan={plan}
              rcPackage={rcPackage}
              onPress={() => handlePurchase(rcPackage)}
              isFeatured={plan.isFeatured}
            />
          );
        })}
      </View>
    </Modal>
  );
};
```

### 3.2. Refactoring du Gating (`FeatureLock.tsx`)

Ce composant devient un "wrapper" qui bloque l'accès à une fonctionnalité.

**Logique Clé :**
- Il compare le plan requis avec le plan actuel de l'utilisateur.
- Il peut soit cacher complètement son contenu (`children`), soit l'afficher de manière désactivée.

**Exemple d'Implémentation :**
```tsx
// components/guards/FeatureLock.tsx

import { useRevenueCat } from '@/contexts/providers/RevenueCat';

type RequiredPlan = 'creator' | 'pro';
const planOrder: RequiredPlan[] = ['creator', 'pro'];

interface FeatureLockProps {
  children: React.ReactNode;
  requiredPlan: RequiredPlan;
  // Optionnel: pour afficher une version désactivée au lieu de rien
  showAsDisabled?: boolean; 
  onLockPress?: () => void; // Pour afficher le paywall
}

export const FeatureLock = ({ children, requiredPlan, showAsDisabled, onLockPress }: FeatureLockProps) => {
  const { currentPlan } = useRevenueCat(); // 'decouverte', 'createur', 'pro'

  const currentUserLevel = planOrder.indexOf(currentPlan as any); // -1 si 'decouverte'
  const requiredLevel = planOrder.indexOf(requiredPlan);

  const hasAccess = currentUserLevel >= requiredLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showAsDisabled) {
    return (
      <TouchableOpacity onPress={onLockPress}>
        <View style={{ opacity: 0.5 }}>
          {children}
        </View>
      </TouchableOpacity>
    );
  }

  // Par défaut, ne rien afficher ou afficher un placeholder
  return null; 
};
```
**Exemple d'Utilisation :**
```tsx
// Dans la page de gestion des voix
<FeatureLock requiredPlan="pro" onLockPress={presentPaywall}>
  <Button title="Ajouter une deuxième voix" onPress={addSecondVoice} />
</FeatureLock>
```

### 3.3. Mise à jour du `SubscriptionManager.tsx`

**Logique Clé :**
- Afficher l'état actuel et les compteurs.
- Proposer l'action d'upgrade la plus pertinente.

**Exemple de Logique de Rendu :**
```tsx
// components/SubscriptionManager.tsx

const SubscriptionManager = () => {
  const { currentPlan, videosRemaining, analysesRemaining, presentPaywall } = useRevenueCat();

  const renderContent = () => {
    switch (currentPlan) {
      case 'pro':
        return <Text>Vous êtes un membre Pro. Merci !</Text>;
      
      case 'creator':
        return (
          <>
            <Text>Plan Créateur: {videosRemaining} vidéos restantes.</Text>
            <Button title="Passer Pro pour l'illimité" onPress={presentPaywall} />
          </>
        );
        
      case 'free':
      default:
        return (
          <>
            <Text>Plan Découverte: {analysesRemaining} analyse restante.</Text>
            <Button title="Débloquer 15 vidéos/mois avec le plan Créateur" onPress={presentPaywall} />
          </>
        );
    }
  };

  return <View>{renderContent()}</View>;
};
```

---

## 4. Stratégies de Conversion Contextuelles (80/20)

L'objectif est de présenter l'offre au moment précis où l'utilisateur en ressent le besoin ou la valeur.

| Lieu dans l'App | Déclencheur (Trigger) | Stratégie de Conversion Suggérée | Plan Ciblé |
| :--- | :--- | :--- | :--- |
| **Liste des Vidéos Sources** | L'utilisateur a uploadé 4 ou 5 vidéos. | Afficher un bandeau non-bloquant : "Vous approchez de la limite. Passez au plan **Créateur** pour uploader jusqu'à 50 vidéos." | `Créateur` |
| **Après Génération Vidéo** | L'utilisateur vient de générer une vidéo avec succès. | Afficher un toast/modal de succès : "Vidéo générée ! 🎉 Saviez-vous que le plan **Créateur** vous en offre 15 chaque mois ?" | `Créateur` |
| **Page d'Analyse de Compte** | L'utilisateur consulte son analyse (plan Découverte). | Ajouter un encart : "Cette analyse vous a plu ? Obtenez des rapports frais chaque semaine et suivez votre progression avec le plan **Créateur**." | `Créateur` |
| **Page de Script/Chat** | L'utilisateur est sur le plan Créateur. | Intégrer un petit "hint" dans l'interface : "💡 Envie d'analyser la concurrence pour inspirer vos scripts ? C'est possible avec le plan **Pro**." | `Pro` |
| **Écran des Paramètres** | L'utilisateur est sur le plan Créateur et a 1 voix. | À côté de sa voix clonée, afficher un bouton désactivé : "Ajouter une 2ème voix (Plan Pro)". Au clic, ouvrir le paywall. | `Pro` |
| **Partout** | L'utilisateur atteint une limite stricte (ex: 16ème vidéo). | Utiliser le composant `<FeatureLock />` pour bloquer l'action et afficher le paywall au clic. | `Créateur` ou `Pro` |

Ce plan d'action détaillé fournit une base solide pour une implémentation cohérente et axée sur la conversion.