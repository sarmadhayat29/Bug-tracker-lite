import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

declare var process: any;

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      setError('Supabase is not configured. Please check your .env file.');
      setLoading(false);
      return;
    }

    try {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) throw error;
        setUser(session?.user ?? null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (e: any) {
      setError('Auth Initialization Error: ' + e.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading || error || !router) return;

    const inAuthGroup = segments[0] === 'bugs';

    // Use a small delay to ensure the Router is fully ready
    const timeout = setTimeout(() => {
      if (user && !inAuthGroup) {
        router.replace('/bugs');
      } else if (!user && inAuthGroup) {
        router.replace('/');
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [user, loading, segments, error, router]);

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Application Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f11' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#18181b' },
          headerTintColor: '#e5e5ea',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0f0f11' },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f11',
    padding: 24,
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  errorText: {
    color: '#a1a1aa',
    textAlign: 'center',
  },
});
