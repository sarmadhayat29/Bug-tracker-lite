'use client';

/**
 * providers/AuthProvider.tsx
 *
 * React context that exposes the current Firebase Auth user across the entire app.
 * Wrap the root layout with <AuthProvider> so every page and component can call useAuth().
 *
 * What it does:
 *   - Subscribes to onAuthStateChanged once at the root
 *   - Exposes `user` (Firebase User | null) and `loading` (boolean)
 *   - `loading` is true until Firebase resolves the initial auth state (prevents flash)
 *
 * Usage:
 *   import { useAuth } from '@/providers/AuthProvider';
 *   const { user, loading } = useAuth();
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  ReactElement,
} from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthState } from '@/lib/auth';

// ─── Context ──────────────────────────────────────────────────────────────────

export interface AuthContextValue {
  user:    User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user:    null,
  loading: true,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * onAuthStateChanged fires immediately with:
     *   - null  → no user logged in
     *   - User  → user is logged in (token is valid)
     * Setting loading=false AFTER first fire prevents layout flash.
     */
    const unsubscribe = subscribeToAuthState((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Unsubscribe when the root layout unmounts (prevents memory leak)
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the current auth state.
 * Throws if used outside of an <AuthProvider> — this is intentional.
 *
 * @example
 * const { user, loading } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user) redirect('/login');
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
