import React from 'react';
import Link from 'next/link';
import { Bug } from '@bug-tracker/shared';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { timeAgo } from '@/lib/utils';

interface BugCardProps {
  bug: Bug;
}

/**
 * BugCard — a single row in the bug list.
 * Clickable card linking to the bug detail page.
 *
 * Displays: title, description (truncated), severity, status, and age.
 */
export function BugCard({ bug }: BugCardProps): React.ReactElement {
  return (
    <Link href={`/bugs/detail?id=${bug.id}`} className="block group">
      <Card
        hoverable
        padding="md"
        className="transition-smooth group-hover:border-primary/30"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Left: title + description */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium leading-snug text-text truncate group-hover:text-primary transition-colors">
              {bug.title}
            </h3>
            {bug.description && (
              <p className="mt-1 text-xs text-text-secondary line-clamp-2 leading-relaxed">
                {bug.description}
              </p>
            )}
            {/* Source URL (from extension) */}
            {bug.pageUrl && (
              <p className="mt-1 text-xs text-text-disabled truncate break-words">
                {bug.pageUrl}
              </p>
            )}
          </div>

          {/* Right: badges + time */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <SeverityBadge severity={bug.severity} />
            <StatusBadge   status={bug.status} />
            <span className="text-xs text-text-disabled whitespace-nowrap">
              {timeAgo(bug.createdAt)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
