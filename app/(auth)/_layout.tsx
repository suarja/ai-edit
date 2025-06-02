import { Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function AuthLayout() {
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimer = useRef<NodeJS.Timeout | null>(null);
  const navigationCount = useRef(0);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }
    };
  }, []);

  // Handle navigation state change
  const handleStateChange = useCallback(() => {
    // Increment navigation count to track rapid navigation attempts
    navigationCount.current += 1;

    // If we're already in navigating state, extend the lock time
    if (isNavigating) {
      if (navigationTimer.current) {
        clearTimeout(navigationTimer.current);
      }

      // If there are too many navigation attempts in quick succession,
      // lock navigation for longer to prevent UI freezing
      const lockTime = navigationCount.current > 3 ? 1500 : 800;

      navigationTimer.current = setTimeout(() => {
        setIsNavigating(false);
        navigationCount.current = 0;
      }, lockTime);

      return;
    }

    // Set navigating to true and then back to false after a delay
    setIsNavigating(true);

    navigationTimer.current = setTimeout(() => {
      setIsNavigating(false);
      navigationCount.current = 0;
    }, 800);
  }, [isNavigating]);

  // Setup event listener for state changes
  useEffect(() => {
    // Reset timer whenever navigation state changes
    handleStateChange();
  }, [handleStateChange]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000' },
        gestureEnabled: !isNavigating, // Disable gestures during navigation
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
      // Add event listener for state changes
      navigationKey={
        isNavigating ? `navigating-${navigationCount.current}` : 'idle'
      }
    />
  );
}
