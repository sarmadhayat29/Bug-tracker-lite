import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BugSeverity } from '@bug-tracker/shared';
import { createBug } from '../../lib/bugs';
import { supabase } from '../../lib/supabase';

const SEVERITIES: { label: string, value: BugSeverity }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

export default function CreateBugScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!title || !description || !session?.user) return;
    setLoading(true);
    try {
      await createBug({
        title,
        description,
        severity,
        pageUrl: null,
        createdBy: session.user.id,
      }, 'android');
      router.back();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Report Bug' }} />
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="What went wrong?"
          placeholderTextColor="#52525b"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Steps to reproduce..."
          placeholderTextColor="#52525b"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Severity</Text>
        <View style={styles.severityRow}>
          {SEVERITIES.map((sev) => (
            <TouchableOpacity
              key={sev.value}
              style={[
                styles.severityBtn,
                severity === sev.value && styles.severityBtnActive
              ]}
              onPress={() => setSeverity(sev.value)}
            >
              <Text style={[
                styles.severityText,
                severity === sev.value && styles.severityTextActive
              ]}>{sev.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.button, (!title || !description || loading) && styles.buttonDisabled]} 
        onPress={handleCreate}
        disabled={!title || !description || loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Bug</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    padding: 12,
    color: '#e5e5ea',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  severityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#18181b',
  },
  severityBtnActive: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f120',
  },
  severityText: {
    color: '#a1a1aa',
    fontWeight: '500',
  },
  severityTextActive: {
    color: '#6366f1',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
