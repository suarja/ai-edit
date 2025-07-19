# Guide d'Implémentation des Paiements et Abonnements

## 1. Objectif

Ce document fournit une spécification technique complète pour l'implémentation de l'architecture de paiement multi-niveaux d'Editia. Il sert de source de vérité pour les développeurs travaillant sur la base de données, l'intégration RevenueCat et le code de l'application.

## 2. Naming et Identifiants Produits

Une convention de nommage claire est essentielle pour la maintenance.

| Plan | Période | **Product ID (Apple & Google)** | **RevenueCat Entitlement** |
| :--- | :--- | :--- | :--- |
| Créateur | Mensuel | `editia_2999_1m_creator` | `creator_access` |
| Créateur | Annuel | `editia_29990_1y_creator` | **`creator_access`** |
| Pro | Mensuel | `editia_7999_1m_pro` | `pro_access` |
| Pro | Annuel | `editia_79990_1y_pro` | `pro_access` |

**Note :** Le plan "Découverte" (gratuit) n'a pas de produit. Il correspond à l'absence d'un `Entitlement` actif.

## 3. Mises à Jour de la Base de Données (Supabase)

Les types de référence se trouvent dans `lib/types/supabase-types.ts`.

### 3.1. Table `subscription_plans`

Cette table doit contenir les limites statiques de chaque plan. Elle servira de source de vérité pour synchroniser les droits des utilisateurs.

**Action :** S'assurer que la table contient les 3 plans avec les bonnes limites.

| id | name | videos_generated_limit | source_videos_limit | voice_clones_limit | account_analysis_limit | is_unlimited |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `decouverte` | Plan Découverte | 1 | 5 | 0 | 1 | `false` |
| `createur` | Plan Créateur | 15 | 50 | 1 | 4 | `false` |
| `pro` | Plan Pro | -1 | -1 | 2 | -1 | `true` |

*Note :* Utiliser `-1` pour représenter "illimité" est une convention courante.

### 3.2. Table `user_usage`

Cette table suit la consommation de chaque utilisateur.

**Action :** Mettre à jour le schéma pour correspondre aux compteurs nécessaires.

```typescript
// Représentation de la table user_usage
Table user_usage {
  user_id uuid [pk]
  current_plan_id text [ref: > subscription_plans.id] // ex: 'createur'
  subscription_status text // ex: 'active', 'canceled', 'past_due'
  
  // Compteurs de consommation
  videos_generated_count int
  source_videos_uploaded_count int
  account_analysis_count int
  
  // Limites actuelles (synchronisées depuis subscription_plans)
  videos_generated_limit int
  source_videos_limit int
  account_analysis_limit int
  voice_clones_limit int
  
  next_reset_date timestamptz // Pour les compteurs mensuels
  updated_at timestamptz
}
```

### 3.3. Nouvelle Table : `user_voices`

Pour gérer plusieurs voix par utilisateur.

**Action :** Créer une nouvelle table.

```typescript
// Représentation de la table user_voices
Table user_voices {
  id uuid [pk]
  user_id uuid [ref: > auth.users.id]
  elevenlabs_voice_id text
  voice_name text
  created_at timestamptz
}
```

## 4. Configuration RevenueCat

1.  **Entitlements :**
    *   Créer l'entitlement `creator_access`. Y attacher les produits `editia_2999_1m_creator` et `editia_29990_1y_creator`.
    *   Créer l'entitlement `pro_access`. Y attacher les produits `editia_7999_1m_pro` et `editia_79990_1y_pro`.
2.  **Offerings :**
    *   Créer une "Offering" (ex: `default` ou `v1_offering`).
    *   Ajouter les 4 produits (packages) à cette offering.

## 5. Plan de Refactoring

### 5.1. Fichier `lib/types/revenueCat.ts`

**Action :** Mettre à jour les types pour refléter la nouvelle logique.

