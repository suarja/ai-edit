# Audit de la Monétisation Backend - Editia

## 1. Vue d'Ensemble

Ce document présente un audit complet des services de monétisation et d'usage tracking dans les deux serveurs backend et l'application mobile, ainsi qu'une stratégie d'harmonisation.

## 2. Architecture Actuelle

### 2.1. Composants Identifiés

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Server Primary  │    │ Server Analyzer │
│                 │    │                  │    │                 │
│ • useFeatureAccess│  │ • usageTrackingService│ │ • usageTrackingService│
│ • usageTrackingService│ │ • usageLimitMiddleware│ │ • usageLimitMiddleware│
│ • RevenueCat    │    │ • ResourceType   │    │ • ResourceType  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │                        │
                              └────────┬───────────────┘
                                       │
                              ┌─────────────────┐
                              │   Supabase DB   │
                              │                 │
                              │ • user_usage    │
                              │ • feature_flags │
                              │ • user_voices   │
                              │ • subscription_plans│
                              └─────────────────┘
```

## 3. Audit Détaillé par Composant

### 3.1. Application Mobile

#### 3.1.1. Hook `useFeatureAccess`

- **Fichier** : `mobile/components/hooks/useFeatureAccess.ts`
- **Fonctionnalités** :
  - Vérification d'accès basée sur `feature_flags`
  - Calcul des limites d'utilisation
  - Gestion des cas `required_plan = null`
  - Support multi-fonctionnalités
- **Statut** : ✅ Fonctionnel et corrigé

#### 3.1.2. Service `usageTrackingService`

- **Fichier** : `mobile/lib/services/usageTrackingService.ts`
- **Fonctionnalités** :
  - `getUserUsage()` : Récupération des données d'usage
  - `hasReachedLimit()` : Vérification des limites
  - `incrementResourceUsage()` : Incrémentation des compteurs
  - `resetResourceUsage()` : Réinitialisation des compteurs
  - `updateUserLimits()` : Mise à jour des limites par plan
  - `createUserUsageRecord()` : Création d'enregistrement initial
- **Types de ressources supportés** :
  ```typescript
  export type ResourceType =
    | 'videos'
    | 'source_videos'
    | 'voice_clones'
    | 'account_analysis';
  ```
- **Statut** : ✅ Fonctionnel

#### 3.1.3. Contexte RevenueCat

- **Fichier** : `mobile/contexts/providers/RevenueCat.tsx`
- **Fonctionnalités** :
  - Gestion des abonnements
  - Synchronisation avec `user_usage`
  - Calcul des limites restantes
  - Gestion des plans (free, creator, pro)
- **Statut** : ✅ Fonctionnel

### 3.2. Server Primary

#### 3.2.1. Service `usageTrackingService`

- **Fichier** : `server-primary/src/services/usageTrackingService.ts`
- **Fonctionnalités** :
  - `checkUsageLimit()` : Vérification des limites
  - `incrementUsage()` : Incrémentation via RPC
- **Utilisation de RPC** : `increment_user_usage`
- **Statut** : ✅ Fonctionnel

#### 3.2.2. Middleware `usageLimitMiddleware`

- **Fichier** : `server-primary/src/middleware/usageLimitMiddleware.ts`
- **Fonctionnalités** :
  - Authentification utilisateur
  - Vérification des limites avant traitement
  - Incrémentation après succès
- **Statut** : ✅ Fonctionnel

#### 3.2.3. Types de Ressources

- **Fichier** : `server-primary/src/types/ressource.ts`
- **Types supportés** :
  ```typescript
  export enum ResourceType {
    SOURCE_VIDEOS = 'source_videos',
    VOICE_CLONES = 'voice_clones',
    VIDEOS_GENERATED = 'videos_generated',
  }
  ```
- **Statut** : ⚠️ Incomplet (manque `account_analysis`)

#### 3.2.4. Endpoints Utilisant le Gating

- **`/api/sourceVideos`** : Upload de vidéos sources
- **`/api/videos`** : Génération de vidéos
- **`/api/voiceClone`** : Clonage de voix
- **`/api/scripts`** : Génération de scripts
- **`/api/webhooks`** : Webhooks Creatomate

### 3.3. Server Analyzer

#### 3.3.1. Service `usageTrackingService`

- **Fichier** : `server-analyzer/src/services/usageTrackingService.ts`
- **Fonctionnalités** :
  - `checkUsageLimit()` : Vérification des limites
  - `incrementUsage()` : Incrémentation via RPC
- **Limitation** : Uniquement `account_analysis`
- **Statut** : ✅ Fonctionnel mais limité

#### 3.3.2. Middleware `usageLimitMiddleware`

- **Fichier** : `server-analyzer/src/middleware/usageLimitMiddleware.ts`
- **Fonctionnalités** :
  - Vérification des limites pour `account_analysis`
  - Pas d'authentification (utilise `userId` du body)
- **Statut** : ✅ Fonctionnel mais limité

#### 3.3.3. Types de Ressources

- **Limitation** : Uniquement `account_analysis`
- **Statut** : ⚠️ Très limité

## 4. Tables de Base de Données

### 4.1. Table `user_usage`

```sql
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  videos_generated INT DEFAULT 0,
  videos_generated_limit INT DEFAULT 5,
  source_videos_used INT DEFAULT 0,
  source_videos_limit INT DEFAULT 3,
  voice_clones_used INT DEFAULT 0,
  voice_clones_limit INT DEFAULT 0,
  account_analysis_used INT DEFAULT 0,
  account_analysis_limit INT DEFAULT 0,
  tokens_used NUMERIC,
  token_limit NUMERIC,
  current_plan_id TEXT DEFAULT 'free' REFERENCES subscription_plans(id),
  subscription_status TEXT DEFAULT 'active',
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  next_reset_date TIMESTAMPTZ DEFAULT (NOW() + '30 days'::interval),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2. Table `feature_flags`

