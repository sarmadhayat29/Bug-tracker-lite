'use client';

/**
 * features/bugs/components/BugList.tsx
 *
 * Real-time bug list container.
 * Uses useBugs() hook for Firestore subscription and renders
 * BugCard rows with filter controls.
 */

import React, { useState } from 'react';
import { BugStatus } from '@bug-tracker/shared';
import { useBugs } from '../hooks/useBugs';
import { BugCard } from './BugCard';
import { BugFilter } from './BugFilter';
import { Spinner } from '@/components/ui/Spinner';

export function BugList(): React.ReactElement {
  const [statusFilter, setStatusFilter] = useState<BugStatus | undefined>(undefined);
  const { bugs, loading, error } = useBugs({ statusFilter });

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <BugFilter
        activeFilter={statusFilter}
        onChange={setStatusFilter}
        counts={{
          // Counts from the full unfiltered list are shown by BugFilter
          // using its own useBugs() without a filter
        }}
      />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && bugs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-text-disabled"
            >
              <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z" />
              <path d="M12 20v-9" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-text">No bugs found</p>
            <p className="text-xs text-text-secondary mt-1">
              {statusFilter
                ? `No ${statusFilter.replace('_', ' ')} bugs. Try a different filter.`
                : 'Nothing reported yet. Click "Report Bug" to get started.'}
            </p>
          </div>
        </div>
      )}

      {/* Bug list */}
      {!loading && !error && bugs.length > 0 && (
        <ul className="flex flex-col gap-4" role="list" aria-label="Bug reports">
          {bugs.map((bug) => (
            <li key={bug.id}>
              <BugCard bug={bug} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
