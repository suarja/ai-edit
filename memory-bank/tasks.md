# Task: Enhanced Onboarding Flow Implementation

## Task ID: ONB-001

## Complexity Level: Level 3

## Priority: High

## Description

Enhance the onboarding flow based on the template found in `docs/onboarding/video-transcription.md`. The goal is to create a more engaging and effective onboarding experience that improves user retention and conversion, while maintaining the existing voice recording/upload functionality for voice cloning and editorial profile generation.

## Requirements

1. Implement a multi-step onboarding flow based on the template
2. Maintain the existing voice recording/upload functionality
3. Use the recorded/uploaded audio for voice cloning
4. Use LLM analysis to generate the editorial profile from the audio
5. Add a proper monetization path with free trial options
6. Implement progress tracking throughout the flow
7. Add a survey component to capture user pain points and needs
8. Add proper transitions and animations between steps
9. Follow TDD approach for implementation

## Affected Components

- `app/(onboarding)/welcome.tsx`
- `app/(onboarding)/editorial.tsx`
- `app/(onboarding)/voice-clone.tsx`
- `supabase/functions/process-onboarding/index.ts`
- New components to be created

## Success Criteria

- User can complete the onboarding flow with voice recording/upload
- Editorial profile is automatically generated from the audio
- Voice clone is created from the audio
- Conversion rate to paid users is tracked
- All tests pass

## Test Plan

We will follow a TDD approach with the following test layers:

1. Unit tests for individual components
2. Integration tests for the onboarding flow
3. End-to-end tests for the complete user journey

## Components requiring CREATIVE phase

- UI/UX for multi-step onboarding flow with progress indicator
- Survey question design
- Monetization screens design

## Implementation Plan

### Phase 1: Test Infrastructure Setup

- [x] Create task documentation and planning
- [ ] Set up Jest with React Native Testing Library
- [ ] Create test utilities and mocks
- [ ] Configure test coverage reporting

### Phase 2: Core Components Development

- [ ] Create OnboardingProvider component with tests
  - [ ] State management for steps
  - [ ] Survey answers storage
  - [ ] Step navigation
- [ ] Implement ProgressBar component with tests

  - [ ] Step visualization
  - [ ] Current step indicator
  - [ ] Completed steps tracking

- [ ] Create Survey component with tests

  - [ ] Question rendering
  - [ ] Options display
  - [ ] Selection handling
  - [ ] Answer validation

- [ ] Design OptionCard component with tests

  - [ ] Visual feedback on selection
  - [ ] Accessibility support

- [ ] Create ProcessingScreen component with tests

  - [ ] Loading indicators
  - [ ] Progress messaging
  - [ ] Error handling

- [ ] Design SubscriptionCard component with tests
  - [ ] Plan details display
  - [ ] Featured plan highlighting
  - [ ] Selection handling

### Phase 3: Screen Implementation

- [ ] Update Welcome Screen with tests

  - [ ] Add video/animation
  - [ ] Improve value proposition
  - [ ] Enhance CTA button

- [ ] Create Survey Screen with tests

  - [ ] Integrate Survey component
  - [ ] Handle navigation between questions
  - [ ] Store survey answers

- [ ] Enhance Voice Recording Screen with tests

  - [ ] Improve UI for recording
  - [ ] Add visual audio waveform
  - [ ] Enhance processing state

- [ ] Update Editorial Profile Preview with tests

  - [ ] Show AI-generated profile
  - [ ] Allow adjustments
  - [ ] Confirmation UI

- [ ] Create Features Showcase Screen with tests

  - [ ] Highlight premium features
  - [ ] Visual examples
  - [ ] Pain point messaging

- [ ] Design Trial Offer Screen with tests

  - [ ] Free trial messaging
  - [ ] Benefits visualization
  - [ ] Notification opt-in

- [ ] Implement Subscription Options Screen with tests

  - [ ] Plan comparison
  - [ ] Recommended plan highlight
  - [ ] Terms and conditions
  - [ ] Skip option

