import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, RefreshCcw } from 'lucide-react-native';
import { router } from 'expo-router';

type VideoDetailHeaderProps = {
  title: string;
  onRefresh?: () => void;
  refreshing?: boolean;
};

export default function VideoDetailHeader({
  title,
  onRefresh,
  refreshing = false,
}: VideoDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {onRefresh && (
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          <RefreshCcw size={20} color={refreshing ? '#666' : '#fff'} />
        </TouchableOpacity>
      )}
      {!onRefresh && <View style={{ width: 20 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 16,
  },
});
