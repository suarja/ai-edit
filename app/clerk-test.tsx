import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { ClerkAuthTest } from '@/components/ClerkAuthTest';

export default function ClerkTestPage() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ClerkAuthTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
