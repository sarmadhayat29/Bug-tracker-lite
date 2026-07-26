import React from 'react';
import { cn } from '@/lib/utils';

// ─── Sizes ────────────────────────────────────────────────────────────────────

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?:      keyof typeof sizes;
  className?: string;
  label?:     string; // aria-label for screen readers
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Spinner — loading indicator.
 * Uses an SVG ring with a CSS animation for smoothest performance.
 *
 * @example
 * <Spinner size="lg" />
 * <Spinner size="sm" className="text-white" />
 */
export function Spinner({
  size = 'md',
  className,
  label = 'Loading…',
}: SpinnerProps): React.ReactElement {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block rounded-full border-surface-3 border-t-primary animate-spin-slow',
        sizes[size],
        className,
      )}
    />
  );
}

// ─── Full-screen variant ──────────────────────────────────────────────────────

/**
 * FullScreenSpinner — centered full-screen loading state.
 * Used during auth resolution or page transitions.
 */
export function FullScreenSpinner(): React.ReactElement {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary">Loading…</p>
      </div>
    </div>
  );
}
