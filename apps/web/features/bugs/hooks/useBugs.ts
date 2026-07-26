'use client';

/**
 * features/bugs/hooks/useBugs.ts
 *
 * Real-time hook for the bug list.
 * Subscribes to Firestore onSnapshot and returns the live bug array.
 * Automatically unsubscribes on unmount.
 */

import { useState, useEffect } from 'react';
import { Bug, BugStatus } from '@bug-tracker/shared';
import { subscribeToBugs } from '@/lib/bugs';
import { useAuth } from '@/providers/AuthProvider';

interface UseBugsOptions {
  statusFilter?: BugStatus;
}

interface UseBugsReturn {
  bugs:    Bug[];
  loading: boolean;
  error:   string | null;
}

/**
 * Returns a real-time list of bugs for the current user.
 *
 * @example
 * const { bugs, loading, error } = useBugs();
 * const { bugs } = useBugs({ statusFilter: 'open' });
 */
export function useBugs({ statusFilter }: UseBugsOptions = {}): UseBugsReturn {
  const { user } = useAuth();
  const [bugs,    setBugs]    = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBugs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToBugs(
      user.uid,
      (updatedBugs) => {
        setBugs(updatedBugs);
        setLoading(false);
      },
      statusFilter,
      (err) => {
        setError(err.message.includes('index') ? 'Firestore requires a composite index. Check console for the link.' : 'Failed to load bugs.');
        setLoading(false);
      }
    );

    // Cleanup: unsubscribe from Firestore listener on unmount or filter change
    return unsubscribe;
  }, [user, statusFilter]);

  return { bugs, loading, error };
}
