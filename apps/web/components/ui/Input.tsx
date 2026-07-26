import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Input — styled text input with label, error, and icon support.
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="dev@example.com"
 *   error={errors.email}
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="form-group">
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {props.required && (
              <span className="ml-1 text-red-400" aria-hidden="true">*</span>
            )}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-disabled">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base styles
              'w-full rounded bg-surface-2 border border-surface-3 text-text text-sm',
              'px-3 py-2 placeholder:text-text-disabled',
              'transition-smooth',
              // Focus
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              // Error state
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              // Icon padding
              !!leftIcon  && 'pl-10',
              !!rightIcon && 'pr-10',
              // Disabled
              props.disabled && 'cursor-not-allowed opacity-50',
              className,
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-disabled">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !error && (
          <p className="text-xs text-text-disabled">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
