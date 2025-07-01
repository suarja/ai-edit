import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import DrawerToggle from '../DrawerToggle';

interface AnalysisHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function AnalysisHeader({ title, onBack }: AnalysisHeaderProps) {
  const handleBack = onBack || (() => router.back());

  return (
    <View style={styles.header}>
     <DrawerToggle />
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#000',
    },
    backButton: {
      padding: 4,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    spacer: {
      width: 28, // Same width as back button + padding
    }
}); 