```typescript
import { PurchasesOffering } from 'react-native-purchases';
import { Database } from './supabase-types';

// Ce type est maintenant plus précis et inclut tous les compteurs
export type UserUsage = Pick<
  Database['public']['Tables']['user_usage']['Row'],
  | 'videos_generated_count'
  | 'videos_generated_limit'
  | 'source_videos_uploaded_count'
  | 'source_videos_limit'
  | 'account_analysis_count'
  | 'account_analysis_limit'
  | 'voice_clones_limit'
>;

// Ce type est complet
export type Plan = Database['public']['Tables']['subscription_plans']['Row'];

// Le type du plan est maintenant une union de chaînes
export type PlanIdentifier = 'decouverte' | 'createur' | 'pro';

export interface RevenueCatProps {
  isReady: boolean;
  userUsage: UserUsage | null;
  currentPlan: PlanIdentifier; // Remplacer isPro
  
  // Les compteurs restants sont toujours utiles
  videosRemaining: number;
  sourceVideosRemaining: number;
  voiceClonesRemaining: number;
  accountAnalysisRemaining: number;
  
  // Renommer goPro pour plus de clarté
  presentPaywall: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  refreshUsage: () => Promise<void>;
  
  // Garder les états de l'UI
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  
  // Infos contextuelles
  hasOfferingError: boolean;
  isDevMode: boolean;
  plans: Record<string, Plan> | null;
  currentOffering: PurchasesOffering | null;
}
```

### 5.2. Fichier `contexts/providers/RevenueCat.tsx`

**Action :** Refactoriser le fournisseur de contexte.

1.  **Gestion de l'état :**
    *   Remplacer `const [isPro, setIsPro] = useState(false);` par `const [currentPlan, setCurrentPlan] = useState<PlanIdentifier>('decouverte');`.

2.  **Mise à jour de `updateCustomerInformation` :**
    *   La logique doit vérifier les entitlements en cascade.
    ```typescript
    const updateCustomerInformation = async (customerInfo: CustomerInfo) => {
      const hasPro = customerInfo?.entitlements.active['pro_access'] !== undefined;
      const hasCreator = customerInfo?.entitlements.active['creator_access'] !== undefined;

      let plan: PlanIdentifier = 'decouverte';
      if (hasPro) {
        plan = 'pro';
      } else if (hasCreator) {
        plan = 'createur';
      }
      
      setCurrentPlan(plan);
      console.log('Customer info updated. Current plan:', plan);
      await syncUserLimitWithSubscription(plan);
    };
    ```

3.  **Mise à jour de `syncUserLimitWithSubscription` :**
    *   La fonction prend maintenant `planId` en paramètre et met à jour la base de données en conséquence.
    ```typescript
    const syncUserLimitWithSubscription = async (planId: PlanIdentifier) => {
      // ... (logique pour récupérer l'utilisateur)
      
      // Récupérer les limites du plan depuis la BDD
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
      
      // ... (gestion d'erreur)

      // Mettre à jour la table user_usage avec les nouvelles limites ET le plan_id
      const { error } = await supabase
        .from('user_usage')
        .update({
          current_plan_id: planId,
          videos_generated_limit: planData.videos_generated_limit,
          source_videos_limit: planData.source_videos_limit,
          voice_clones_limit: planData.voice_clones_limit,
          account_analysis_limit: planData.account_analysis_limit,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
        
      // ... (gestion d'erreur et rechargement de l'usage)
    };
    ```

4.  **Renommage de `goPro` :**
    *   Renommer la fonction `goPro` en `presentPaywall` pour mieux refléter son rôle.

5.  **Calcul des compteurs restants :**
    *   La logique de calcul doit être mise à jour pour utiliser les nouveaux noms de colonnes (`_count` vs `_used`).
    ```typescript
    const videosRemaining = userUsage
      ? Math.max(0, userUsage.videos_generated_limit - userUsage.videos_generated_count)
      : 0;
    // ... faire de même pour les autres compteurs.
    ```
