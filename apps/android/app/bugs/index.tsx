import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Bug, STATUS_CONFIG, SEVERITY_CONFIG } from '@bug-tracker/shared';
import { getBugs } from '../../lib/bugs';
import { supabase } from '../../lib/supabase';

export default function BugListScreen() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchBugs = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    try {
      const data = await getBugs(session.user.id);
      setBugs(data);
    } catch (err) {
      console.error('Failed to fetch bugs', err);
    }
  }, []);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBugs();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderItem = ({ item }: { item: Bug }) => {
    const statusLabel = STATUS_CONFIG[item.status].label;
    const statusColor = STATUS_CONFIG[item.status].color;
    const severityLabel = SEVERITY_CONFIG[item.severity].label;
    const severityColor = SEVERITY_CONFIG[item.severity].color;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/bugs/${item.id}`)}
      >
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { borderColor: severityColor }]}>
            <Text style={[styles.badgeText, { color: severityColor }]}>{severityLabel}</Text>
          </View>
          <View style={[styles.badge, { borderColor: statusColor, backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Dashboard',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/bugs/new')} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>Add</Text>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.headerBtn}>
              <Text style={[styles.headerBtnText, { color: '#a1a1aa' }]}>Logout</Text>
            </TouchableOpacity>
          )
        }} 
      />

      <FlatList
        data={bugs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bugs found. Pull to refresh or create one.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#18181b',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e5ea',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerBtn: {
    padding: 8,
  },
  headerBtnText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#a1a1aa',
    textAlign: 'center',
  }
});
