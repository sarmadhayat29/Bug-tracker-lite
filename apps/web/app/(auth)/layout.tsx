'use client';

// Metadata should be exported from page.tsx, not from a client layout.

/**
 * (auth)/layout.tsx — Auth pages layout
 *
 * Used by /login and /signup.
 * Provides a full-screen vertically-centered container with
 * a decorative background gradient.
 * No sidebar, no topbar — auth pages are standalone.
 */
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Spinner } from '@/components/ui/Spinner';

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface">
      {/* Decorative radial gradient behind the auth card */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      {/* Auth card container */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-glow">
            {/* Bug icon SVG */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 2l1.88 1.88" />
              <path d="M14.12 3.88L16 2" />
              <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
              <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
              <path d="M12 20v-9" />
              <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
              <path d="M6 13H2" />
              <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
              <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
              <path d="M22 13h-4" />
              <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-text">Bug Tracker Lite</span>
        </div>

        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-xs text-text-disabled">
        © {new Date().getFullYear()} Bug Tracker Lite. Internship MVP.
      </p>
    </div>
  );
}
