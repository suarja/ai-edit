# Guide de Dépannage RevenueCat

## Problème : "Error fetching offerings" sur Simulateur iOS

### Symptômes
- ✅ Fonctionne sur TestFlight (iPhone réel)
- ❌ Ne fonctionne pas sur simulateur iOS
- Erreur : `RevenueCat.OfferingsManager.Error error 1`
- Message : "None of the products registered in the RevenueCat dashboard could be fetched from App Store Connect"

### Causes Principales

#### 1. **Différence d'Environnement**
- **Simulateur** : Utilise l'environnement Sandbox d'Apple
- **TestFlight** : Utilise l'environnement Production d'Apple
- Les produits doivent être configurés différemment pour chaque environnement

#### 2. **Configuration StoreKit**
- Le simulateur nécessite un fichier de configuration StoreKit local
- Ou les produits doivent être approuvés dans App Store Connect Sandbox

### Solutions

#### Solution 1: Configuration StoreKit pour Simulateur (Recommandée)

1. **Créer un fichier StoreKit Configuration**
   ```bash
   # Dans Xcode, aller à :
   # File > New > File > iOS > StoreKit Configuration File
   ```

2. **Ajouter vos produits dans le fichier StoreKit**
   ```json
   {
     "identifier": "editia_pro_monthly",
     "reference_name": "EditIA Pro Monthly",
     "type": "auto_renewable_subscription",
     "price": "9.99",
     "locale": "fr_FR"
   }
   ```

3. **Configurer le scheme Xcode**
   - Product > Scheme > Edit Scheme
   - Run > Options > StoreKit Configuration
   - Sélectionner votre fichier .storekit

#### Solution 2: Mode Développement avec Fallback (Implémenté)

Notre app détecte automatiquement l'environnement de développement et :

1. **Active le mode fallback** quand RevenueCat ne peut pas charger les offerings
2. **Simule l'accès Pro** en mode développement pour les tests
3. **Affiche un composant de debug** pour surveiller l'état

```typescript
// Le provider détecte automatiquement le mode dev
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

// En cas d'erreur en mode dev, simule Pro
if (isDevelopment && hasOfferingError) {
  setIsPro(true); // Pour les tests
}
```

#### Solution 3: Variables d'Environnement

Vérifiez que vos clés RevenueCat sont correctement configurées :

```bash
# .env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key_here
```

### Vérifications à Faire

#### Dans RevenueCat Dashboard
1. **Produits configurés** dans les deux environnements (Sandbox + Production)
2. **Entitlements** correctement mappés
3. **App Store Connect** intégration active

#### Dans App Store Connect
1. **Produits approuvés** pour Sandbox
2. **Contrats fiscaux** signés
3. **Informations bancaires** complètes

#### Dans Votre App
1. **Bundle ID** identique entre Xcode et RevenueCat
2. **Clés API** correctes pour chaque environnement
3. **Entitlement "Pro"** existe dans RevenueCat

### Debug en Temps Réel

Utilisez le composant `DebugRevenueCat` qui apparaît automatiquement en mode développement :

```typescript
// Ajoutez à n'importe quelle page
import { DebugRevenueCat } from '@/components/DebugRevenueCat';

// Dans le JSX
<DebugRevenueCat />
```

Le composant affiche :
- ✅ Status RevenueCat (Ready/Loading)
- ✅ Status Pro (Yes/No)  
- ⚠️ Erreurs d'offerings
- 📊 Usage vidéos actuel
- 🔧 Bouton pour simuler Pro en dev

### Workflow de Test Recommandé

#### En Développement (Simulateur)
1. **Utilisez le mode fallback** pour tester l'UI
2. **Simulez l'accès Pro** via le debug panel
3. **Testez la logique métier** sans RevenueCat

#### En Production (TestFlight)
1. **Testez les vrais achats** avec des comptes de test
2. **Vérifiez la restauration** d'achats
3. **Validez la synchronisation** des entitlements

### Messages d'Erreur Courants

#### "No products found"
- ❌ Produits pas configurés dans RevenueCat
- ❌ Bundle ID incorrect
- ❌ Clés API incorrectes

#### "StoreKit error"
- ❌ Pas de fichier StoreKit en dev
- ❌ Produits pas approuvés en Sandbox
- ❌ Problème de compte développeur

#### "Network error"
- ❌ Pas de connexion internet
- ❌ Firewall bloque RevenueCat
- ❌ Problème temporaire RevenueCat

### Code de Fallback Actuel

Notre implementation inclut déjà :

```typescript
// Détection automatique du mode dev
if (isDevelopment && Platform.OS === 'ios') {
  console.log('🚧 Development mode detected - using fallback for RevenueCat');
  setHasOfferingError(true);
  setIsReady(true);
  await loadUserUsage();
  return;
}

// Simulation Pro en dev quand offerings échouent
if (hasOfferingError && isDevelopment) {
  console.log('🔧 Development mode: simulating Pro access');
  setIsPro(true);
  await syncUserLimitWithSubscription(true);
  return true;
}
```

### Recommandations Finales

1. **Pour le développement** : Utilisez le mode fallback intégré
2. **Pour la production** : Assurez-vous que tous les produits sont approuvés
3. **Pour le debug** : Utilisez le composant `DebugRevenueCat`
4. **Pour les tests** : Créez un fichier StoreKit configuration

Cette approche vous permet de développer sans interruption tout en gardant RevenueCat fonctionnel en production. 