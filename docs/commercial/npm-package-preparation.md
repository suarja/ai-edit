# Préparation du Package NPM @editia/core

## 1. Vue d'Ensemble

Ce document détaille la création d'un package NPM public `@editia/core` qui centralisera toute la logique partagée entre les différents projets Editia : **authentification**, **monétisation**, **gestion des types de base de données**, et **utilitaires communs**.

## 2. Objectifs du Package

### 2.1. Centralisation de l'Authentification

- **Clerk Integration** : Gestion unifiée des tokens JWT Clerk
- **Supabase Integration** : Synchronisation avec la base de données
- **User Management** : Services de gestion des utilisateurs
- **Auth Middleware** : Middlewares d'authentification pour Express

### 2.2. Centralisation de la Monétisation

- **Feature Flags** : Gestion des accès aux fonctionnalités
- **Usage Tracking** : Suivi de l'utilisation des ressources
- **Subscription Management** : Gestion des abonnements et plans
- **Access Control** : Vérification des permissions utilisateur

### 2.3. Gestion Unifiée des Types de Base de Données

- **Types Supabase** : Génération et synchronisation automatique
- **Types Métier** : Interfaces TypeScript pour l'authentification et la monétisation
- **Validation** : Schémas de validation des données

### 2.4. Utilitaires Communs

- **API Headers** : Gestion des headers d'authentification
- **Error Handling** : Gestion d'erreurs standardisée
- **Logging** : Système de logging unifié

## 3. Architecture du Package

```
@editia/core/
├── src/
│   ├── types/
│   │   ├── database.ts          # Types Supabase générés
│   │   ├── auth.ts              # Types d'authentification
│   │   ├── feature-flags.ts     # Types des feature flags
│   │   ├── usage-tracking.ts    # Types de suivi d'usage
│   │   ├── subscriptions.ts     # Types d'abonnements
│   │   └── index.ts             # Export centralisé
│   ├── services/
│   │   ├── auth/
│   │   │   ├── clerk-auth.ts    # Service d'authentification Clerk
│   │   │   ├── user-management.ts # Gestion des utilisateurs
│   │   │   └── index.ts
│   │   ├── monetization/
│   │   │   ├── feature-access.ts # Service de vérification d'accès
│   │   │   ├── usage-tracking.ts # Service de suivi d'usage
│   │   │   ├── subscription-sync.ts # Synchronisation des abonnements
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth/
│   │   │   ├── authenticate.ts   # Middleware d'authentification
│   │   │   ├── require-auth.ts   # Middleware d'authentification requise
│   │   │   ├── optional-auth.ts  # Middleware d'authentification optionnelle
│   │   │   └── index.ts
│   │   ├── monetization/
│   │   │   ├── usage-limit.ts    # Middleware de limitation d'usage
│   │   │   ├── feature-gate.ts   # Middleware de gating
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── api-headers.ts        # Gestion des headers API
│   │   ├── error-handling.ts     # Gestion d'erreurs
│   │   ├── logging.ts            # Système de logging
│   │   ├── database-sync.ts      # Synchronisation des types DB
│   │   ├── plan-validation.ts    # Validation des plans
│   │   ├── usage-calculations.ts # Calculs d'usage
│   │   └── index.ts
│   └── index.ts                  # Point d'entrée principal
├── scripts/
│   ├── generate-types.ts         # Génération des types Supabase
│   ├── sync-types.ts             # Synchronisation des types
│   └── build.ts                  # Script de build
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

## 4. Analyse des Patterns Existants

### 4.1. Authentification (Basé sur l'analyse des serveurs)

#### Server Primary Pattern

```typescript
// services/clerkAuthService.ts
export class ClerkAuthService {
  static async verifyUser(
    authHeader?: string | null
  ): Promise<ClerkAuthResult> {
    // 1. Vérifier le header Authorization
    // 2. Extraire le token JWT
    // 3. Vérifier avec Clerk
    // 4. Récupérer l'utilisateur depuis Supabase
    // 5. Retourner user + clerkUser
  }
}
```

#### Server Analyzer Pattern

```typescript
// services/authService.ts
export class AuthService {
  static async verifyUser(authHeader?: string | null): Promise<AuthResult> {
    // Même logique que server-primary
  }

