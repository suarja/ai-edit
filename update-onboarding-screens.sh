#!/bin/bash

# List of all onboarding screens to update
SCREENS=(
  "app/(onboarding)/survey.tsx"
  "app/(onboarding)/voice-recording.tsx"
  "app/(onboarding)/processing.tsx"
  "app/(onboarding)/editorial-profile.tsx"
  "app/(onboarding)/features.tsx"
  "app/(onboarding)/trial-offer.tsx"
  "app/(onboarding)/subscription.tsx"
  "app/(onboarding)/success.tsx"
  "app/(onboarding)/voice-clone.tsx"
  "app/(onboarding)/editorial.tsx"
)

# Update each screen
for screen in "${SCREENS[@]}"; do
  # Check if file exists
  if [ -f "$screen" ]; then
    echo "Updating $screen..."
    
    # Replace imports
    sed -i '' -e '/import.*ProgressBar/a\
import { useOnboardingSteps } from "@/components/onboarding/OnboardingSteps";' "$screen"
    
    # Remove ONBOARDING_STEPS constant
    sed -i '' -e '/const ONBOARDING_STEPS/,/];/d' "$screen"
    
    # Add onboardingSteps hook usage right after the imports if not already present
    # First check if the hook isn't already in use
    if ! grep -q "const onboardingSteps = useOnboardingSteps()" "$screen"; then
      # Find the first line after all imports and add the hook
      line_number=$(grep -n "export default function" "$screen" | head -1 | cut -d':' -f1)
      if [ -n "$line_number" ]; then
        sed -i '' "${line_number}i\\
  const onboardingSteps = useOnboardingSteps();" "$screen"
      fi
    fi
    
    # Replace ProgressBar prop
    sed -i '' -e 's/steps={ONBOARDING_STEPS}/steps={onboardingSteps}/g' "$screen"
    
    echo "Updated $screen"
  else
    echo "File $screen not found, skipping..."
  fi
done

echo "All onboarding screens updated!" 