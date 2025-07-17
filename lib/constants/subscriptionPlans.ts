export interface SubscriptionFeature {
  text: string;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  price: number;
  period: string;
  features: SubscriptionFeature[];
  isRecommended: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    title: 'Free Tier',
    price: 0,
    period: 'month',
    features: [
      { text: '3 videos per month' },
      { text: 'Basic templates only' },
      { text: 'Standard voice options' },
      { text: '720p resolution' },
    ],
    isRecommended: false,
  },
  {
    id: 'creator',
    title: 'Creator Plan',
    price: 9.99,
    period: 'month',
    features: [
      { text: '15 videos per month' },
      { text: 'All templates' },
      { text: 'Custom voice clone' },
      { text: '1080p resolution' },
      { text: 'Priority processing' },
    ],
    isRecommended: true,
  },
  {
    id: 'professional',
    title: 'Professional Plan',
    price: 19.99,
    period: 'month',
    features: [
      { text: 'Unlimited videos' },
      { text: 'All templates + premium templates' },
      { text: 'Multiple voice clones' },
      { text: '4K resolution' },
      { text: 'Priority processing' },
      { text: 'Advanced analytics' },
    ],
    isRecommended: false,
  },
];