```sql
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  required_plan TEXT REFERENCES subscription_plans(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.3. Table `subscription_plans`

```sql
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  videos_generated_limit INT NOT NULL,
  source_videos_limit INT NOT NULL,
  voice_clones_limit INT NOT NULL,
  account_analysis_limit INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_unlimited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.4. Table `user_voices`

```sql
CREATE TABLE user_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id),
  elevenlabs_voice_id TEXT NOT NULL,
  voice_name TEXT NOT NULL
);
```

## 5. Problèmes Identifiés

### 5.1. Incohérences de Types

- **Server Primary** : `ResourceType` enum manque `account_analysis`
- **Server Analyzer** : `ResourceType` limité à `account_analysis` uniquement
- **Mobile** : `ResourceType` utilise des strings au lieu d'enum

### 5.2. Duplication de Code

- Services `usageTrackingService` dupliqués dans les deux serveurs
- Middleware `usageLimitMiddleware` dupliqués
- Logique de vérification d'usage répétée

### 5.3. Incohérences de Naming

- **Mobile** : `videos` vs **Backend** : `videos_generated`
- **Mobile** : `source_videos` vs **Backend** : `source_videos`
- **Mobile** : `voice_clones` vs **Backend** : `voice_clones`

### 5.4. Gestion d'Erreurs Incohérente

- **Server Primary** : Fail open en cas d'erreur
- **Server Analyzer** : Fail closed en cas d'erreur
- **Mobile** : Gestion d'erreur personnalisée

## 6. Stratégie d'Harmonisation

### 6.1. Phase 1 : Standardisation des Types

#### 6.1.1. Créer un Package Partagé

```typescript
// shared/types/monetization.ts
export enum ResourceType {
  VIDEOS_GENERATED = 'videos_generated',
  SOURCE_VIDEOS = 'source_videos',
  VOICE_CLONES = 'voice_clones',
  ACCOUNT_ANALYSIS = 'account_analysis',
}

export interface UsageLimits {
  videos_generated_limit: number;
  source_videos_limit: number;
  voice_clones_limit: number;
  account_analysis_limit: number;
}

export interface UsageCounts {
  videos_generated: number;
  source_videos_used: number;
  voice_clones_used: number;
  account_analysis_used: number;
}
```

#### 6.1.2. Mettre à Jour les Serveurs

- **Server Primary** : Ajouter `ACCOUNT_ANALYSIS` à `ResourceType`
- **Server Analyzer** : Étendre `ResourceType` à tous les types
- **Mobile** : Migrer vers l'enum partagé

