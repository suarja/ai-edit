# RevenueCat Setup Guide - Ultra Simple

## 📋 Overview

Intégration RevenueCat simplifiée pour l'app de génération vidéo IA :

- **3 vidéos gratuites** pour tous
- **30 vidéos premium** à 9,99€/mois
- **Early adopters** à 4,99€/mois (temporaire)
- **Paywall automatique** dans l'onboarding

## 🚀 Quick Setup

### 1. Installer les packages

```bash
npm install react-native-purchases react-native-purchases-ui
```

### 2. Variables d'environnement

Ajouter dans `.env` :

```bash
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key_here
```

### 3. App Store Connect Products

Créer ces 2 produits :

- **Product ID** : `premium_monthly` | **Prix** : 9,99€ | **Durée** : 1 mois
- **Product ID** : `premium_monthly_ea` | **Prix** : 4,99€ | **Durée** : 1 mois

### 4. RevenueCat Dashboard

1. Créer un projet et ajouter l'app
2. Importer les produits automatiquement
3. Créer entitlement `pro`
4. Créer 2 offerings :
   - `default` : avec `premium_monthly`
   - `early_adopter` : avec `premium_monthly_ea`
5. Créer paywall avec template par défaut

### 5. Base de données

Appliquer la migration :

```bash
npx supabase migration up
```

## 🎯 Structure finale

### Quotas vidéo

- **Gratuit** : 3 vidéos/mois
- **Premium** : 30 vidéos/mois
- **Early adopter** : 30 vidéos/mois (prix réduit)

### Onboarding Flow

```
welcome → survey → voice → processing → profile → features → paywall RevenueCat → success
```

### Usage dans l'app

```typescript
const { isPro, videosRemaining, goPro } = useRevenueCat();

// Vérifier quota avant génération
if (!isPro && videosRemaining <= 0) {
  await goPro(); // Ouvre paywall RevenueCat
  return;
}
```

## 🧪 Testing

### TestFlight Beta

1. Les beta testeurs voient le vrai paywall
2. Ils "paient" avec argent fictif (sandbox)
3. Ils obtiennent 30 vidéos premium pour tester
4. Aucun coût réel pour toi

### Early Adopters

Marquer un utilisateur early adopter :

```sql
SELECT mark_user_as_early_adopter('user-uuid-here', 90);
```

## ⚙️ Components intégrés

### VideoUsageDisplay

- Affiche quota restant
- Bouton "Passer Pro"
- Prix early adopter si applicable
- Barre de progression

### Page request-video

- Vérifie quota avant soumission
- Affiche warning si limite atteinte
- Bouton submit désactivé si pas de quota

### Onboarding subscription

- Ouvre paywall RevenueCat automatiquement
- Continue peu importe le résultat
- Ultra simple, juste un loading

## 🎉 C'est tout !

**Résultat** : Un système de paiement qui marche, simple et efficace, prêt pour TestFlight et production.

**TestFlight** → **Production** : Juste changer les clés API RevenueCat
**iOS** → **Android** : Même code, différente clé API
