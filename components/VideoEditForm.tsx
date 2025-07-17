import { UploadedVideoType } from '@/lib/types/video';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import VoiceDictation from './VoiceDictation';

export default function VideoEditForm({
  video,
  onSave,
  onCancel,
}: {
  video: UploadedVideoType;
  onSave: (data: {
    title: string;
    description: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: video.title || '',
    description: video.description || '',
    tags: video.tags?.join(', ') || '',
  });

  const isValid = form.title.trim().length > 0;

  const handleDescriptionChange = (text: string) => {
    setForm((prev) => ({ ...prev, description: text }));
  };

  return (
    <ScrollView style={styles.editFormScroll}>
      <View style={styles.editForm}>
        <Text style={styles.sectionTitle}>Edit Video Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Video title"
            placeholderTextColor="#666"
            value={form.title}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, title: text }))
            }
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Video description"
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              value={form.description}
              onChangeText={handleDescriptionChange}
            />
            <View style={styles.dictationContainer}>
              <VoiceDictation
                currentValue={form.description}
                onTranscriptChange={handleDescriptionChange}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="Tags separated by commas"
            placeholderTextColor="#666"
            value={form.tags}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, tags: text }))
            }
          />
        </View>

        <View style={styles.editActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <X size={16} color="#888" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !isValid && styles.buttonDisabled]}
            onPress={() => {
              if (isValid) {
                onSave({
                  title: form.title.trim(),
                  description: form.description.trim(),
                  tags: form.tags
                    .split(',')
                    .map((tag: string) => tag.trim())
                    .filter(Boolean),
                });
              }
            }}
            disabled={!isValid}
          >
            <Check size={16} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editFormScroll: {
    flex: 1,
  },
  editForm: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    paddingRight: 48, // Make space for the icon
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  dictationContainer: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
