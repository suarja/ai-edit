# Diagramme des Modifications par Feature

## Objectif

Ce document utilise des diagrammes ASCII pour visualiser les modifications techniques requises pour chaque fonctionnalité clé de l'application. Il sert de checklist technique pour s'assurer que la logique de "gating" est implémentée de manière sécurisée et cohérente, à la fois côté client (frontend) et côté serveur (backend).

---

### 1. Upload de Vidéos Sources

**Logique :** Limité à 5 (Découverte), 50 (Créateur), Illimité (Pro).

```ascii
FEATURE: Source Video Upload
+------------------------------------------+------------------------------------------+
|          Frontend (React Native)         |        Backend (Supabase/Server)         |
+------------------------------------------+------------------------------------------+
|                                          |                                          |
| [ ] 1. **Vérifier avant Upload :**       | [ ] 1. **Sécurité (RLS Policy) :**       |
|     - Lire `userUsage` depuis le         |     - Créer une policy sur le bucket S3  |
|       `useRevenueCat` context.           |       qui rejette l'upload si l'usage    |
|     - Comparer `source_videos_uploaded`  |       dépasse la limite du plan.         |
|       avec `source_videos_limit`.        |       (Alternative: Edge Function).      |
|                                          |                                          |
| [ ] 2. **Gating UI :**                   | [ ] 2. **Incrémenter le Compteur :**     |
|     - Si limite atteinte, désactiver le  |     - Sur un upload réussi (via webhook  |
|       bouton d'upload.                   |       S3 ou trigger), incrémenter        |
|     - Au clic, afficher le composant     |       `source_videos_uploaded_count`     |
|       `<FeatureLock requiredPlan=... />`.|       dans la table `user_usage`.        |
|                                          |                                          |
| [ ] 3. **Affichage Contexte :**          |                                          |
|     - Afficher le compteur d'usage       |                                          |
|       (ex: "Vidéos uploadées : 4/5").    |                                          |
|                                          |                                          |
+------------------------------------------+------------------------------------------+
```

---

### 2. Génération de Vidéos

**Logique :** 1 (Découverte), 15/mois (Créateur), Illimité (Pro). Watermark et durée limités.

```ascii
FEATURE: Video Generation
+------------------------------------------+------------------------------------------+
|          Frontend (React Native)         |        Backend (Supabase/Server)         |
+------------------------------------------+------------------------------------------+
|                                          |                                          |
| [ ] 1. **Vérifier avant Génération :**   | [ ] 1. **Gating Endpoint :**             |
|     - Contrôler `videos_generated_count` |     - L'endpoint de génération doit      |
|       vs `videos_generated_limit`.       |       vérifier le plan et l'usage avant  |
|                                          |       de lancer le processus.            |
| [ ] 2. **Gating UI :**                   |                                          |
|     - Désactiver le bouton "Générer".    | [ ] 2. **Logique Watermark & Durée :**   |
|     - Au clic, afficher le `FeatureLock`.|     - Si plan = "Découverte", instruire  |
|                                          |       Creatomate d'ajouter un watermark. |
| [ ] 3. **Affichage Contexte :**          |     - Forcer la limite de durée (30s/1m) |
|     - Afficher les générations restantes|       au niveau du script envoyé à       |
|       pour le mois.                      |       Creatomate.                        |
|                                          |                                          |
|                                          | [ ] 3. **Incrémenter le Compteur :**     |
|                                          |     - Incrémenter `videos_generated_count`|
|                                          |       après une génération réussie.      |
|                                          |                                          |
+------------------------------------------+------------------------------------------+
```

---

### 3. Création de Script / Conversation

**Logique :** 1 conversation (Découverte), Illimité (Créateur & Pro).

