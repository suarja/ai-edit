import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { useClerkAuth } from '@/hooks/useClerkAuth';
import { Link } from 'expo-router';

export function ClerkAuthTest() {
  const { 
    isLoaded, 
    isSignedIn, 
    user, 
    email, 
    fullName, 
    userId,
    sessionId,
    signOut,
    loading 
  } = useClerkAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Se déconnecter',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Se déconnecter', 
          style: 'destructive',
          onPress: signOut
        },
      ]
    );
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Clerk...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clerk Auth Test</Text>
      
      <SignedIn>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Signed In</Text>
          <Text style={styles.info}>Email: {email}</Text>
          <Text style={styles.info}>Full Name: {fullName}</Text>
          <Text style={styles.info}>User ID: {userId}</Text>
          <Text style={styles.info}>Session ID: {sessionId?.substring(0, 20)}...</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.signOutButton, loading && styles.buttonDisabled]}
            onPress={handleSignOut}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Signing out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>
      </SignedIn>

      <SignedOut>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❌ Signed Out</Text>
          <Text style={styles.info}>No active session</Text>
          
          <Link href="/(auth)/sign-in-clerk" asChild>
            <TouchableOpacity style={[styles.button, styles.signInButton]}>
              <Text style={styles.buttonText}>Go to Sign In</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/(auth)/sign-up-clerk" asChild>
            <TouchableOpacity style={[styles.button, styles.signUpButton]}>
              <Text style={styles.buttonText}>Go to Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SignedOut>
      
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>isLoaded: {isLoaded ? 'true' : 'false'}</Text>
        <Text style={styles.debugText}>isSignedIn: {isSignedIn ? 'true' : 'false'}</Text>
        <Text style={styles.debugText}>loading: {loading ? 'true' : 'false'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  info: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  signInButton: {
    backgroundColor: '#007AFF',
  },
  signUpButton: {
    backgroundColor: '#34C759',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
}); 