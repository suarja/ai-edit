#!/bin/bash

# List of all onboarding screens to fix
SCREENS=(
  "app/(onboarding)/voice-recording.tsx"
  "app/(onboarding)/success.tsx"
  "app/(onboarding)/subscription.tsx"
  "app/(onboarding)/survey.tsx"
  "app/(onboarding)/editorial-profile.tsx"
  "app/(onboarding)/trial-offer.tsx"
  "app/(onboarding)/features.tsx"
)

# Fix each screen
for screen in "${SCREENS[@]}"; do
  # Check if file exists
  if [ -f "$screen" ]; then
    echo "Checking $screen for duplicate imports..."
    
    # Count occurrences of the import
    count=$(grep -c "import { useOnboardingSteps } from" "$screen")
    
    if [ "$count" -gt 1 ]; then
      echo "Found duplicate imports in $screen. Fixing..."
      
      # Remove all occurrences of the import first
      sed -i '' '/import { useOnboardingSteps } from/d' "$screen"
      
      # Add the import back once at the top of the file
      sed -i '' '1s/^/import { useOnboardingSteps } from "@\/components\/onboarding\/OnboardingSteps";\n/' "$screen"
      
      # Make sure the hook is called inside the component
      if ! grep -q "const onboardingSteps = useOnboardingSteps()" "$screen"; then
        line_number=$(grep -n "export default function" "$screen" | head -1 | cut -d':' -f1)
        if [ -n "$line_number" ]; then
          sed -i '' "${line_number}a\\
  const onboardingSteps = useOnboardingSteps();" "$screen"
        fi
      fi
      
      echo "Fixed $screen"
    else
      echo "No duplicate imports found in $screen, skipping..."
    fi
  else
    echo "File $screen not found, skipping..."
  fi
done

echo "All onboarding screens checked and fixed!" 