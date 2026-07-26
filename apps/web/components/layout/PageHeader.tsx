import Link from 'next/link';
import { Button } from '@/components/ui/Button';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title:        string;
  description?: string;
  backHref?:    string;
  action?: {
    label: string;
    href:  string;
    icon?: React.ReactNode;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PageHeader — consistent page title section.
 * Used at the top of every dashboard page.
 *
 * @example
 * <PageHeader
 *   title="All Bugs"
 *   description="Track bugs in real time."
 *   action={{ label: 'Report Bug', href: '/bugs/new' }}
 * />
 */
export function PageHeader({ title, description, backHref, action }: PageHeaderProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: back link + title */}
      <div className="flex flex-col gap-1">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text w-fit mb-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        )}
        <h1 className="text-xl font-bold text-text tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>

      {/* Right: action button */}
      {action && (
        <Link href={action.href} className="shrink-0">
          <Button variant="primary" size="md">
            {action.icon ? (
              <>{action.icon}</>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
