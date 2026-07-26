import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Bug, BugStatus, STATUS_CONFIG, SEVERITY_CONFIG } from '@bug-tracker/shared';
import { getBug, updateBugStatus } from '../../lib/bugs';
import { auth } from '../../lib/firebase';

const STATUSES: { label: string, value: BugStatus }[] = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
];

export default function BugDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadBug() {
      if (!id) return;
      try {
        const data = await getBug(id);
        setBug(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBug();
  }, [id]);

  const handleStatusChange = async (newStatus: BugStatus) => {
    if (!bug || !auth.currentUser || bug.status === newStatus) return;
    setUpdating(true);
    try {
      await updateBugStatus({ id: bug.id, status: newStatus }, bug.status, auth.currentUser.uid, 'android');
      setBug({ ...bug, status: newStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  if (!bug) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Bug not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Bug Details' }} />
      
      <Text style={styles.title}>{bug.title}</Text>
      
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { borderColor: SEVERITY_CONFIG[bug.severity].color }]}>
          <Text style={[styles.badgeText, { color: SEVERITY_CONFIG[bug.severity].color }]}>
            {SEVERITY_CONFIG[bug.severity].label}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{bug.description}</Text>
      </View>

      {bug.pageUrl && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Page URL</Text>
          <Text style={styles.url}>{bug.pageUrl}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.statusRow}>
          {STATUSES.map((status) => {
            const isActive = bug.status === status.value;
            const color = STATUS_CONFIG[status.value].color;
            return (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.statusBtn,
                  isActive && { borderColor: color, backgroundColor: `${color}20` }
                ]}
                onPress={() => handleStatusChange(status.value)}
                disabled={updating}
              >
                <Text style={[
                  styles.statusText,
                  isActive && { color: color }
                ]}>{status.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {updating && <ActivityIndicator style={{ marginTop: 12 }} color="#6366f1" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e5e5ea',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#e5e5ea',
    lineHeight: 24,
  },
  url: {
    fontSize: 14,
    color: '#6366f1',
    textDecorationLine: 'underline',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#18181b',
  },
  statusText: {
    color: '#a1a1aa',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  }
});
