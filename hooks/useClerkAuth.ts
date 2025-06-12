import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

export interface ClerkAuthState {
  // User state
  user: any | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  
  // Loading states
  loading: boolean;
  initializing: boolean;
  
  // Auth functions
  signOut: () => Promise<void>;
  
  // User data
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  
  // Session info
  sessionId: string | null;
}

export function useClerkAuth(): ClerkAuthState {
  const { isLoaded: authIsLoaded, isSignedIn, userId, sessionId } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  
  // Consider fully loaded when both auth and user are loaded
  const isLoaded = authIsLoaded && userIsLoaded;
  
  useEffect(() => {
    if (isLoaded) {
      setInitializing(false);
    }
  }, [isLoaded]);
  
  const signOut = async () => {
    try {
      setLoading(true);
      await clerkSignOut();
      // Navigate to sign-in after sign out
      router.replace('/(auth)/sign-in-clerk');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Extract user information
  const email = user?.emailAddresses?.[0]?.emailAddress || null;
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null;
  const firstName = user?.firstName || null;
  const lastName = user?.lastName || null;
  
  if (__DEV__) {
    console.log('useClerkAuth state:', {
      isLoaded,
      isSignedIn,
      userId,
      email,
      fullName,
      sessionId,
    });
  }
  
  return {
    // User state
    user,
    isLoaded,
    isSignedIn: isSignedIn || false,
    userId,
    
    // Loading states
    loading,
    initializing,
    
    // Auth functions
    signOut,
    
    // User data
    email,
    fullName,
    firstName,
    lastName,
    
    // Session info
    sessionId,
  };
} 