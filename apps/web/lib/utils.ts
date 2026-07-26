/**
 * lib/utils.ts
 *
 * Shared utility functions for the web app.
 */

// ─── cn — className merger ────────────────────────────────────────────────────

/**
 * Merges class names, filtering out falsy values.
 * Lightweight alternative to clsx/tailwind-merge for MVP scope.
 *
 * @example
 * cn('base-class', isActive && 'active', undefined, 'other-class')
 * // → 'base-class active other-class'
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Date formatting ──────────────────────────────────────────────────────────

/**
 * Formats a Unix timestamp (ms) as a human-readable relative time.
 * e.g. "2 hours ago", "3 days ago"
 */
export function timeAgo(timestampMs: number): string {
  const diff = Date.now() - timestampMs;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (seconds < 60)  return 'just now';
  if (minutes < 60)  return `${minutes}m ago`;
  if (hours < 24)    return `${hours}h ago`;
  if (days < 30)     return `${days}d ago`;

  return new Date(timestampMs).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

/**
 * Formats a Unix timestamp (ms) as a full date string.
 * e.g. "Jul 26, 2026, 4:30 PM"
 */
export function formatDate(timestampMs: number): string {
  return new Date(timestampMs).toLocaleString('en-US', {
    month:  'short',
    day:    'numeric',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

// ─── String helpers ───────────────────────────────────────────────────────────

/**
 * Truncates a string to a maximum length, adding "…" if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Capitalises the first letter of a string.
 */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
