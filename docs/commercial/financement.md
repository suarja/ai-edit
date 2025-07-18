# Stratégie de Financement et Projections Financières - Editia

## 1. Objectif

Ce document modélise les projections financières pour Editia afin de déterminer les seuils de rentabilité et les besoins en investissement. Deux scénarios principaux sont analysés :
1.  **Bootstrapping :** Croissance organique autofinancée, visant la rentabilité le plus rapidement possible.
2.  **Levée de Fonds (Seed) :** Croissance accélérée, financée par des investisseurs pour capturer le marché.

## 2. Hypothèses Financières Clés

Toutes les projections reposent sur les hypothèses suivantes :

*   **Modèle Freemium :**
    *   **Coût d'Acquisition par le Produit (CAC) :** **0,40 €** par utilisateur gratuit. Ce coût couvre la génération d'une vidéo gratuite (Creatomate, ElevenLabs, LLM).
    *   **Taux de Conversion (Gratuit -> Payant) :** **3%**. C'est une moyenne de l'industrie pour un produit freemium avec une forte valeur ajoutée.
*   **Abonnement "Créateur" :**
    *   **Revenu Mensuel par Utilisateur (ARPU) :** **29 €**.
    *   **Coût Variable Mensuel par Abonné :** **4,00 €**. Ce coût couvre 10 vidéos, l'utilisation de la voix et du LLM.
*   **Coûts Fixes Mensuels (Infrastructure Tech) :**
    *   Creatomate (Plan Growth) : 120 €
    *   ElevenLabs (Plan Creator) : 13 €
    *   Apify (Plan Starter) : ~45 €
    *   Autres (serveurs, licences) : ~100 €
    *   **Total Coûts Fixes Tech : ~280 € / mois**
*   **Salaires (Scénario Levée de Fonds uniquement) :**
    *   2 co-fondateurs/ingénieurs : 2 x 4 000 € = **8 000 € / mois**

---

## 3. Scénario 1 : Bootstrapping

**Objectif : Atteindre le point de rentabilité opérationnelle avec un investissement initial minimal.** Les fondateurs ne se versent pas de salaire.

| Paliers (Utilisateurs Gratuits) | **100** | **500** | **~785 (Seuil)** | **1 000** | **5 000** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Utilisateurs Payants (3%)** | 3 | 15 | **24** | 30 | 150 |
| | | | | | |
| **Revenus Mensuels (à 29€)** | 87 € | 435 € | **696 €** | 870 € | 4 350 € |
| | | | | | |
| **Coûts Variables** | | | | | |
| ├ Coût des Gratuits (à 0,40€) | 40 € | 200 € | 314 € | 400 € | 2 000 € |
| ├ Coût des Payants (à 4€) | 12 € | 60 € | 96 € | 120 € | 600 € |
| **Coûts Fixes (Tech)** | 280 € | 280 € | 280 € | 280 € | 280 € |
| **Total Coûts Mensuels** | 332 € | 540 € | **690 €** | 800 € | 2 880 € |
| | | | | | |
| **Bénéfice / Perte Mensuel** | **-245 €** | **-105 €** | **~0 €** | **+70 €** | **+1 470 €** |
| **Perte Cumulée (Investissement)** | -245 € | -350 € | **~-400 €** | -330 € | *Devient positif* |

### Analyse du Scénario Bootstrapping :

*   **Point de Rentabilité Opérationnelle :** Il est atteint avec environ **785 utilisateurs gratuits**, ce qui correspond à **24 clients payants**. À ce stade, les revenus mensuels couvrent tous les coûts opérationnels.
*   **Investissement Initial Requis :** Les fondateurs doivent pouvoir couvrir une perte cumulée d'environ **400 €** avant que l'entreprise ne s'autofinance. C'est un montant très faible qui rend le bootstrapping **extrêmement viable**.
*   **Échéance :** L'enjeu principal est la **vitesse d'acquisition**. Si l'équipe peut attirer ~800 utilisateurs en 2-3 mois, la pression financière sera de courte durée.

