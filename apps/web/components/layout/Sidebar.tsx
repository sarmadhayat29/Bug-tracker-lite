'use client';

/**
 * components/layout/Sidebar.tsx
 *
 * Fixed left sidebar for the dashboard shell.
 * Contains navigation links, a live indicator, and the app brand.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href:  '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Report Bug',
    href:  '/bugs/new',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col',
        'w-[--sidebar-width] h-screen',
        'bg-surface-1 border-r border-surface-3',
        'shrink-0',
      )}
      aria-label="Main navigation"
    >
      {/* Brand */}
      <div className="flex h-[--topbar-height] items-center gap-3 px-4 border-b border-surface-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
            <path d="M12 20v-9" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-text">Bug Tracker</span>
        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="live-dot" aria-hidden="true" />
          <span className="text-xs text-text-disabled">Live</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5" role="list">
          {NAV_ITEMS.map(({ label, href, icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded px-3 py-2 text-sm',
                    'transition-smooth',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-text-secondary hover:bg-surface-2 hover:text-text',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={isActive ? 'text-primary' : 'text-text-disabled'}>
                    {icon}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: app version */}
      <div className="border-t border-surface-3 px-4 py-3">
        <p className="text-xs text-text-disabled">Bug Tracker Lite v1.0</p>
      </div>
    </aside>
  );
}
