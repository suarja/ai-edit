# TestFlight Preparation Guide

This document outlines the steps needed to prepare the AI Edit app for TestFlight beta testing.

## Prerequisites

Before submitting to TestFlight, ensure the following items are completed:

1. All critical functionality is working properly
2. Usage tracking system is implemented (see [Usage Tracking Implementation](../../memory-bank/usage-tracking-implementation.md))
3. App icon and splash screen are finalized
4. Privacy policy is created and hosted online

## Preparing Your App

### 1. Update App Configuration

Ensure your `app.json` file has the correct configuration:

```json
{
  "expo": {
    "name": "AI Edit",
    "slug": "ai-edit",
    "version": "0.1.0", // Use semantic versioning - increment for each build
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "ai-edit",
    "userInterfaceStyle": "automatic",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.swarecito.aiedit",
      "buildNumber": "1", // Increment this for each TestFlight submission
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSCameraUsageDescription": "AI Edit needs camera access to record videos for editing",
        "NSMicrophoneUsageDescription": "AI Edit needs microphone access to record your voice for cloning",
        "NSPhotoLibraryUsageDescription": "AI Edit needs access to your photos to upload videos for editing"
      }
    }
  }
}
```

### 2. Verify Environment Variables

Ensure your `eas.json` has a proper `preview` configuration for TestFlight builds:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-supabase-url",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-supabase-anon-key",
        "EXPO_PUBLIC_OPENAI_API_KEY": "your-openai-api-key",
        "EXPO_PUBLIC_ELEVENLABS_API_KEY": "your-elevenlabs-api-key",
        "EXPO_PUBLIC_CREATOMATE_API_KEY": "your-creatomate-api-key",
        "EXPO_PUBLIC_CREATOMATE_TEMPLATE_ID": "your-template-id"
      }
    }
  }
}
```

### 3. Create Screenshots

Create screenshots for the App Store listing:

- iPhone 6.5" Display (iPhone 13 Pro Max, 12 Pro Max)
- iPhone 5.5" Display (iPhone 8 Plus, 7 Plus)
- iPad Pro (12.9-inch) (3rd generation)
- iPad Pro (12.9-inch) (2nd generation)

### 4. Create App Preview Video (Optional)

Create a 30-second preview video showcasing the key features of the app:

1. Onboarding flow
2. Voice recording/cloning
3. Video generation process
4. Final edited video result

## Setting Up App Store Connect

### 1. Create an App Record

1. Log in to [App Store Connect](https://appstoreconnect.apple.com/)
2. Go to "My Apps" and click the "+" button
3. Select "New App"
4. Fill in the required information:
   - Platform: iOS
   - App Name: AI Edit
   - Primary language: French
   - Bundle ID: com.swarecito.aiedit
   - SKU: AIEDIT2025

### 2. App Information

Fill out the following information:

1. **App Information**

   - Privacy Policy URL (required)
   - Primary Category: Photo & Video
   - Secondary Category: Productivity

2. **App Store Information**
   - Promotional text (optional)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)
   - Version information

### 3. TestFlight Information

1. **Beta App Description**: Brief description of what testers should focus on
2. **Beta App Feedback Email**: Your email for tester feedback
3. **Demo Account**: If needed, create test credentials for reviewers

## Building for TestFlight

### 1. Create a Build

Run the EAS build command:

```bash
eas build --platform ios --profile preview
```

### 2. Submit for Review

Once the build is complete, submit it for review:

```bash
eas submit --platform ios
```

Alternatively, you can manually upload the build through App Store Connect:

1. Go to your app in App Store Connect
2. Navigate to the TestFlight tab
3. Click "Manage" under iOS
4. Click the "+" button to upload your build

### 3. Create a Beta Test Group

1. Go to the TestFlight tab in App Store Connect
2. Click "Groups" in the sidebar
3. Click the "+" button to create a new group
4. Name your group (e.g., "Internal Testers", "External Testers")
5. Add testers by email

## Testing Group Configuration

### Internal Testing Group

- Limited to 25 testers (Apple Developer account members)
- No review required
- Builds available immediately
- 90-day expiration

### External Testing Group

- Up to 10,000 testers
- Requires App Review approval
- Can be public (with a link) or private (by email invitation)
- 90-day expiration

## Beta Test Invitation

Create a clear invitation email for your testers:

```
Subject: Join the AI Edit Beta Test on TestFlight!

Hello,

You're invited to test the AI Edit app before its official release! AI Edit lets you create professional videos with your own AI voice clone.

To join the test:
1. Download TestFlight from the App Store
2. Open this link on your iOS device: [TestFlight Link]
3. Follow the instructions to install AI Edit

Important notes:
- This is a beta version, so you may encounter bugs
- The app has a limit of 5 generated videos per month during testing
- Your feedback is valuable! Please report any issues or suggestions
- The beta expires in 90 days

Thank you for helping us improve AI Edit!

The AI Edit Team
```

## App Review Guidelines

Ensure your app complies with Apple's guidelines to avoid rejection:

1. Functionality: App must be complete and functional
2. Performance: App must be stable and perform as expected
3. Design: UI must be refined and user-friendly
4. Legal: Must comply with all legal requirements
5. Privacy: Must include privacy policy and handle user data properly
6. Content: Must be appropriate for the App Store

## Post-Submission Checklist

After submitting to TestFlight:

1. Monitor review status in App Store Connect
2. Be prepared to respond to reviewer questions
3. Test the app thoroughly once it's available in TestFlight
4. Collect and organize feedback from testers
5. Plan for updates based on feedback

## Troubleshooting Common Issues

- **Build Failures**: Check EAS build logs for detailed error information
- **Rejection Due to Metadata**: Update app information and resubmit
- **Rejection Due to Functionality**: Fix issues and create a new build
- **Beta App Not Installing**: Verify tester has TestFlight installed and accepted invitation

## Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [Expo EAS Documentation](https://docs.expo.dev/eas/)