---

## 4. Scénario 2 : Levée de Fonds (Seed)

**Objectif : Accélérer la croissance, payer les salaires de l'équipe fondatrice et dominer le marché.**

Le calcul inclut les **8 000 € de salaires mensuels** en plus des coûts opérationnels.

| Paliers (Utilisateurs Gratuits) | **1 000** | **5 000** | **10 000** | **25 000** |
| :--- | :--- | :--- | :--- | :--- |
| **Utilisateurs Payants (3%)** | 30 | 150 | 300 | 750 |
| | | | | |
| **Revenus Mensuels (à 29€)** | 870 € | 4 350 € | 8 700 € | 21 750 € |
| | | | | |
| **Total Coûts Opérationnels** | 800 € | 2 880 € | 5 380 € | 12 880 € |
| **Salaires** | 8 000 € | 8 000 € | 8 000 € | 8 000 € |
| **Total Coûts Mensuels** | 8 800 € | 10 880 € | 13 380 € | 20 880 € |
| | | | | |
| **Bénéfice / Perte Mensuel ("Burn")** | **-7 930 €** | **-6 530 €** | **-4 680 €** | **+870 €** |

### Analyse du Scénario Levée de Fonds :

*   **Point de Rentabilité (Salaires Inclus) :** La rentabilité totale est atteinte à environ **24 000 utilisateurs gratuits** (~720 clients payants).
*   **Besoin en Financement ("L'Ask") :** L'objectif d'une levée de fonds est de financer la période de "burn" jusqu'à la rentabilité ou la prochaine levée.
    *   Le "burn" mensuel moyen dans la première année sera d'environ **6 000 € - 7 000 €**.
    *   Pour assurer une piste de **18 mois** (standard pour un tour de Seed) : 18 mois * 7 000 €/mois = **126 000 €**.
    *   En ajoutant un coussin de sécurité de 20-25% pour les imprévus et les coûts marketing :
    *   **Levée de Fonds Recommandée : 150 000 € - 200 000 €.**
*   **Échéance :** Une levée de fonds doit être envisagée **avant le lancement (pré-seed)** pour permettre à l'équipe de se consacrer à temps plein au projet et de financer la stratégie d'acquisition agressive dès le premier jour.

## 5. Synthèse et Recommandations

| Stratégie | Investissement Initial | Point de Rentabilité | Vitesse de Croissance | Risque / Contrôle |
| :--- | :--- | :--- | :--- | :--- |
| **Bootstrapping** | **~400 €** | **~24 clients** (Opérationnel) | Lente et organique | Risque faible, Contrôle total |
| **Levée de Fonds** | **150k - 200k €** | **~720 clients** (Totale) | Rapide et agressive | Risque élevé, Dilution du contrôle |

**Recommandation Stratégique :**

1.  **Phase 1 (Maintenant - 3 mois) : Bootstrapping.**
    *   Lancer l'application et valider le modèle en visant les **1 000 premiers utilisateurs gratuits**.
    *   Atteindre les **30 premiers clients payants** pour prouver l'adéquation produit-marché et générer les premiers revenus.
    *   L'investissement personnel est minime et le risque est maîtrisé.

2.  **Phase 2 (Après la validation) : Décision de Financement.**
    *   **Si la croissance est rapide et virale :** Les chiffres de cette première phase (taux de conversion, coût d'acquisition réel) deviendront la base d'un dossier de levée de fonds **extrêmement solide** pour aller chercher **200 000 €** et accélérer.
    *   **Si la croissance est plus lente mais stable :** Continuer en bootstrapping, en utilisant les bénéfices pour financer la croissance et potentiellement commencer à verser de petits salaires.

Cette approche hybride maximise les chances de succès en utilisant le bootstrapping pour prouver le modèle à faible coût, ce qui augmente considérablement la valorisation et les chances de succès d'une future levée de fonds.