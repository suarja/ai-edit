# Onboarding Flow Component Architecture

## Overview

This document outlines the component architecture for the enhanced onboarding flow. The architecture follows a modular approach with reusable components and a central state management system.

## Component Hierarchy

```
App
└── OnboardingProvider (Context)
    ├── OnboardingLayout (Stack Navigator)
    │   ├── WelcomeScreen
    │   ├── SurveyScreen
    │   │   └── Survey
    │   │       └── OptionCard
    │   ├── VoiceRecordingScreen
    │   │   ├── AudioRecorder
    │   │   └── AudioWaveform
    │   ├── ProcessingScreen
    │   │   └── ProgressIndicator
    │   ├── EditorialProfileScreen
    │   │   └── ProfileEditor
    │   ├── FeaturesShowcaseScreen
    │   │   └── FeatureCard
    │   ├── TrialOfferScreen
    │   │   └── NotificationOptIn
    │   ├── SubscriptionScreen
    │   │   └── SubscriptionCard
    │   └── SuccessScreen
    └── ProgressBar (Shared Component)
```

## Key Components

### Context & State Management

#### OnboardingProvider

The central state management component for the onboarding flow.

```typescript
// components/providers/OnboardingProvider.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

type OnboardingStep =
  | 'welcome'
  | 'survey'
  | 'voice-recording'
  | 'processing'
  | 'editorial-profile'
  | 'features'
  | 'trial-offer'
  | 'subscription'
  | 'success';

type SurveyAnswers = {
  [key: string]: string;
};

interface OnboardingContextValue {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  surveyAnswers: SurveyAnswers;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: OnboardingStep) => void;
  setSurveyAnswer: (questionId: string, answer: string) => void;
  markStepCompleted: (step: OnboardingStep) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(
  undefined
);

export const OnboardingProvider: React.FC<{
  children: React.ReactNode;
  initialStep?: OnboardingStep;
}> = ({ children, initialStep = 'welcome' }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswers>({});

  // Step navigation functions
  const nextStep = useCallback(() => {
    // Logic for determining next step based on current step
  }, [currentStep]);

  const previousStep = useCallback(() => {
    // Logic for determining previous step based on current step
  }, [currentStep]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setCurrentStep(step);
  }, []);

  // Survey answer management
  const setSurveyAnswer = useCallback((questionId: string, answer: string) => {
    setSurveyAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  // Step completion tracking
  const markStepCompleted = useCallback((step: OnboardingStep) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        completedSteps,
        surveyAnswers,
        nextStep,
        previousStep,
        goToStep,
        setSurveyAnswer,
        markStepCompleted,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
```

### UI Components

#### ProgressBar

A horizontal progress indicator showing the user's progression through the onboarding flow.

```typescript
// components/onboarding/ProgressBar.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useOnboarding } from '../providers/OnboardingProvider';

interface ProgressBarProps {
  steps: string[];
  currentStep: string;
  completedSteps: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  steps,
  currentStep,
  completedSteps,
}) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          {index > 0 && <View style={styles.connector} />}
          <View
            style={[
              styles.step,
              completedSteps.includes(step) && styles.completedStep,
              currentStep === step && styles.currentStep,
            ]}
          />
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 40,
  },
  step: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  completedStep: {
    backgroundColor: '#007AFF',
  },
  currentStep: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
  },
});
```

#### Survey Component

A reusable component for rendering survey questions and collecting answers.

```typescript
// components/onboarding/Survey.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OptionCard } from './OptionCard';

interface Option {
  id: string;
  text: string;
}

interface SurveyProps {
  question: string;
  options: Option[];
  onAnswer: (optionId: string) => void;
  selectedOption?: string;
}

export const Survey: React.FC<SurveyProps> = ({
  question,
  options,
  onAnswer,
  selectedOption,
}) => {
  const [selected, setSelected] = useState<string | undefined>(selectedOption);

  const handleSelect = (optionId: string) => {
    setSelected(optionId);
    onAnswer(optionId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <OptionCard
            key={option.id}
            text={option.text}
            selected={selected === option.id}
            onSelect={() => handleSelect(option.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  options: {
    gap: 12,
  },
});
```