```ascii
FEATURE: Script Creation / Chat
+------------------------------------------+------------------------------------------+
|          Frontend (React Native)         |        Backend (Supabase/Server)         |
+------------------------------------------+------------------------------------------+
|                                          |                                          |
| [ ] 1. **Vérifier avant Création :**     | [ ] 1. **Sécurité (RLS Policy) :**       |
|     - Si `currentPlan` est "Découverte", |     - Policy sur la table `conversations`.|
|       vérifier si une conversation       |     - `INSERT` autorisé seulement si     |
|       existe déjà.                       |       l'utilisateur n'est pas en plan    |
|                                          |       "Découverte" OU si son nombre de   |
| [ ] 2. **Gating UI :**                   |       conversations est de 0.            |
|     - Griser/cacher le bouton "Nouvelle  |                                          |
|       Conversation".                     |                                          |
|     - Au clic, afficher le               |                                          |
|       `<FeatureLock requiredPlan="createur" />`.|                                  |
|                                          |                                          |
+------------------------------------------+------------------------------------------+
```

---

### 4. Analyse de Compte & Insights

**Logique :** 1 analyse (Découverte), 4/mois (Créateur), Illimité (Pro).

```ascii
FEATURE: Account Analysis & Insights
+------------------------------------------+------------------------------------------+
|          Frontend (React Native)         |        Backend (Supabase/Server)         |
+------------------------------------------+------------------------------------------+
|                                          |                                          |
| [ ] 1. **Vérifier avant Analyse :**      | [ ] 1. **Gating Endpoint :**             |
|     - Contrôler `account_analysis_count` |     - L'endpoint d'analyse doit refuser  |
|       vs `account_analysis_limit`.       |       la requête si la limite est        |
|                                          |       atteinte.                          |
| [ ] 2. **Gating UI :**                   |                                          |
|     - Désactiver le bouton "Analyser".   | [ ] 2. **Incrémenter le Compteur :**     |
|     - Au clic, afficher le `FeatureLock`.|     - Incrémenter `account_analysis_count`|
|                                          |       après une analyse réussie.         |
| [ ] 3. **Affichage des Données :**       |                                          |
|     - Créer un composant UI pour         | [ ] 3. **Optimisation Data :**           |
|       présenter les insights.            |     - Affiner le scraping et le stockage |
|     - Convertir les timestamps UTC en    |       des données pour ne garder que     |
|       heure locale.                      |       l'essentiel.                       |
|                                          |                                          |
+------------------------------------------+------------------------------------------+
```

---

### 5. Clonage de Voix

**Logique :** 0 (Découverte), 1 (Créateur), 2 (Pro).

```ascii
FEATURE: Voice Cloning
+------------------------------------------+------------------------------------------+
|          Frontend (React Native)         |        Backend (Supabase/Server)         |
+------------------------------------------+------------------------------------------+
|                                          |                                          |
| [ ] 1. **Gating d'Accès :**              | [ ] 1. **Sécurité (RLS Policy) :**       |
|     - Wrapper toute la section avec      |     - Policy sur la table `user_voices`. |
|       `<FeatureLock requiredPlan="createur">`.|     - `INSERT` autorisé seulement si le |
|                                          |       nombre de voix de l'utilisateur    |
| [ ] 2. **Gating de Limite :**            |       est inférieur à `voice_clones_limit`|
|     - Lire le nombre de voix existantes. |       de son plan.                       |
|     - Si limite atteinte, désactiver le  |                                          |
|       bouton "Ajouter une voix".         | [ ] 2. **Gating Endpoint :**             |
|     - Si plan="Créateur" et limite=1,    |     - L'endpoint de clonage doit être    |
|       afficher un `FeatureLock` pour le  |       inaccessible pour le plan          |
|       plan "Pro" au clic.                |       "Découverte".                      |
|                                          |                                          |
| [ ] 3. **UI de Gestion :**               |                                          |
|     - Permettre de lister et supprimer   |                                          |
|       les voix clonées.                  |                                          |
|                                          |                                          |
+------------------------------------------+------------------------------------------+
```
