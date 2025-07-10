import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import DrawerToggle from '../DrawerToggle';
import { ArrowLeft } from 'lucide-react-native';

interface AnalysisHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function AnalysisHeader({
  title,
  showBackButton = false,
  onBack,
}: AnalysisHeaderProps) {
  const handleBack = onBack || (() => router.back());

  const backButton = () => {
    return (
      <TouchableOpacity onPress={handleBack}>
        <ArrowLeft size={24} color="#fff" />
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.header}>
      {showBackButton ? backButton() : <DrawerToggle />}
      <View style={styles.titleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
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
  },
});
