import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

// ─── Variants ─────────────────────────────────────────────────────────────────

const variants = {
  primary:   'bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-glow',
  secondary: 'bg-surface-2 hover:bg-surface-3 text-text border border-surface-3',
  danger:    'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30',
  ghost:     'hover:bg-surface-2 text-text-secondary hover:text-text',
  link:      'text-primary hover:text-primary-light underline-offset-4 hover:underline p-0 h-auto',
} as const;

const sizes = {
  sm:   'h-8  px-3   text-xs  gap-1.5 rounded-sm',
  md:   'h-9  px-4   text-sm  gap-2   rounded',
  lg:   'h-11 px-6   text-sm  gap-2   rounded-lg',
  icon: 'h-9  w-9    text-sm  rounded',
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  keyof typeof variants;
  size?:     keyof typeof sizes;
  loading?:  boolean;
  fullWidth?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Button — primary interactive element.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleSubmit}>
 *   Submit Bug
 * </Button>
 *
 * <Button variant="danger" loading={isDeleting}>
 *   Delete
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant  = 'primary',
      size     = 'md',
      loading  = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          'inline-flex items-center justify-center font-medium',
          'transition-smooth select-none whitespace-nowrap',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          // Variant + size
          variants[variant],
          sizes[size],
          // States
          isDisabled && 'cursor-not-allowed opacity-50',
          fullWidth  && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && <Spinner size="sm" className="shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
