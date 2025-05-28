#!/bin/bash

# List of all onboarding screens to fix
SCREENS=(
  "app/(onboarding)/processing.tsx"
  "app/(onboarding)/editorial.tsx"
  "app/(onboarding)/success.tsx"
  "app/(onboarding)/trial-offer.tsx"
  "app/(onboarding)/voice-recording.tsx"
  "app/(onboarding)/editorial-profile.tsx"
  "app/(onboarding)/subscription.tsx"
  "app/(onboarding)/features.tsx"
  "app/(onboarding)/survey.tsx"
)

# Fix each screen
for screen in "${SCREENS[@]}"; do
  # Check if file exists
  if [ -f "$screen" ]; then
    echo "Fixing $screen..."
    
    # 1. Check for duplicate imports
    import_count=$(grep -c "import { useOnboardingSteps } from" "$screen")
    if [ "$import_count" -gt 1 ]; then
      echo "Found duplicate imports in $screen. Fixing..."
      # Remove all occurrences of the import
      sed -i '' '/import { useOnboardingSteps } from/d' "$screen"
      # Add the import back once at the top of the file
      sed -i '' '1s/^/import { useOnboardingSteps } from "@\/components\/onboarding\/OnboardingSteps";\n/' "$screen"
    elif [ "$import_count" -eq 0 ]; then
      # Add the import if it's not there
      sed -i '' '1s/^/import { useOnboardingSteps } from "@\/components\/onboarding\/OnboardingSteps";\n/' "$screen"
    fi
    
    # 2. Check if hook is used outside the component
    if grep -q "const onboardingSteps = useOnboardingSteps().*export" "$screen"; then
      echo "Found hook usage outside component in $screen. Fixing..."
      # Remove the incorrect hook usage
      sed -i '' -e 's/const onboardingSteps = useOnboardingSteps();export/export/' "$screen"
      # Add the hook inside the component
      sed -i '' -e '/^export default function/a\
  const onboardingSteps = useOnboardingSteps();' "$screen"
    # 3. Check if hook is used inside the component
    elif ! grep -q "const onboardingSteps = useOnboardingSteps()" "$screen"; then
      echo "Adding hook usage inside component in $screen..."
      # Add the hook inside the component
      sed -i '' -e '/^export default function/a\
  const onboardingSteps = useOnboardingSteps();' "$screen"
    fi
    
    echo "Fixed $screen"
  else
    echo "File $screen not found, skipping..."
  fi
done

echo "All onboarding screens checked and fixed!" 