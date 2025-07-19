# Checklist de Publication (App Store & Google Play)

## 1. Objectif

Ce document sert de checklist finale pour s'assurer que l'application Editia respecte toutes les directives des plateformes (notamment celles d'Apple, qui sont les plus strictes) avant de soumettre une version pour validation. L'objectif est de minimiser les risques de rejet et d'accélérer le processus de publication.

## 2. Legal & Metadata Prerequisites (All documents in English)

*   `[x]` **Privacy Policy:**
    *   `[x]` A custom, hosted Privacy Policy has been created.
    *   `[ ]` **URL:** [https://editia.app/privacy-policy](https://editia.app/privacy-policy)
    *   `[ ]` A link to this policy is easily accessible within the app (e.g., in Settings).
    *   `[ ]` The policy URL is added to App Store Connect and the Play Console.
*   `[x]` **Terms of Use (EULA):**
    *   `[x]` Custom Terms of Use have been created and hosted.
    *   `[ ]` **URL:** [https://editia.app/terms-of-service](https://editia.app/terms-of-service)
    *   `[ ]` A link to the terms is accessible within the app.
*   `[x]` **Payment Policy:**
    *   `[x]` A custom Payment Policy has been created and hosted.
    *   `[ ]` **URL:** [https://editia.app/payment-policy](https://editia.app/payment-policy)
    *   `[ ]` A link to this policy is accessible from the paywall and/or settings.

## 3. Directives du Paywall (Critique pour la Validation)

Basé sur les "Human Interface Guidelines" d'Apple. Le non-respect de ces points est une cause fréquente de rejet.

### 3.1. Clarté et Transparence

*   `[ ]` **Titre et Proposition de Valeur Clairs :** Le bénéfice principal de l'abonnement est immédiatement compréhensible (ex: "Débloquez toutes les fonctionnalités Pro").
*   `[ ]` **Prix Affiché Clairement :** Chaque plan (ex: Créateur Annuel) affiche son prix total (`299.90€`) et le coût par période (`soit 24.99€/mois`).
*   `[ ]` **Durée de l'Abonnement Explicite :** La période de facturation (`par mois` / `par an`) est clairement indiquée pour chaque option.
*   `[ ]` **Pas de Langage Trompeur :** Éviter les termes comme "Gratuit" sur des boutons qui initient un abonnement payant (même avec une période d'essai). Le texte doit être sans ambiguïté.
*   `[ ]` **Informations sur le Renouvellement Automatique :** Une phrase mentionnant que l'abonnement se renouvelle automatiquement et peut être annulé à tout moment est présente (ex: "L'abonnement se renouvelle automatiquement. Annulez à tout moment dans les Réglages.").

### 3.2. Fonctionnalités Requises

*   `[ ]` **Bouton "Restaurer les Achats" :** Un bouton ou un lien "Restaurer les achats" doit être présent et fonctionnel sur l'écran du paywall. C'est une exigence **non négociable**.
*   `[ ]` **Bouton de Fermeture :** L'utilisateur doit pouvoir quitter l'écran du paywall sans s'abonner (ex: une croix "X" ou un bouton "Plus tard").

## 4. Implémentation Technique dans l'App

*   `[ ]` **Chaînes de "Purpose" :**
    *   `[ ]` Vérifier que toutes les demandes d'autorisation (Photos, Caméra, Micro) ont une description claire qui explique **pourquoi l'utilisateur en bénéficiera**, et non ce que l'application fait techniquement.
    *   *Exemple :* Remplacer "Permet d'uploader une vidéo" par "Permet de choisir une vidéo de votre librairie pour l'utiliser dans vos créations".
*   `[ ]` **Gestion des Erreurs :**
    *   `[ ]` L'application gère correctement les cas où les produits ne peuvent pas être chargés (ex: pas de connexion internet) et affiche un message clair à l'utilisateur.

## 5. Préparation pour la Soumission (App Store Connect)

*   `[ ]` **Notes pour l'Équipe de Validation :**
    *   `[ ]` Rédiger une note claire dans la section "App Review Information".
    *   `[ ]` **Expliquer où trouver le paywall et les fonctionnalités payantes.**
    *   `[ ]` Si l'application nécessite une configuration spéciale (comme l'analyse d'un compte TikTok), fournir un compte de test avec des identifiants (`testuser`, `password123`). **Ceci est crucial.**
    *   `[ ]` Mentionner explicitement la présence du bouton "Restaurer les achats".
*   `[ ]` **Captures d'Écran et App Previews :**
    *   `[ ]` Les captures d'écran sont aux bonnes dimensions et ne contiennent pas d'informations trompeuses.
    *   `[ ]` Si des "App Previews" (vidéos) sont utilisées, s'assurer qu'elles respectent les spécifications techniques (durée < 30s, framerate <= 30fps, avec une piste audio même silencieuse, sans cadre de simulateur).

En suivant cette checklist de manière rigoureuse, nous maximisons nos chances d'une validation rapide et sans friction.