#### OptionCard

A selectable card component for survey options.

```typescript
// components/onboarding/OptionCard.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

interface OptionCardProps {
  text: string;
  selected: boolean;
  onSelect: () => void;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  text,
  selected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selectedContainer]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{text}</Text>
      {selected && (
        <View style={styles.checkContainer}>
          <Check size={20} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedContainer: {
    backgroundColor: '#004C99',
  },
  text: {
    fontSize: 16,
    color: '#ddd',
    flex: 1,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '500',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

#### SubscriptionCard

A component for displaying subscription plan options.

```typescript
// components/onboarding/SubscriptionCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';

interface Feature {
  text: string;
}

interface SubscriptionCardProps {
  title: string;
  price: number;
  period: string;
  features: Feature[];
  isRecommended?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  title,
  price,
  period,
  features,
  isRecommended = false,
  isSelected = false,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isRecommended && styles.recommendedContainer,
        isSelected && styles.selectedContainer,
      ]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.currency}>$</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>/{period}</Text>
      </View>

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Check size={16} color="#007AFF" />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.selectButton, isSelected && styles.selectedButton]}>
        <Text
          style={[styles.selectText, isSelected && styles.selectedButtonText]}
        >
          {isSelected ? 'Selected' : 'Select Plan'}
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
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  recommendedContainer: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  selectedContainer: {
    borderColor: '#007AFF',
    backgroundColor: '#0A2647',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currency: {
    fontSize: 16,
    color: '#ddd',
    fontWeight: '500',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  period: {
    fontSize: 16,
    color: '#888',
  },
  features: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#ddd',
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  selectText: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedButtonText: {
    color: '#fff',
  },
});
```

## Screen Components

### Welcome Screen

The initial screen with a video preview and clear value proposition.

```typescript
// app/(onboarding)/welcome.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Video } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { nextStep, markStepCompleted } = useOnboarding();

  const handleGetStarted = () => {
    markStepCompleted('welcome');
    nextStep();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={[
          'welcome',
          'survey',
          'voice-recording',
          'editorial-profile',
          'features',
          'subscription',
          'success',
        ]}
        currentStep="welcome"
        completedSteps={[]}
      />

      <View style={styles.videoContainer}>
        <Video
          source={{ uri: 'YOUR_DEMO_VIDEO_URL' }}
          style={styles.video}
          shouldPlay
          isLooping
          resizeMode="cover"
          isMuted
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Transform Your Content Creation</Text>
        <Text style={styles.subtitle}>
          Create professional videos in minutes with AI-powered scripts and your
          own voice
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    height: 300,
    overflow: 'hidden',
    borderRadius: 16,
    margin: 20,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
```

## Data Models

### Survey Questions

```typescript
// constants/onboardingQuestions.ts
export const surveyQuestions = [
  {
    id: 'content_goals',
    question: "What's your primary goal with video content?",
    options: [
      { id: 'brand', text: 'Build brand awareness' },
      { id: 'sales', text: 'Drive sales and conversions' },
      { id: 'educate', text: 'Educate my audience' },
      { id: 'entertain', text: 'Entertain and engage followers' },
      { id: 'expertise', text: 'Share my expertise' },
    ],
  },
  {
    id: 'pain_points',
    question: "What's your biggest challenge with creating videos?",
    options: [
      { id: 'ideas', text: 'Coming up with good ideas' },
      { id: 'scripts', text: 'Writing compelling scripts' },
      { id: 'voiceovers', text: 'Recording professional voiceovers' },
      { id: 'time', text: 'Finding time to create content' },
      { id: 'consistency', text: 'Getting consistent results' },
    ],
  },
  {
    id: 'content_style',
    question: 'What style of content resonates most with your audience?',
    options: [
      { id: 'educational', text: 'Educational and informative' },
      { id: 'entertaining', text: 'Entertaining and humorous' },
      { id: 'inspirational', text: 'Inspirational and motivational' },
      { id: 'practical', text: 'Practical tips and how-tos' },
      { id: 'professional', text: 'Professional and authoritative' },
    ],
  },
  {
    id: 'platform_focus',
    question: 'Which platforms do you primarily create content for?',
    options: [
      { id: 'tiktok', text: 'TikTok' },
      { id: 'instagram', text: 'Instagram Reels' },
      { id: 'youtube', text: 'YouTube Shorts' },
      { id: 'facebook', text: 'Facebook/Meta' },
      { id: 'linkedin', text: 'LinkedIn' },
    ],
  },
  {
    id: 'content_frequency',
    question: 'How often do you aim to publish video content?',
    options: [
      { id: 'daily', text: 'Daily' },
      { id: 'several_weekly', text: 'Several times a week' },
      { id: 'weekly', text: 'Weekly' },
      { id: 'few_monthly', text: 'A few times a month' },
      { id: 'monthly', text: 'Monthly or less' },
    ],
  },
];
```

### Subscription Plans

```typescript
// constants/subscriptionPlans.ts
export const subscriptionPlans = [
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
```

## Integration Points

### LLM Profile Generation

```typescript
// lib/ai/profileGenerator.ts
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface SurveyData {
  content_goals: string;
  pain_points: string;
  content_style: string;
  platform_focus: string;
  content_frequency: string;
}

export async function generateEditorialProfile(
  userId: string,
  transcription: string,
  surveyData: SurveyData
) {
  try {
    // Combine transcription and survey data for context
    const prompt = `
      Based on the following audio transcription and survey answers, create an editorial profile for a content creator.
      
      Audio Transcription:
      ${transcription}
      
      Survey Answers:
      - Content Goals: ${surveyData.content_goals}
      - Pain Points: ${surveyData.pain_points}
      - Content Style: ${surveyData.content_style}
      - Platform Focus: ${surveyData.platform_focus}
      - Content Frequency: ${surveyData.content_frequency}
      
      Create an editorial profile with these sections:
      1. Persona Description
      2. Tone of Voice
      3. Target Audience
      4. Style Notes
    `;

    // Call OpenAI to generate profile
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-profile`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          userId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate profile');
    }

    const data = await response.json();

    // Store in database
    const { error } = await supabase.from('editorial_profiles').upsert({
      user_id: userId,
      persona_description: data.persona_description,
      tone_of_voice: data.tone_of_voice,
      audience: data.audience,
      style_notes: data.style_notes,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error generating profile:', error);
    throw error;
  }
}
```

### RevenueCat Integration

```typescript
// lib/subscription/revenuecat.ts
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as Purchases from 'react-native-purchases';

export async function initializeRevenueCat() {
  try {
    Purchases.configure({
      apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
    });
  } catch (e) {
    console.error('Error initializing RevenueCat:', e);
  }
}

export async function getSubscriptionPlans() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch (e) {
    console.error('Error getting subscription plans:', e);
    return [];
  }
}

export async function purchaseSubscription(packageToPurchase) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);

    // Update user subscription status
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_subscriptions').upsert({
        user_id: user.id,
        subscription_status: customerInfo.entitlements.active
          ? 'active'
          : 'inactive',
        subscription_plan: packageToPurchase.identifier,
        expires_at: new Date(customerInfo.latestExpirationDate).toISOString(),
      });
    }

    return customerInfo;
  } catch (e) {
    console.error('Error purchasing subscription:', e);
    throw e;
  }
}

export async function restorePurchases() {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return customerInfo;
  } catch (e) {
    console.error('Error restoring purchases:', e);
    throw e;
  }
}
```

## Navigation Flow

The navigation will be handled through the OnboardingProvider, which will control which screen to display based on the current step. The implementation will use Expo Router for actual navigation.

```typescript
// app/(onboarding)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { OnboardingProvider } from '@/components/providers/OnboardingProvider';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'fade',
        }}
      />
    </OnboardingProvider>
  );
}
```

## Next Steps

1. Set up testing infrastructure
2. Implement the OnboardingProvider with basic state management
3. Create the ProgressBar component
4. Develop the Survey and OptionCard components
5. Enhance the Welcome screen with the new design
