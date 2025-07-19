# Guide pour la Création des Documents Légaux

## 1. Objectif

Ce document explique la manière la plus simple et la plus sûre de créer les deux documents légaux obligatoires pour la publication de votre application : les **Conditions d'Utilisation (EULA)** et la **Politique de Confidentialité**.

---

## 2. Conditions d'Utilisation (Terms of Use / EULA)

Les conditions d'utilisation définissent les règles que les utilisateurs acceptent en utilisant votre application.

### Option A : La Plus Simple (Recommandée)

Pour les applications iOS, le moyen le plus rapide de satisfaire à cette exigence est d'utiliser l'accord de licence utilisateur final (EULA) standard fourni par Apple.

*   **Action :** Lors de la configuration de votre application dans App Store Connect, vous pouvez choisir d'utiliser cet EULA standard.
*   **Lien vers le document :** [Apple Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/)

### Option B : Conditions Personnalisées

Vous pourriez avoir besoin de conditions personnalis��es si votre application gère des cas complexes (ex: droits sur le contenu généré par les utilisateurs, règles communautaires spécifiques).

*   **Action :** Utilisez un générateur en ligne comme [TermsFeed](https://www.termsfeed.com/terms-conditions-generator/) ou [Termly](https://termly.io/products/terms-and-conditions-generator/). Ces outils vous guideront à travers les clauses nécessaires.

---

## 3. Politique de Confidentialité (Privacy Policy)

**Ce document est obligatoire et doit être personnalisé.** Il doit informer les utilisateurs des données que vous collectez, de la manière dont vous les utilisez et des services tiers avec lesquels vous les partagez. Un document générique est insuffisant et entraînera un rejet.

### La Méthode Simple et Sûre : Utiliser un Générateur en Ligne

La meilleure approche consiste à utiliser un générateur de politique de confidentialité. Ces services posent des questions spécifiques sur votre application pour créer un document conforme.

**Services Recommandés :**
*   [**TermsFeed**](https://www.termsfeed.com/privacy-policy-generator/) (Très complet)
*   [**Termly**](https://termly.io/products/privacy-policy-generator/) (Interface guidée)
*   [**Iubenda**](https://www.iubenda.com/en/privacy-and-cookie-policy-generator)

### Processus Étape par Étape :

1.  **Choisissez un générateur.**
2.  **Listez vos services tiers :** Soyez prêt à déclarer tous les services que votre application utilise. Pour Editia, cela inclut :
    *   **Authentification :** Supabase, Clerk
    *   **Paiements :** RevenueCat
    *   **Base de données et Stockage :** Supabase, AWS S3
    *   **Services IA :** ElevenLabs (voix), Creatomate (vidéo), OpenAI (LLM), Apify (scraping)
    *   **Analytics :** (Si vous en utilisez, ex: PostHog, Mixpanel)
3.  **Suivez l'assistant :** Répondez précisément aux questions sur le type de données collectées (email, nom, données d'utilisation, contenu utilisateur, etc.).
4.  **Générez le document :** Le service vous fournira le texte de la politique (souvent en HTML et texte brut).
5.  **Hébergez votre politique :** Vous avez besoin d'une URL publique pour votre politique.
    *   **Solution simple :** Créez un site simple avec [GitHub Pages](https://pages.github.com/) ou [Vercel](https://vercel.com/) pour héberger le fichier HTML.
    *   **Solution future :** Intégrez-la à votre futur site marketing.
6.  **Obtenez le lien :** Copiez l'URL publique. C'est ce lien que vous ajouterez dans votre application et dans App Store Connect / Google Play Console.
