'use client';

/**
 * app/page.tsx — Root redirect page
 *
 * Immediately redirects users based on their auth state:
 *   - Authenticated → /dashboard
 *   - Not authenticated → /login
 *
 * Shows a full-screen spinner while Supabase resolves the initial auth state
 * to prevent the flash of wrong content.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Spinner } from '@/components/ui/Spinner';

export default function RootPage(): JSX.Element {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Always show spinner — the redirect fires immediately after auth resolves
  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <Spinner size="lg" />
    </div>
  );
}
