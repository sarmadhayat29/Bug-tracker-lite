'use client';

/**
 * app/(dashboard)/layout.tsx — Dashboard shell layout
 *
 * Provides the authenticated app shell:
 *   - Fixed sidebar on left (desktop)
 *   - Topbar across the top
 *   - Main content area fills remaining space
 *
 * Auth guard: redirects to /login if no user is found after loading.
 * This is the client-side complement to middleware.ts.
 */

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Client-side auth guard — middleware handles server-side, this is a fallback
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Show full-screen spinner while resolving auth state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render layout at all if unauthenticated (router.replace is in-flight)
  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Fixed sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="page-container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
