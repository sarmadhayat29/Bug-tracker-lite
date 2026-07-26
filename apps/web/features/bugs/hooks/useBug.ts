'use client';

/**
 * features/bugs/hooks/useBug.ts
 *
 * Hook for fetching and managing a single bug by ID.
 * Used on the bug detail page (/bugs/[id]).
 */

import { useState, useEffect, useCallback } from 'react';
import { Bug, BugStatus } from '@bug-tracker/shared';
import { subscribeToBug, updateBugStatus, deleteBug } from '@/lib/bugs';
import { useAuth } from '@/providers/AuthProvider';

interface UseBugReturn {
  bug:          Bug | null;
  loading:      boolean;
  error:        string | null;
  updating:     boolean;
  deleting:     boolean;
  handleStatusChange: (newStatus: BugStatus) => Promise<void>;
  handleDelete:       () => Promise<void>;
}

/**
 * Fetches a single bug and exposes status update + delete handlers.
 *
 * @example
 * const { bug, loading, handleStatusChange, handleDelete } = useBug(bugId);
 */
export function useBug(bugId: string): UseBugReturn {
  const { user } = useAuth();

  const [bug,      setBug]      = useState<Bug | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Subscribe to bug updates on mount
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToBug(
      bugId,
      (updatedBug) => {
        setBug(updatedBug);
        setLoading(false);
        if (!updatedBug) setError('Bug not found or has been deleted.');
      },
      (err) => {
        setError('Failed to load bug details.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [bugId]);

  // Status update handler
  const handleStatusChange = useCallback(async (newStatus: BugStatus) => {
    if (!bug || !user) return;
    setUpdating(true);
    await updateBugStatus(
      { id: bug.id, status: newStatus },
      bug.status,
      user.uid,
      'web',
    );
    // State is updated automatically by onSnapshot!
    setUpdating(false);
  }, [bug, user]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!bug) return;
    setDeleting(true);
    await deleteBug(bug, 'web');
    // Navigation back to dashboard is handled in the page component
  }, [bug]);

  return { bug, loading, error, updating, deleting, handleStatusChange, handleDelete };
}
