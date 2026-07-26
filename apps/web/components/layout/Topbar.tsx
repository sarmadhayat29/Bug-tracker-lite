'use client';

/**
 * components/layout/Topbar.tsx
 *
 * Horizontal top bar for the dashboard shell.
 * Contains the page title area (mobile brand), user menu, and sign-out.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Topbar(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.replace('/login');
  };

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <header
      className={cn(
        'flex h-[--topbar-height] items-center justify-between',
        'px-4 border-b border-surface-3 bg-surface-1',
        'shrink-0',
      )}
    >
      {/* Mobile: brand (sidebar is hidden on mobile) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-text">Bug Tracker</span>
      </div>

      {/* Desktop: empty left space (sidebar has brand) */}
      <div className="hidden md:block" />

      {/* Right: user avatar + sign out */}
      <div className="flex items-center gap-3">
        {/* Email display */}
        <span className="hidden sm:block text-xs text-text-secondary truncate max-w-[180px]">
          {user?.email}
        </span>

        {/* Avatar */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold"
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Sign out */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          loading={signingOut}
          aria-label="Sign out"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
