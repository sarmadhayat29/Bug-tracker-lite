import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?:   'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

/**
 * Card — surface container for content blocks.
 *
 * @example
 * <Card hoverable padding="md">
 *   <p>Bug content here</p>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable, padding = 'md', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card',
        paddingMap[padding],
        hoverable && 'cursor-pointer transition-smooth hover:border-surface-3/80 hover:bg-surface-2',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';

// ─── Card Sub-components ──────────────────────────────────────────────────────

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div className={cn('flex flex-col gap-1.5 pb-4 border-b border-surface-3', className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>): React.ReactElement {
  return <h3 className={cn('text-base font-semibold text-text', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>): React.ReactElement {
  return <p className={cn('text-sm text-text-secondary', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={cn('pt-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-surface-3', className)}
      {...props}
    />
  );
}