  static async verifyProUser(authHeader?: string | null): Promise<AuthResult> {
    // Vérification + contrôle Pro
  }
}
```

#### Mobile Pattern

```typescript
// lib/config/api.ts
export const API_HEADERS = {
  CLERK_AUTH: (clerkToken: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${clerkToken}`,
  }),
  USER_AUTH: (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }),
};
```

### 4.2. Middleware Patterns

#### Server Primary

```typescript
// Chaque endpoint gère l'auth manuellement
const authHeader = req.headers.authorization;
const { user, errorResponse: authError } = await ClerkAuthService.verifyUser(
  authHeader
);
if (authError) {
  return res.status(authError.status).json(authError);
}
```

#### Server Analyzer

```typescript
// Middleware Express
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const { user, errorResponse } = await AuthService.verifyUser(authHeader);
  if (errorResponse) {
    return res.status(errorResponse.status).json(errorResponse);
  }
  req.user = user;
  next();
}
```

## 5. API du Package Unifié

### 5.1. Services d'Authentification

```typescript
// Services d'authentification
export { ClerkAuthService } from './services/auth/clerk-auth';
export { UserManagementService } from './services/auth/user-management';

// Services de monétisation
export { FeatureAccessService } from './services/monetization/feature-access';
export { UsageTrackingService } from './services/monetization/usage-tracking';
export { SubscriptionSyncService } from './services/monetization/subscription-sync';
```

### 5.2. Middlewares

```typescript
// Middlewares d'authentification
export { authenticateUser } from './middleware/auth/authenticate';
export { requireAuth } from './middleware/auth/require-auth';
export { optionalAuth } from './middleware/auth/optional-auth';

// Middlewares de monétisation
export { createUsageLimitMiddleware } from './middleware/monetization/usage-limit';
export { createFeatureGateMiddleware } from './middleware/monetization/feature-gate';
```

### 5.3. Utilitaires

```typescript
// Utilitaires
export { API_HEADERS } from './utils/api-headers';
export { ErrorHandler } from './utils/error-handling';
export { Logger } from './utils/logging';
export { DatabaseTypeSync } from './utils/database-sync';
export { PlanValidator } from './utils/plan-validation';
export { UsageCalculator } from './utils/usage-calculations';
```

### 5.4. Types Exportés

```typescript
// Types de base de données
export type { Database } from './types/database';
export type { User } from './types/auth';
export type { FeatureFlag } from './types/feature-flags';
export type { UserUsage } from './types/usage-tracking';
export type { SubscriptionPlan } from './types/subscriptions';
```

## 6. Plan de Développement

### Phase 1 : Structure de Base et Authentification (Semaine 1)

- [ ] Créer le repository GitHub `editia/core`
- [ ] Initialiser le package NPM avec TypeScript
- [ ] Configurer la structure de dossiers
- [ ] Migrer les types existants depuis `database/`
- [ ] Implémenter `ClerkAuthService` unifié
- [ ] Implémenter les middlewares d'authentification

### Phase 2 : Monétisation (Semaine 2)

- [ ] Implémenter `FeatureAccessService`
- [ ] Implémenter `UsageTrackingService`
- [ ] Implémenter `SubscriptionSyncService`
- [ ] Implémenter les middlewares de monétisation

### Phase 3 : Utilitaires et Intégration (Semaine 3)

- [ ] Implémenter `API_HEADERS` unifié
- [ ] Implémenter `ErrorHandler` et `Logger`
- [ ] Implémenter `DatabaseTypeSync`
- [ ] Créer les utilitaires de validation

### Phase 4 : Migration et Tests (Semaine 4)

- [ ] Publier le package NPM
- [ ] Migrer `server-primary` vers le package
- [ ] Migrer `server-analyzer` vers le package
- [ ] Migrer `mobile` vers le package
- [ ] Tests d'intégration complets

## 7. Configuration du Package

### 7.1. package.json

```json
{
  "name": "@editia/core",
  "version": "1.0.0",
  "description": "Core services and utilities for Editia applications",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "sync-types": "ts-node scripts/sync-types.ts",
    "generate-types": "ts-node scripts/generate-types.ts",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": [
    "editia",
    "authentication",
    "monetization",
    "supabase",
    "clerk",
    "feature-flags",
    "usage-tracking"
  ],
  "author": "Editia Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/editia/core.git"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "@clerk/backend": "^1.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/node": "^18.0.0",
    "@types/express": "^4.17.0"
  },
  "peerDependencies": {
    "@supabase/supabase-js": "^2.0.0",
    "@clerk/backend": "^1.0.0",
    "express": "^4.18.0"
  },
  "files": ["dist/", "README.md", "CHANGELOG.md"]
}
```

## 8. Migration des Projets Existants

### 8.1. Étapes de Migration

1. **Installer le package** :

   ```bash
   npm install @editia/core
   ```

2. **Remplacer les services d'authentification** :

   ```typescript
   // Avant (server-primary)
   import { ClerkAuthService } from '../../services/clerkAuthService';

   // Après
   import { ClerkAuthService } from '@editia/core';
   ```

3. **Remplacer les middlewares** :

   ```typescript
   // Avant (server-analyzer)
   import { authenticateUser } from '../middleware/auth';

   // Après
   import { authenticateUser } from '@editia/core';
   ```

4. **Remplacer les headers API** :

   ```typescript
   // Avant (mobile)
   import { API_HEADERS } from '@/lib/config/api';

   // Après
   import { API_HEADERS } from '@editia/core';
   ```

### 8.2. Fichiers à Migrer

#### Server Primary

- `src/services/clerkAuthService.ts` → Package
- `src/middleware/usageLimitMiddleware.ts` → Package
- `src/services/usageTrackingService.ts` → Package
- `src/types/ressource.ts` → Package

#### Server Analyzer

- `src/services/authService.ts` → Package
- `src/middleware/auth.ts` → Package
- `src/middleware/usageLimitMiddleware.ts` → Package
- `src/services/usageTrackingService.ts` → Package

#### Mobile

- `lib/config/api.ts` (API_HEADERS) → Package
- `components/hooks/useFeatureAccess.ts` → Package
- `lib/types/revenueCat.ts` → Package (partiellement)

## 9. Gestion des Dépendances

### 9.1. Dépendances Principales

```typescript
// Dépendances requises par le package
dependencies: {
  "@supabase/supabase-js": "^2.0.0",    // Base de données
  "@clerk/backend": "^1.0.0",           // Authentification
  "express": "^4.18.0"                  // Middlewares (serveurs)
}

// Dépendances optionnelles (peerDependencies)
peerDependencies: {
  "@supabase/supabase-js": "^2.0.0",    // Projets utilisateurs
  "@clerk/backend": "^1.0.0",           // Projets utilisateurs
  "express": "^4.18.0"                  // Serveurs uniquement
}
```

### 9.2. Configuration des Variables d'Environnement

Le package nécessite ces variables d'environnement :

```bash
# Obligatoires
CLERK_SECRET_KEY=sk_...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...

# Optionnelles
NODE_ENV=development
LOG_LEVEL=info
```

### 9.3. Initialisation du Package

```typescript
// Dans chaque projet utilisateur
import { initializeEditiaCore } from '@editia/core';

initializeEditiaCore({
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  environment: process.env.NODE_ENV || 'development',
});
```

## 10. Workflow de Maintenance

### 10.1. Mise à Jour des Types

```bash
# Dans le package
npm run generate-types
npm run sync-types
npm version patch
npm publish
```

### 10.2. Mise à Jour dans les Projets

```bash
# Dans chaque projet
npm update @editia/core
npm run sync-types
```

### 10.3. Développement Local

```bash
# Dans le package
npm link

# Dans chaque projet
npm link @editia/core
```

## 11. Tests et Qualité

### 11.1. Tests Unitaires

```typescript
// tests/services/auth/clerk-auth.test.ts
describe('ClerkAuthService', () => {
  it('should verify valid Clerk JWT token', () => {
    // Test de vérification de token
  });
});

// tests/services/monetization/feature-access.test.ts
describe('FeatureAccessService', () => {
  it('should grant access when required_plan is null', () => {
    // Test de la logique d'accès
  });
});
```

### 11.2. Tests d'Intégration

```typescript
// tests/integration/auth-flow.test.ts
describe('Authentication Flow', () => {
  it('should authenticate user and sync with database', () => {
    // Test du flux complet d'authentification
  });
});
```

## 12. Documentation

### 12.1. README.md

Le README du package inclura :

- Installation et configuration
- Exemples d'utilisation pour chaque service
- API de référence complète
- Guide de migration depuis l'ancien système
- Configuration des variables d'environnement

### 12.2. CHANGELOG.md

Suivi des versions avec :

- Nouvelles fonctionnalités
- Corrections de bugs
- Breaking changes
- Guide de migration

## 13. Prochaines Étapes

1. **Créer le repository GitHub** `editia/core`
2. **Initialiser la structure** du package
3. **Migrer les types** depuis `database/`
4. **Implémenter les services d'authentification** unifiés
5. **Implémenter les services de monétisation**
6. **Publier la première version** du package
7. **Migrer progressivement** les projets existants

Ce package `@editia/core` centralisera toute la logique partagée et simplifiera grandement la maintenance du code entre les différents repositories !
