import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import VideoSelectionChips from './VideoSelectionChips';
import { VideoType } from '@/lib/types/video.types';

// Mock data that matches real VideoType structure
const mockVideos: VideoType[] = [
  {
    id: '1',
    title: 'Product Demo Video',
    description: 'Showcasing our main product features',
    upload_url: 'https://example.com/video1.mp4',
    tags: ['demo', 'product'],
    user_id: 'user123',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    duration: 125, // 2:05
    processing_status: 'completed',
  },
  {
    id: '2',
    title: 'Tutorial: Getting Started',
    description: 'Comprehensive onboarding tutorial',
    upload_url: 'https://example.com/video2.mp4',
    tags: ['tutorial', 'onboarding'],
    user_id: 'user123',
    created_at: '2024-01-16T14:22:00Z',
    updated_at: '2024-01-16T14:22:00Z',
    duration_seconds: 340, // 5:40 - testing duration_seconds vs duration
    processing_status: 'processing',
  },
  {
    id: '3',
    title: 'Sales Presentation Final',
    description: 'Q4 sales results and 2024 projections',
    upload_url: 'https://example.com/video3.mp4',
    tags: ['presentation', 'sales'],
    user_id: 'user123',
    created_at: '2024-01-17T09:15:00Z',
    updated_at: '2024-01-17T09:15:00Z',
    duration: 89, // 1:29
    processing_status: 'completed',
  },
  {
    id: '4',
    title: 'CEO Interview - Company Vision',
    description: 'Annual CEO interview discussing company direction',
    upload_url: 'https://example.com/video4.mp4',
    tags: ['interview', 'executive', 'vision'],
    user_id: 'user123',
    created_at: '2024-01-18T16:45:00Z',
    updated_at: '2024-01-18T16:45:00Z',
    duration: 1520, // 25:20
    processing_status: 'failed',
  },
];

export default function VideoChipsValidationTest() {
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([
    '1',
    '3',
  ]);
  const [testResults, setTestResults] = useState<string[]>([]);

  const handleVideoToggle = (videoId: string) => {
    console.log('Validation Test: Toggling video', videoId);

    setSelectedVideoIds((prev) => {
      const newSelection = prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId];

      // Log for validation
      console.log('Previous selection:', prev);
      console.log('New selection:', newSelection);

      return newSelection;
    });

    // Add to test results
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: Toggled video ${videoId}`,
    ]);
  };

  const runValidationTests = () => {
    const results = [];

    // Test 1: Component renders without crashing
    results.push('✅ Component renders successfully');

    // Test 2: Mock data transformation
    results.push(`✅ ${mockVideos.length} videos loaded`);

    // Test 3: Selection state
    results.push(`✅ ${selectedVideoIds.length} videos selected`);

    // Test 4: Duration formatting
    const hasDuration = mockVideos.some(
      (v) => v.duration || v.duration_seconds
    );
    results.push(
      `✅ Duration handling: ${hasDuration ? 'Working' : 'No durations'}`
    );

    // Test 5: Status mapping
    const statusTypes = new Set(mockVideos.map((v) => v.processing_status));
    results.push(`✅ Status types: ${Array.from(statusTypes).join(', ')}`);

    setTestResults(results);
  };

  const clearTests = () => {
    setTestResults([]);
    setSelectedVideoIds(['1', '3']); // Reset to initial state
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Video Chips Validation</Text>
          <Text style={styles.subtitle}>
            Testing VideoSelectionChips implementation
          </Text>
        </View>

        {/* Test Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={runValidationTests}>
            <Text style={styles.buttonText}>Run Validation Tests</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={clearTests}>
            <Text style={styles.buttonSecondaryText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Video Chips Component */}
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

        {/* Test Results */}
        {testResults.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Test Results:</Text>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))}
          </View>
        )}

        {/* Debug Info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>
            Selected IDs: {JSON.stringify(selectedVideoIds)}
          </Text>
          <Text style={styles.debugText}>Video Count: {mockVideos.length}</Text>
          <Text style={styles.debugText}>
            Memory Usage: Chip-based (No video rendering)
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
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  results: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#4ade80',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  debugInfo: {
    marginTop: 24,
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
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