- [ ] Create Success/Completion Screen with tests
  - [ ] Confirmation messaging
  - [ ] Next steps guidance
  - [ ] Quick tutorial option

### Phase 4: Backend Integration

- [ ] Update process-onboarding Supabase function

  - [ ] Handle survey data
  - [ ] Enhance LLM prompt for editorial profile
  - [ ] Store subscription preferences

- [ ] Set up RevenueCat integration

  - [ ] Configure subscription plans
  - [ ] Implement purchase flow
  - [ ] Handle trial management

- [ ] Implement analytics tracking
  - [ ] Onboarding step completion
  - [ ] Conversion events
  - [ ] Feature adoption tracking

### Phase 5: Flow Integration & Testing

- [ ] Create integration tests for complete flow

  - [ ] Happy path testing
  - [ ] Error handling paths
  - [ ] Backward navigation testing

- [ ] Implement E2E tests
  - [ ] Complete onboarding journey
  - [ ] Voice recording flow
  - [ ] Subscription flow

### Phase 6: Polish & Optimization

- [ ] Add animations and transitions

  - [ ] Screen transitions
  - [ ] Selection animations
  - [ ] Progress indicators

- [ ] Optimize performance

  - [ ] Lazy loading
  - [ ] Memory management
  - [ ] Startup time

- [ ] Enhance error handling

  - [ ] User-friendly error messages
  - [ ] Recovery paths
  - [ ] Fallback options

- [ ] Implement accessibility improvements
  - [ ] Screen reader support
  - [ ] Focus management
  - [ ] Color contrast

## Current Implementation Status

### Completed Tasks

- [x] Create OnboardingProvider component for state management
- [x] Implement ProgressBar component with tests
- [x] Create Survey component with tests
- [x] Design and implement Option selection component with tests
- [x] Create ProcessingScreen component with tests
- [x] Design SubscriptionCard component with tests
- [x] Update welcome screen with improved UI/UX
- [x] Create survey questions screens
- [x] Enhance voice recording screen
- [x] Implement processing/customization screen
- [x] Create features showcase screen
- [x] Design trial offer screen
- [x] Implement subscription options screen
- [x] Create success/completion screen

### Issues to Fix

- [ ] Fix redirection to non-existent screens during the onboarding flow
- [ ] Prevent automatic progression through the last screens to allow user control
- [ ] Fix UI stacking issue with landing page border showing in main app
- [ ] Translate all onboarding screens to French for initial release
- [ ] Implement proper data tracking for form submissions
- [ ] Fix edge cases for users with existing profiles

### Next Steps

1. Implement proper data tracking and storage of survey answers
2. Fix navigation issues in the onboarding flow
3. Translate all onboarding content to French
4. Test the complete flow with both new and existing users
5. Add analytics tracking for the onboarding steps

## Current Status: Planning Phase Complete

## Next Steps

1. Begin test infrastructure setup
2. Start implementing OnboardingProvider component
3. Create ProgressBar component

## Active Tasks

### ONB-002: Fix Automatic Screen Advancing in Onboarding Flow

- **Description**: Fix the issue where screens in the onboarding flow (particularly features, trial-offer, and subscription screens) advance automatically without user control
- **Priority**: High
- **Estimated Time**: 3 hours
- **Status**: Completed
- **Dependencies**: None
- **Solution Implemented**:
  - Added `MANUAL_ADVANCE_SCREENS` constant to identify screens that should never auto-advance
  - Updated OnboardingProvider to disable auto-progression by default
  - Added `isAutoProgressAllowed` function to check if a step should allow auto-progression
  - Modified features, trial-offer, and subscription screens to explicitly disable auto-progression
  - Updated ProcessingScreen component to respect auto-progression setting

### ONB-003: Implement RevenueCat Payment Processing

