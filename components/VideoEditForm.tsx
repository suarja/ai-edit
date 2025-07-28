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
import { IUploadedVideo } from '@/lib/types/video.types';
import { SHARED_STYLE_COLORS } from '@/lib/constants/sharedStyles';

export default function VideoEditForm({
  video,
  onSave,
  onCancel,
}: {
  video: IUploadedVideo;
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
            placeholderTextColor={SHARED_STYLE_COLORS.textMuted}
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
              placeholderTextColor={SHARED_STYLE_COLORS.textMuted}
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
            placeholderTextColor={SHARED_STYLE_COLORS.textMuted}
            value={form.tags}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, tags: text }))
            }
          />
        </View>

        <View style={styles.editActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <X size={16} color={SHARED_STYLE_COLORS.textMuted} />
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
            <Check size={16} color={SHARED_STYLE_COLORS.text} />
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
    backgroundColor: SHARED_STYLE_COLORS.background,
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
    color: SHARED_STYLE_COLORS.text,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: SHARED_STYLE_COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    paddingRight: 48, // Make space for the icon
    color: SHARED_STYLE_COLORS.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: SHARED_STYLE_COLORS.border,
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
    color: SHARED_STYLE_COLORS.textMuted,
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SHARED_STYLE_COLORS.primary,
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonText: {
    color: SHARED_STYLE_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
