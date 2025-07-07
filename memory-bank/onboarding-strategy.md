# Stratégie d'Onboarding : La Victoire Immédiate et la Promesse en Arrière-Plan

## 1. Objectif

Simplifier radicalement le parcours d'onboarding pour augmenter la conversion en :

- Réduisant la friction et les points d'abandon.
- Démontrant la valeur des fonctionnalités Pro de manière tangible et rapide.
- Éliminant les temps d'attente bloquants.

## 2. Le Nouveau Parcours Simplifié

Le flux de l'utilisateur sera linéaire et focalisé sur l'action.

```mermaid
graph TD
    A[Vidéo d'accueil] --> B[Court Sondage];
    B --> C["Configuration (2-3s)"];
    C --> D{Vitrine des Fonctionnalités Pro};
    D --> E[Clonage Vocal];
    D --> F[Analyse de Compte];
    D --> G[Terminer l'Onboarding];

    subgraph "Branche 1: Victoire Immédiate"
    E --> E1{Paywall si non-Pro};
    E1 --> E2[Enregistrement Vocal];
    E2 --> E3[✅ Profil Éditorial Généré!];
    E3 --> G;
    end

    subgraph "Branche 2: Promesse en Arrière-Plan"
    F --> F1{Paywall si non-Pro};
    F1 --> F2[Lancement de l'Analyse];
    F2 --> F3[🚀 Job Lancé!];
    F3 --> G;
    end

    G --> H[🎉 Écran de Succès];
    H --> I[Application Principale];

    style A fill:#8E7CC3,stroke:#000,stroke-width:2px,color:#fff
    style H fill:#78C8A0,stroke:#000,stroke-width:2px,color:#fff
    style I fill:#60A5FA,stroke:#000,stroke-width:2px,color:#fff
    style D fill:#FBBF24,stroke:#000,stroke-width:2px,color:#000
```

## 3. Principes Clés de l'Implémentation

1.  **Suppression des Écrans de Paiement Redondants**:

    - Les fichiers `subscription.tsx` et `trial-offer.tsx` ne seront plus utilisés dans ce flux.
    - Le paiement est demandé contextuellement via le composant `ProFeatureLock` directement sur les écrans des fonctionnalités (`voice-clone`, `tiktok-analysis`).

2.  **Gestion de l'État `isPro`**:

    - Chaque écran "verrouillé" vérifiera l'état `isPro` de l'utilisateur via le hook `useFeatureAccess`. Si l'utilisateur s'abonne, les écrans suivants s'adapteront automatiquement.

3.  **Analyse de Compte Asynchrone**:

    - L'écran `tiktok-analysis.tsx` ne bloquera plus l'utilisateur.
    - Il lancera le job d'analyse en arrière-plan et utilisera une notification "toast" pour informer l'utilisateur, avant de le laisser continuer.

4.  **Valeur Immédiate du Clonage Vocal**:

    - Après l'enregistrement vocal, l'utilisateur verra immédiatement son profil éditorial. C'est un "Aha! moment" qui démontre la puissance de l'IA.

5.  **Simplification des Écrans Superflus**:
    - L'écran `processing.tsx` deviendra un simple indicateur de "configuration" rapide et authentique, basé sur les réponses au sondage.

## 4. Plan d'Action Technique

1.  **Analyser et restructurer `_layout.tsx`** pour refléter le nouveau flux linéaire.
2.  **Modifier `features.tsx`** pour qu'il devienne la plaque tournante vers les fonctionnalités Pro.
3.  **Intégrer `ProFeatureLock`** dans `voice-clone.tsx` et `tiktok-analysis.tsx`.
4.  **Modifier la logique de `tiktok-analysis.tsx`** pour un lancement asynchrone.
5.  **Assurer la navigation** `voice-recording` -> `editorial-profile`.
6.  **Supprimer/archiver** les écrans devenus obsolètes.
