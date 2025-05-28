# Creative Phase: Enhanced Onboarding Flow

## Overview

This document outlines the creative decisions for the enhanced onboarding flow in the AI Edit application. The goal is to create an engaging and effective onboarding experience that maintains the existing voice recording functionality while implementing a multi-step survey and monetization path based on the template in `docs/onboarding/video-transcription.md`.

## Key Design Decisions

### Onboarding Flow Structure

Based on the video template and our app requirements, we'll implement the following flow:

1. **Welcome Screen** (existing, enhanced)

   - Short video/animation of the app in action
   - Clear value proposition
   - "Get Started" button

2. **Survey Questions** (new)

   - Questions about content creation needs
   - Pain points in video creation
   - Target audience for their content
   - Preferred content style
   - Minimum 3, maximum 5 questions

3. **Voice Recording/Upload** (existing, integrated)

   - Present as a personalization step
   - Explain that we'll use it to create their voice clone and editorial profile
   - Show progress during processing

4. **Processing/Customization** (new)

   - Loading screen with messaging about customizing their experience
   - Show "analyzing your preferences" messaging
   - Progress indicators
   - Will use the recorded audio for both voice cloning and editorial profile generation

5. **Editorial Profile Preview** (enhanced)

   - Show AI-generated profile based on voice recording
   - Allow minor adjustments
   - Focus on confirming their needs were understood correctly

6. **Features Showcase** (new)

   - Highlight key premium features
   - Visual examples of generated videos
   - Emphasize pain points solved

7. **Trial Offer** (new)

   - Free trial offer
   - Clear benefits of premium features
   - Notification opt-in for trial expiration

8. **Subscription Options** (new)

   - Present pricing options
   - Highlight recommended plan
   - Clear terms and benefits
   - Skip option for free tier

9. **Success/Completion** (new)
   - Confirmation of setup
   - Clear next steps
   - Quick tutorial option

### UI/UX Design Elements

1. **Progress Indicator**

   - Horizontal progress bar at top of screen
   - Shows current step and total steps
   - Provides visual sense of progression

2. **Animations & Transitions**

   - Smooth fade transitions between screens
   - Subtle animations for selection
   - Loading animations during processing
   - Haptic feedback on continue

3. **Survey Component Design**

   - Large, tappable option cards
   - Visual feedback on selection
   - Clear, concise questions
   - Option to go back to previous questions

4. **Color Scheme & Typography**

   - Maintain existing dark theme
   - Accent colors for important actions
   - Consistent typography hierarchy
   - High contrast for readability

5. **Voice Recording UI**

   - Animated microphone icon
   - Visual audio waveform during recording
   - Clear recording duration indicator
   - Prominent stop button

6. **Monetization Screens**
   - Clean, uncluttered pricing display
   - Visual differentiation of tiers
   - Clear feature comparison
   - Prominent trial messaging

## Survey Questions Design

1. **Content Creation Goals**

   - Question: "What's your primary goal with video content?"
   - Options:
     - Build brand awareness
     - Drive sales and conversions
     - Educate my audience
     - Entertain and engage followers
     - Share my expertise

2. **Current Pain Points**

   - Question: "What's your biggest challenge with creating videos?"
   - Options:
     - Coming up with good ideas
     - Writing compelling scripts
     - Recording professional voiceovers
     - Finding time to create content
     - Getting consistent results

3. **Content Style Preference**

   - Question: "What style of content resonates most with your audience?"
   - Options:
     - Educational and informative
     - Entertaining and humorous
     - Inspirational and motivational
     - Practical tips and how-tos
     - Professional and authoritative

4. **Platform Focus**

   - Question: "Which platforms do you primarily create content for?"
   - Options:
     - TikTok
     - Instagram Reels
     - YouTube Shorts
     - Facebook/Meta
     - LinkedIn

5. **Content Creation Frequency**
   - Question: "How often do you aim to publish video content?"
   - Options:
     - Daily
     - Several times a week
     - Weekly
     - A few times a month
     - Monthly or less

## Monetization Strategy

### Trial Offer

- 7-day free trial of premium features
- No credit card required for trial
- Clear messaging about what's included
- Reminder notification opt-in

### Subscription Tiers

1. **Free Tier**

   - 3 videos per month
   - Basic templates only
   - Standard voice options
   - 720p resolution

2. **Creator Plan** ($9.99/month)

   - 15 videos per month
   - All templates
   - Custom voice clone
   - 1080p resolution
   - Priority processing

3. **Professional Plan** ($19.99/month)
   - Unlimited videos
   - All templates + premium templates
   - Multiple voice clones
   - 4K resolution
   - Priority processing
   - Advanced analytics

### Conversion Tactics

- Highlight most popular plan
- Show savings for annual subscription
- Use social proof (X users chose this plan)
- Clear indication of limitations in free tier
- Seamless upgrade path from trial

## Technical Implementation Considerations

1. **State Management**

   - Use a central state for onboarding progress
   - Store survey answers for personalization
   - Track completion status of each step

2. **Animation Library**

   - Use React Native Reanimated for smooth transitions
   - Implement shared element transitions where appropriate

3. **Audio Processing**

   - Maintain existing recording functionality
   - Ensure proper error handling
   - Add audio quality checks

4. **LLM Integration**

   - Use survey responses + voice transcription for profile generation
   - Design prompt templates for consistent results
   - Implement fallbacks for processing failures

5. **Progress Tracking**

   - Analytics events for each step
   - Conversion tracking
   - Dropout points identification

6. **Monetization Implementation**
   - RevenueCat integration for subscription management
   - A/B testing capability for pricing options
   - Proper trial management

## Next Steps

1. Create UI components for new survey screens
2. Implement progress tracking component
3. Enhance existing voice recording screen
4. Design and implement processing screen
5. Create subscription screens
6. Integrate with backend processing
7. Implement testing suite
