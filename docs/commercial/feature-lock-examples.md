# Exemples d'Utilisation du Composant FeatureLock

Ce document fournit des exemples concrets d'utilisation du composant `FeatureLock` dans différents contextes de l'application.

## Import du Composant

```tsx
import { FeatureLock } from '@/components/guards/FeatureLock';
import { useRevenueCat } from '@/contexts/providers/RevenueCat';
```

## Exemples d'Utilisation

### 1. Bouton de Fonctionnalité Premium

**Contexte :** Bouton pour ajouter une deuxième voix clonée (fonctionnalité Pro)

```tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FeatureLock } from '@/components/guards/FeatureLock';
import { Ionicons } from '@expo/vector-icons';

const VoiceManagementScreen = () => {
  const { presentPaywall } = useRevenueCat();

  const addSecondVoice = () => {
    // Logique pour ajouter une deuxième voix
    console.log("Ajout d'une deuxième voix...");
  };

  return (
    <View style={styles.container}>
      {/* Première voix (disponible pour tous) */}
      <TouchableOpacity style={styles.voiceCard}>
        <Text>Ma première voix</Text>
      </TouchableOpacity>

      {/* Deuxième voix (Pro uniquement) */}
      <FeatureLock
        requiredPlan="pro"
        onLockPress={presentPaywall}
        showAsDisabled={true}
        lockMessage="Plan Pro requis"
      >
        <TouchableOpacity style={styles.voiceCard} onPress={addSecondVoice}>
          <Text>Ajouter une deuxième voix</Text>
          <Ionicons name="add-circle" size={24} color="#007AFF" />
        </TouchableOpacity>
      </FeatureLock>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  voiceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
```

### 2. Section Complète de Fonctionnalité

**Contexte :** Section d'analyse de compte avancée (fonctionnalité Créateur+)

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FeatureLock } from '@/components/guards/FeatureLock';
import { BarChart3, TrendingUp, Users } from 'lucide-react-native';

const AccountAnalyticsSection = () => {
  const { presentPaywall } = useRevenueCat();

  return (
    <FeatureLock
      requiredPlan="creator"
      onLockPress={presentPaywall}
      showAsDisabled={false} // Cache complètement la section
    >
      <View style={styles.analyticsSection}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Analyses Avancées</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <TrendingUp size={20} color="#10b981" />
            <Text style={styles.metricValue}>+23%</Text>
            <Text style={styles.metricLabel}>Engagement</Text>
          </View>

          <View style={styles.metricCard}>
            <Users size={20} color="#3b82f6" />
            <Text style={styles.metricValue}>1.2K</Text>
            <Text style={styles.metricLabel}>Nouveaux Followers</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Obtenez des insights détaillés sur vos performances et votre audience.
        </Text>
      </View>
    </FeatureLock>
  );
};

const styles = StyleSheet.create({
  analyticsSection: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  metricLabel: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
  },
});
```

### 3. Fonctionnalité avec Message Personnalisé

**Contexte :** Export haute qualité (fonctionnalité Pro)

```tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FeatureLock } from '@/components/guards/FeatureLock';
import { Download, Lock } from 'lucide-react-native';

const VideoExportOptions = () => {
  const { presentPaywall } = useRevenueCat();

  const exportHighQuality = () => {
    // Logique d'export haute qualité
    console.log('Export haute qualité...');
  };

  return (
    <View style={styles.container}>
      {/* Export standard (disponible pour tous) */}
      <TouchableOpacity style={styles.exportOption}>
        <Download size={20} color="#007AFF" />
        <Text style={styles.exportText}>Export Standard (720p)</Text>
      </TouchableOpacity>

      {/* Export haute qualité (Pro uniquement) */}
      <FeatureLock
        requiredPlan="pro"
        onLockPress={presentPaywall}
        showAsDisabled={true}
        lockMessage="Export 4K disponible avec le plan Pro"
        lockIcon="diamond"
      >
        <TouchableOpacity
          style={styles.exportOption}
          onPress={exportHighQuality}
        >
          <Download size={20} color="#10b981" />
          <Text style={styles.exportText}>Export Haute Qualité (4K)</Text>
          <Text style={styles.exportSubtext}>Meilleure qualité possible</Text>
        </TouchableOpacity>
      </FeatureLock>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  exportOption: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  exportSubtext: {
    color: '#666',
    fontSize: 12,
    marginLeft: 12,
  },
});
```

### 4. Fonctionnalité Cachée (Pas d'Affichage)

**Contexte :** Fonctionnalité de planification automatique (Pro uniquement)

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FeatureLock } from '@/components/guards/FeatureLock';
import { Calendar, Clock } from 'lucide-react-native';

const SchedulingSection = () => {
  const { presentPaywall } = useRevenueCat();

  return (
    <FeatureLock
      requiredPlan="pro"
      onLockPress={presentPaywall}
      showAsDisabled={false} // Cache complètement
    >
      <View style={styles.schedulingSection}>
        <View style={styles.sectionHeader}>
          <Calendar size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Planification Automatique</Text>
        </View>

        <Text style={styles.description}>
          Programmez vos publications à l'avance et optimisez vos horaires de
          diffusion.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Clock size={16} color="#10b981" />
            <Text style={styles.featureText}>
              Horaires optimaux automatiques
            </Text>
          </View>
          <View style={styles.feature}>
            <Calendar size={16} color="#10b981" />
            <Text style={styles.featureText}>
              Planification sur plusieurs semaines
            </Text>
          </View>
        </View>
      </View>
    </FeatureLock>
  );
};

const styles = StyleSheet.create({
  schedulingSection: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  features: {
    gap: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
});
```

## Bonnes Pratiques

### 1. **Utilisation de `showAsDisabled`**

- **`showAsDisabled={true}`** : Affiche la fonctionnalité en mode désactivé avec un overlay
- **`showAsDisabled={false}`** : Cache complètement la fonctionnalité

### 2. **Messages Personnalisés**

Utilisez `lockMessage` pour des messages contextuels spécifiques à la fonctionnalité.

### 3. **Icônes Personnalisées**

Utilisez `lockIcon` pour des icônes spécifiques (ex: `diamond` pour les fonctionnalités premium).

### 4. **Gestion des Actions**

- **`onLockPress`** : Action personnalisée lors du clic sur le lock
- **Par défaut** : Ouvre le paywall via `presentPaywall()`

## Intégration avec le Système de Plans

Le composant `FeatureLock` fonctionne avec les plans suivants :

- **`creator`** : Plan Créateur (15 vidéos/mois)
- **`pro`** : Plan Pro (illimité)

Les utilisateurs gratuits n'ont accès à aucune fonctionnalité verrouillée.
