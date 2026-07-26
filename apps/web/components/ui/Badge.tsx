import React from 'react';
import { cn } from '@/lib/utils';
import { BugSeverity, BugStatus, SEVERITY_CONFIG, STATUS_CONFIG } from '@bug-tracker/shared';

// ─── Generic Badge ────────────────────────────────────────────────────────────

interface BadgeProps {
  children:  React.ReactNode;
  color?:    string;
  className?: string;
}

/**
 * Badge — generic coloured pill label.
 * Used directly or through SeverityBadge / StatusBadge helpers below.
 */
export function Badge({ children, color, className }: BadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
        'text-xs font-medium',
        className,
      )}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {children}
    </span>
  );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

interface SeverityBadgeProps {
  severity:   BugSeverity;
  className?: string;
}

/**
 * SeverityBadge — coloured chip for bug severity (low/medium/high/critical).
 *
 * @example
 * <SeverityBadge severity="critical" />
 */
export function SeverityBadge({ severity, className }: SeverityBadgeProps): React.ReactElement {
  const { label, color } = SEVERITY_CONFIG[severity];
  return (
    <Badge color={color} className={className}>
      {label}
    </Badge>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status:     BugStatus;
  className?: string;
}

/**
 * StatusBadge — coloured chip for bug status (open/in_progress/resolved).
 *
 * @example
 * <StatusBadge status="in_progress" />
 */
export function StatusBadge({ status, className }: StatusBadgeProps): React.ReactElement {
  const { label, color } = STATUS_CONFIG[status];
  return (
    <Badge color={color} className={className}>
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </Badge>
  );
}