- **Description**: Integrate RevenueCat for subscription management and payment processing
- **Priority**: Low
- **Estimated Time**: 8 hours
- **Status**: Deferred (Not required for TestFlight release)
- **Dependencies**: None
- **Subtasks**:
  - [ ] Sign up for RevenueCat developer account
  - [ ] Create subscription products in RevenueCat dashboard
  - [ ] Install and configure RevenueCat SDK
  - [ ] Implement subscription purchase flow
  - [ ] Add subscription validation
  - [ ] Test purchase flow on iOS and Android
  - [ ] Implement restore purchases functionality

### APP-001: Implement Usage Tracking for TestFlight

- **Description**: Create a system to track and limit video generation usage for TestFlight users without implementing payments
- **Priority**: High
- **Estimated Time**: 6 hours
- **Status**: Completed
- **Dependencies**: None
- **Subtasks**:
  - [x] Create `user_usage` table in Supabase with video count and reset date fields
  - [x] Implement usage tracking in video generation API
  - [x] Add usage limit checks before video generation
  - [x] Create usage dashboard in the app
  - [x] Implement monthly usage reset mechanism
  - [x] Add admin capability to adjust usage limits

### ONB-004: Remove Subscription Screens for TestFlight

- **Description**: Modify the onboarding flow to remove subscription-related screens for TestFlight beta
- **Priority**: High
- **Estimated Time**: 2 hours
- **Status**: Completed
- **Dependencies**: None
- **Subtasks**:
  - [x] Create feature flag system for conditionally enabling/disabling screens
  - [x] Update OnboardingProvider to support feature flags
  - [x] Create useOnboardingSteps hook for consistent step management
  - [x] Update all onboarding screens to use the new hook
  - [x] Update ProgressBar component to reflect filtered steps
  - [x] Add environment variables for TestFlight in eas.json
  - [x] Test complete onboarding flow without subscription screens

### APP-002: TestFlight Preparation and Submission

- **Description**: Prepare the app for TestFlight submission and testing
- **Priority**: High
- **Estimated Time**: 5 hours
- **Status**: In Progress
- **Dependencies**: APP-001
- **Subtasks**:
  - [x] Configure feature flags for TestFlight builds
  - [x] Update eas.json with TestFlight environment variables
  - [x] Modify onboarding flow to hide subscription screens
  - [ ] Update app.json with correct configuration
  - [ ] Verify app icon and splash screen assets
  - [ ] Update app metadata and screenshots
  - [ ] Update features page to match TestFlight offering
  - [ ] Fix character constraints in Editorial Profile form
  - [ ] Improve Voice Clone page UI/UX
  - [ ] Configure TestFlight testing groups
  - [ ] Create privacy policy for App Store
  - [ ] Test on multiple iOS devices
  - [ ] Prepare TestFlight invitation text
  - [ ] Submit for App Store review

### UI-001: Fix Editorial Profile UI

- **Description**: Improve the Editorial Profile UI with proper character constraints and better UX
- **Priority**: Medium
- **Estimated Time**: 3 hours
- **Status**: Not Started
- **Dependencies**: None
- **Subtasks**:
  - [ ] Fix character overflow in profile form
  - [ ] Add proper validation for field lengths
  - [ ] Improve visual feedback on character limits
  - [ ] Ensure consistent styling across all form fields
  - [ ] Test with different content lengths
  - [ ] Fix any layout issues on different device sizes

### UI-002: Improve Voice Clone Page

- **Description**: Enhance the Voice Clone page UI and UX
- **Priority**: Medium
- **Estimated Time**: 4 hours
- **Status**: Not Started
- **Dependencies**: None
- **Subtasks**:
  - [ ] Redesign recording interface for better clarity
  - [ ] Add visual audio waveform during recording
  - [ ] Improve recording state indicators
  - [ ] Add playback capability for recorded samples
  - [ ] Enhance error messaging
  - [ ] Implement better loading states
  - [ ] Test recording functionality on various devices