### 6.2. Phase 2 : Service Partagé

#### 6.2.1. Créer un Service Unifié

```typescript
// shared/services/usageService.ts
export class UsageService {
  static async checkLimit(
    userId: string,
    resourceType: ResourceType
  ): Promise<boolean>;
  static async incrementUsage(
    userId: string,
    resourceType: ResourceType
  ): Promise<boolean>;
  static async getUserUsage(userId: string): Promise<UserUsage>;
  static async updateLimits(userId: string, planId: string): Promise<boolean>;
}
```

#### 6.2.2. Implémentation par Serveur

- **Server Primary** : Utiliser le service partagé
- **Server Analyzer** : Utiliser le service partagé
- **Mobile** : Utiliser le service partagé

### 6.3. Phase 3 : Middleware Unifié

#### 6.3.1. Créer un Middleware Partagé

```typescript
// shared/middleware/usageMiddleware.ts
export function createUsageMiddleware(resourceType: ResourceType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Logique unifiée de vérification d'usage
  };
}
```

### 6.4. Phase 4 : Feature Flags Backend

#### 6.4.1. Service Feature Flags

```typescript
// shared/services/featureFlagsService.ts
export class FeatureFlagsService {
  static async checkAccess(userId: string, featureId: string): Promise<boolean>;
  static async getFeatureFlags(): Promise<FeatureFlag[]>;
}
```

#### 6.4.2. Middleware Feature Flags

```typescript
// shared/middleware/featureFlagsMiddleware.ts
export function requireFeature(featureId: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Vérification d'accès basée sur feature_flags
  };
}
```

## 7. Plan d'Implémentation

### 7.1. Semaine 1 : Standardisation

- [ ] Créer le package partagé `@editia/shared`
- [ ] Définir les types unifiés
- [ ] Mettre à jour les serveurs avec les nouveaux types

### 7.2. Semaine 2 : Service Unifié

- [ ] Créer le service `UsageService` partagé
- [ ] Migrer Server Primary vers le service partagé
- [ ] Migrer Server Analyzer vers le service partagé

### 7.3. Semaine 3 : Middleware Unifié

- [ ] Créer le middleware `usageMiddleware` partagé
- [ ] Migrer les endpoints vers le middleware unifié
- [ ] Tester la cohérence entre serveurs

### 7.4. Semaine 4 : Feature Flags Backend

- [ ] Créer le service `FeatureFlagsService`
- [ ] Implémenter le middleware `featureFlagsMiddleware`
- [ ] Intégrer dans les endpoints critiques

### 7.5. Semaine 5 : Tests et Validation

- [ ] Tests d'intégration complets
- [ ] Validation de la cohérence des limites
- [ ] Documentation finale

## 8. Bénéfices Attendus

### 8.1. Cohérence

- Types unifiés entre tous les composants
- Logique de vérification d'usage identique
- Gestion d'erreurs standardisée

### 8.2. Maintenabilité

- Code centralisé et réutilisable
- Moins de duplication
- Évolution plus facile

### 8.3. Fiabilité

- Tests centralisés
- Validation cohérente
- Moins de bugs liés aux incohérences

### 8.4. Évolutivité

- Ajout facile de nouveaux types de ressources
- Extension simple des feature flags
- Intégration facilitée de nouveaux serveurs

## 9. Risques et Mitigation

### 9.1. Risques Techniques

- **Risque** : Breaking changes lors de la migration
- **Mitigation** : Migration progressive avec feature flags

### 9.2. Risques Opérationnels

- **Risque** : Downtime pendant la migration
- **Mitigation** : Déploiement en blue-green

### 9.3. Risques de Performance

- **Risque** : Latence due au service partagé
- **Mitigation** : Cache local et optimisations

## 10. Conclusion

L'harmonisation de la monétisation backend est essentielle pour assurer la cohérence et la maintenabilité du système. Le plan proposé permet une migration progressive avec des bénéfices immédiats et à long terme.

**Prochaines étapes** :

1. Valider l'approche avec l'équipe
2. Créer le package partagé
3. Commencer la migration par phases
4. Monitorer et ajuster selon les besoins
