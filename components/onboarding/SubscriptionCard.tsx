import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SubscriptionPlan } from '@/lib/constants/subscriptionPlans';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        plan.isRecommended && styles.recommendedContainer,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
      testID="subscription-card"
    >
      {plan.isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>Recommandé</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.title, isSelected && styles.selectedText]}>
          {plan.title}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={[styles.price, isSelected && styles.selectedText]}>
            ${plan.price}
          </Text>
          <Text style={[styles.period, isSelected && styles.selectedText]}>
            /{plan.period}
          </Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.featureIcon}>•</Text>
            <Text
              style={[styles.featureText, isSelected && styles.selectedText]}
            >
              {feature.text}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <View
          style={[styles.radioButton, isSelected && styles.radioButtonSelected]}
        >
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
        <Text style={[styles.selectText, isSelected && styles.selectedText]}>
          {isSelected ? 'Sélectionné' : 'Sélectionner'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: '#007AFF',
    backgroundColor: '#00366B',
  },
  recommendedContainer: {
    borderColor: '#FFD700',
  },
  recommendedBadge: {
    backgroundColor: '#FFD700',
    position: 'absolute',
    top: 0,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  recommendedText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  period: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
    marginLeft: 2,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  featureIcon: {
    color: '#007AFF',
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    color: '#ddd',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#888',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  selectText: {
    color: '#888',
    fontSize: 16,
  },
  selectedText: {
    color: '#fff',
  },
});
