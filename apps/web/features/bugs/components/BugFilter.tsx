'use client';

/**
 * features/bugs/components/BugFilter.tsx
 *
 * Status filter tab bar for the bug list.
 * Renders "All", "Open", "In Progress", "Resolved" tabs.
 */

import React from 'react';
import { BugStatus, STATUS_CONFIG } from '@bug-tracker/shared';
import { cn } from '@/lib/utils';

// ─── Filter options ───────────────────────────────────────────────────────────

const FILTERS: { label: string; value: BugStatus | undefined }[] = [
  { label: 'All',         value: undefined      },
  { label: 'Open',        value: 'open'         },
  { label: 'In Progress', value: 'in_progress'  },
  { label: 'Resolved',    value: 'resolved'     },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface BugFilterProps {
  activeFilter: BugStatus | undefined;
  onChange:     (filter: BugStatus | undefined) => void;
  counts?:      Partial<Record<BugStatus | 'all', number>>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BugFilter — horizontal tab bar for filtering the bug list by status.
 *
 * @example
 * <BugFilter activeFilter={statusFilter} onChange={setStatusFilter} />
 */
export function BugFilter({ activeFilter, onChange, counts }: BugFilterProps): React.ReactElement {
  return (
    <div
      className="flex gap-1 rounded-lg bg-surface-1 p-1 border border-surface-3 w-fit"
      role="tablist"
      aria-label="Filter bugs by status"
    >
      {FILTERS.map(({ label, value }) => {
        const isActive = activeFilter === value;
        const count = value
          ? counts?.[value]
          : counts?.all;

        return (
          <button
            key={label}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={cn(
              'flex items-center gap-1.5 rounded px-3 py-1.5',
              'text-xs font-medium transition-smooth whitespace-nowrap',
              isActive
                ? 'bg-surface-2 text-text shadow-sm'
                : 'text-text-secondary hover:text-text',
            )}
          >
            {label}
            {count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                  isActive ? 'bg-primary/20 text-primary' : 'bg-surface-3 text-text-disabled',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
