import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import VideoSelectionChips from './VideoSelectionChips';

// Mock video data for testing
const mockVideos = [
  {
    id: '1',
    title: 'Product Demo Video',
    duration: 125, // 2:05
    tags: ['demo', 'product'],
    processing_status: 'processed',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Tutorial: Getting Started',
    duration: 340, // 5:40
    tags: ['tutorial', 'onboarding'],
    processing_status: 'processing',
    created_at: '2024-01-16T14:22:00Z',
  },
  {
    id: '3',
    filename: 'presentation_final.mp4',
    duration: 89, // 1:29
    tags: ['presentation'],
    processing_status: 'processed',
    created_at: '2024-01-17T09:15:00Z',
  },
  {
    id: '4',
    original_filename: 'interview_ceo.mov',
    duration: 1520, // 25:20
    tags: ['interview', 'executive'],
    processing_status: 'error',
    created_at: '2024-01-18T16:45:00Z',
  },
];

export default function VideoChipsTest() {
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>(['1']);

  const handleVideoToggle = (videoId: string) => {
    console.log('VideoChipsTest: Toggling video', videoId);

    setSelectedVideoIds((prev) => {
      if (prev.includes(videoId)) {
        console.log('Removing video from selection:', videoId);
        return prev.filter((id) => id !== videoId);
      } else {
        console.log('Adding video to selection:', videoId);
        return [...prev, videoId];
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Video Chips Test</Text>
          <Text style={styles.subtitle}>
            Testing the new lightweight video chip components
          </Text>
        </View>

        <VideoSelectionChips
          videos={mockVideos}
          selectedVideoIds={selectedVideoIds}
          onVideoToggle={handleVideoToggle}
          config={{
            variant: 'outlined',
            allowMultipleSelection: true,
            showDuration: true,
            showStatus: true,
            showTags: false,
          }}
        />

        <View style={styles.debugInfo}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>
            Selected IDs: {JSON.stringify(selectedVideoIds, null, 2)}
          </Text>
          <Text style={styles.debugText}>
            Total Videos: {mockVideos.length}
          </Text>
          <Text style={styles.debugText}>
            Selected Count: {selectedVideoIds.length}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  debugInfo: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});
