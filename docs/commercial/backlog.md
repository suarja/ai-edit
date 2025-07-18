# Backlog de Préparation au Lancement : Paiements et Feature Gating

## 1. Objectif

Ce document sert de feuille de route technique et de checklist pour l'implémentation de la monétisation dans l'application Editia. Il détaille toutes les tâches nécessaires pour configurer les paiements, restreindre l'accès aux fonctionnalités selon le plan de l'utilisateur, et mettre à jour la documentation interne.

## 2. Récapitulatif des Offres (Source de Vérité)

| Feature | **Plan Découverte** (Gratuit) | **Plan Créateur** | **Plan Pro** |
| :--- | :--- | :--- | :--- |
| **Prix** | 0 € | 29.99€/mois ou 299.90€/an (2 mois offerts) | 79.99€/mois ou 799.90€/an (2 mois offerts) |
| **Génération de Vidéos** | 1 vidéo au total | 15 vidéos / mois | Illimité |
| **Watermark** | ✅ Oui | ❌ Non | ❌ Non |
| **Durée Max Vidéo** | 30 secondes | 1 minute | Illimitée |
| **Upload de Vidéos (B-Roll)** | 5 vidéos au total | 50 vidéos au total | Illimité (politique "fair use") |
| **Scripts / Conversations** | 1 conversation au total | Illimité | Illimité |
| **Analyse de Compte** | 1 analyse au total | 4 analyses / mois | Illimité |
| **Clonage de Voix** | ❌ Non | ✅ Oui (1 voix) | ✅ Oui (jusqu'à 2 voix) |
| **Fonctionnalités "Coming Soon"** | ❌ Non | ❌ Non | ✅ Analyse de niche, Idées de contenu, Publication auto, Rapports |

---

## 3. Épopée 1 : Infrastructure de Paiement (RevenueCat & Stores)

*   `[ ]` **Base de Données :** Mettre à jour le schéma utilisateur pour inclure le plan actuel (`current_plan`), le statut de l'abonnement (`subscription_status`), et les compteurs d'usage (ex: `videos_generated_this_month`, `videos_uploaded_count`, `analyses_this_month`, `voice_clones_count`).
*   `[ ]` **App Store Connect :** Créer les 4 nouveaux produits d'abonnement (Créateur Mensuel/Annuel, Pro Mensuel/Annuel).
*   `[ ]` **Google Play Console :** Créer les 4 nouveaux produits d'abonnement.
*   `[ ]` **RevenueCat - Configuration :**
    *   `[ ]` Créer un nouveau projet ou mettre à jour l'existant.
    *   `[ ]` Créer les "Entitlements" (ex: `creator_access`, `pro_access`).
    *   `[ ]` Créer les "Offerings" qui mappent les produits des stores aux "Entitlements".
*   `[ ]` **Application - SDK RevenueCat :**
    *   `[ ]` Refactoriser la logique pour récupérer les nouvelles offres (`Offerings`).
    *   `[ ]` Implémenter la logique d'achat et de restauration des achats.
    *   `[ ]` Mettre en place des webhooks (serveur <-> RevenueCat) pour synchroniser le statut de l'abonnement avec notre base de données en temps réel.

## 4. Épopée 2 : Implémentation du "Gating" par Feature

*   `[ ]` **Génération de Vidéo :**
    *   `[ ]` **Plan Découverte :** Bloquer la génération après la 1ère vidéo.
    *   `[ ]` **Plan Créateur :** Implémenter un compteur mensuel et bloquer après 15 vidéos.
    *   `[ ]` **Watermark :** Intégrer une étape côté serveur pour ajouter le watermark si plan Découverte.
    *   `[ ]` **Durée de la vidéo :** Limiter la longueur du script en amont pour contrôler la durée finale.

*   `[ ]` **Upload de Vidéos :**
    *   `[ ]` Implémenter une vérification avant chaque upload basée sur le plan de l'utilisateur.
    *   `[ ]` Définir et implémenter la logique de stockage sur AWS S3.

*   `[ ]` **Scripts / Conversations :**
    *   `[ ]` **Plan Découverte :** Bloquer la création de nouvelles conversations après la première.

*   `[ ]` **Clonage de Voix :**
    *   `[ ]` **Backend :** Adapter le schéma pour permettre de stocker plusieurs ID de voix par utilisateur.
    *   `[ ]` **Gating :** Restreindre l'accès à la fonctionnalité pour le plan Découverte. Limiter le nombre de voix à 1 pour Créateur et 2 pour Pro.

*   `[ ]` **Analyse de Compte :**
    *   `[ ]` **Backend :** Mettre en place un endpoint pour l'analyse de compte sur demande.
    *   `[ ]` **Backend :** "Gater" l'endpoint en fonction du plan et du compteur mensuel (`analyses_this_month`).
    *   `[ ]` **Backend (Data) :** Affiner le processus de scraping pour collecter les données pertinentes, bien les structurer et les stocker de manière optimisée.

*   `[ ]` **Sous-titres :**
    *   `[ ]` Vérifier que la fonctionnalité d'activation/désactivation est bien fonctionnelle pour tous les plans.

## 5. Épopée 3 : Mises à Jour de l'Interface Utilisateur (UI/UX)

*   `[ ]` **Paywall :**
    *   `[ ]` Reconstruire le composant `CustomPaywall` pour refléter la nouvelle grille d'offres, y compris les limites d'analyse et le nombre de voix.
    *   `[ ]` Intégrer un sélecteur Mensuel/Annuel.
*   `[ ]` **Gating Visuel :**
    *   `[ ]` Refactoriser le composant `ProLockFeatures` pour qu'il soit plus flexible.
    *   `[ ]` Apposer un tag "Créateur" ou "Pro" sur les fonctionnalités non accessibles.
    *   `[ ]` Au clic sur une feature bloquée, renvoyer vers le paywall.
*   `[ ]` **Affichage des Limites :**
    *   `[ ]` Afficher les compteurs restants pour l'utilisateur (ex: "Analyses restantes : 3/4").
*   `[ ]` **Gestion des Voix :**
    *   `[ ]` Mettre à jour l'interface de clonage de voix pour permettre de gérer plusieurs voix (ajouter/supprimer jusqu'à la limite du plan).
*   `[ ]` **Affichage des Analyses :**
    *   `[ ]` **Frontend :** Créer un composant pour afficher les "insights" de l'analyse de compte de manière claire et esthétique.
    *   `[ ]` **Frontend :** Convertir les timestamps (ex: heure de publication des vidéos analysées) de UTC vers l'heure locale de l'utilisateur.

## 6. Épopée 4 : Mise à Jour de la Documentation Stratégique

*   `[ ]` **Mettre à jour `docs/commercial/strategy.md` :**
    *   `[ ]` Remplacer l'ancienne grille tarifaire par la nouvelle.
*   `[ ]` **Mettre à jour `docs/commercial/pitch.md` :**
    *   `[ ]` Mettre à jour la slide "Modèle Économique" avec les nouveaux prix et fonctionnalités.
    *   `[ ]` Recalculer les projections financières avec les nouvelles limites et revenus.
*   `[ ]` **Mettre à jour `docs/commercial/prospection.md` :**
    *   `[ ]` S'assurer que les offres mentionnées dans les exemples de contact correspondent aux nouvelles offres.

## 7. Idées Abandonnées (Pour Mémoire)

*   **Voix Professionnelle vs. Instantanée :** L'idée est abandonnée pour la V1. On propose une seule option de clonage de voix de haute qualité.
