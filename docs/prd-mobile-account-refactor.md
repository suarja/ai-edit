# PRD: Refactor de la Section "Compte" de l'Application Mobile

**Version:** 1.0
**Date:** 23 Juillet 2024
**Auteur:** Gemini

## 1. Contexte et Problématique

Suite aux récentes améliorations de l'architecture backend (`server-analyzer`), la section "Compte" de l'application mobile n'est plus alignée. Le flux utilisateur actuel est fragmenté et peut prêter à confusion, notamment pour les nouveaux utilisateurs. De plus, les écrans n'utilisent pas les nouvelles sources de données enrichies disponibles.

**Problèmes identifiés :**

1.  **Flux utilisateur illogique :** Les utilisateurs peuvent accéder aux écrans de chat et d'insights sans avoir préalablement lancé d'analyse, conduisant à des "états vides" peu clairs.
2.  **Données obsolètes :** L'écran `account-insights` utilise des endpoints et des structures de données qui ne sont plus d'actualité, limitant la richesse des informations présentées.
3.  **Manque de guidage :** L'application ne guide pas activement l'utilisateur vers le lancement de sa première analyse, ce qui est pourtant le point de départ de toute l'expérience.

## 2. Objectifs

L'objectif principal de ce refactor est de **créer un flux utilisateur cohérent et intuitif** et d'**aligner l'application mobile sur les nouvelles capacités du backend**.

**Objectifs secondaires :**

*   Améliorer l'expérience du premier utilisateur.
*   Présenter des insights plus riches et plus pertinents.
*   Solidifier l'architecture du front-end mobile pour les futures évolutions.

## 3. Plan d'Action Détaillé

### Étape 1 : Mettre en place le "Gardien d'Analyse" (Analysis Guard)

**Objectif :** S'assurer qu'un utilisateur ne peut accéder aux fonctionnalités du compte que si une analyse a été complétée.

*   **Tâche 1.1 : Créer l'écran `StartAnalysisScreen`**
    *   Créer un nouveau fichier `mobile/app/(drawer)/start-analysis.tsx`.
    *   Cet écran contiendra un champ de saisie pour le pseudo TikTok et un bouton pour lancer l'analyse.
    *   Le lancement de l'analyse déclenchera l'appel API approprié et affichera un état de chargement. Une fois l'analyse terminée, l'utilisateur sera redirigé.

*   **Tâche 1.2 : Créer le composant `AccountAnalysisGuard`**
    *   Créer un nouveau fichier, par exemple dans `mobile/components/guards/AccountAnalysisGuard.tsx`.
    *   Ce composant vérifiera l'existence d'une analyse via l'endpoint `API_ENDPOINTS.TIKTOK_ANALYSIS_EXISTING()`.
    *   Il gérera les états de chargement, d'erreur, et les deux cas de figure :
        *   **Analyse existe :** Rendra les `children` (le `DrawerLayoutContent`).
        *   **Aucune analyse :** Redirigera vers l'écran `start-analysis`.

*   **Tâche 1.3 : Intégrer le Gardien dans le Layout**
    *   Dans `mobile/app/(drawer)/_layout.tsx`, remplacer le rendu direct de `<DrawerLayoutContent />` par `<AccountAnalysisGuard><DrawerLayoutContent /></AccountAnalysisGuard>`.

### Étape 2 : Mettre à jour l'Écran des Insights

**Objectif :** Afficher les données complètes et à jour provenant du nouvel endpoint du backend.

*   **Tâche 2.1 : Refactoriser la récupération des données**
    *   Dans `mobile/app/(drawer)/account-insights.tsx`, modifier la fonction `loadAccountData`.
    *   L'appel se fera désormais vers le nouvel endpoint `GET /api/v1/account-context/:accountId` (défini dans `API_ENDPOINTS`). L'`accountId` sera obtenu depuis l'analyse existante.

*   **Tâche 2.2 : Mettre à jour les types de données**
    *   Mettre à jour les interfaces TypeScript (`AccountAnalysis`, `AccountStats`, etc.) pour refléter la nouvelle structure de données complète (`account`, `stats`, `aggregates`, `insights`).

*   **Tâche 2.3 : Améliorer l'interface utilisateur**
    *   Ajouter de nouveaux composants pour afficher les données enrichies :
        *   Les `top_videos` (par vues, likes, etc.).
        *   Le `best_posting_time`.
        *   La distribution de la longueur des vidéos.
        *   Les statistiques sur l'usage de la musique.
        *   Le ratio de contenu sponsorisé.

### Étape 3 : Assurer la Cohérence du Chat

**Objectif :** S'assurer que les écrans de chat (`account-chat` et `account-conversations`) bénéficient du nouveau flux et affichent des informations cohérentes.

*   **Tâche 3.1 : Valider le flux de `useTikTokChatSimple`**
    *   Le hook récupère déjà une analyse existante. Grâce à l'Étape 1, ce contexte sera toujours présent. Aucune modification majeure n'est attendue ici, mais une vérification s'impose.

*   **Tâche 3.2 : Clarifier l'état vide de `account-conversations`**
    *   L'état vide de cet écran est maintenant correct : s'il s'affiche, cela signifie qu'une analyse existe mais qu'aucune conversation n'a encore été créée. Le texte "Commencez votre première conversation" est donc pertinent.

## 4. Critères de Succès

*   Un nouvel utilisateur sans analyse est systématiquement redirigé vers l'écran `start-analysis`.
*   L'écran `account-insights` affiche des données riches et variées provenant du nouvel endpoint.
*   L'accès aux `Tabs` (Insights, Conversations) n'est possible qu'après la complétion d'une analyse.
*   L'ensemble du parcours utilisateur est fluide, sans état ambigu. 