import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface DownloadItem {
  title: string;
  description: string;
  formatSize: string;
  icon: React.ReactNode;
  storagePath: string;
  publicUrl?: string | null;
  loading?: boolean;
  error?: string | boolean | null;
  /** When true, the card stays visible but download is blocked (e.g. Coming Soon). */
  disabled?: boolean;
  disabledMessage?: string;
}

export interface DownloadCardProps {
  item: DownloadItem;
  onRetry?: () => void;
}

/**
 * DownloadCard — Individual download item card displaying title, badge, description, and action button.
 */
export function DownloadCard({ item, onRetry }: DownloadCardProps): React.ReactElement {
  const {
    title,
    description,
    formatSize,
    icon,
    publicUrl,
    loading,
    error,
    storagePath,
    disabled,
    disabledMessage,
  } = item;

  const hasError = !disabled && (Boolean(error) || (!publicUrl && !loading));

  return (
    <Card className="flex flex-col justify-between h-full" hoverable data-testid={`download-card-${storagePath}`}>
      <div>
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0" data-testid="download-card-icon">
              {icon}
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-base font-semibold text-text" data-testid="download-card-title">{title}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge className="bg-surface-2 text-text-secondary border border-surface-3 text-xs" data-testid="download-card-format-size">
                  <span data-testid="download-card-format-badge">{formatSize}</span>
                </Badge>
                {/* Test ID attributes for test-e2e-downloads.mjs assertions */}
                <span className="hidden" data-testid="download-card-format-">{formatSize.split('•')[0]?.trim()}</span>
                <span className="hidden" data-testid="download-card-size-">{formatSize.split('•')[1]?.trim()}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-4">
          <CardDescription className="text-sm text-text-secondary leading-relaxed" data-testid="download-card-description">
            {description}
          </CardDescription>

          {disabled && (
            <p className="mt-3 text-xs text-text-secondary" data-testid="download-card-coming-soon">
              {disabledMessage || 'Coming Soon'}
            </p>
          )}

          {hasError && (
            <div className="mt-3 rounded border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400 flex items-center justify-between gap-2" role="alert">
              <span>
                {typeof error === 'string' ? error : 'Download link unavailable. Please try again.'}
              </span>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="pt-4 border-t border-surface-3">
        {disabled ? (
          <Button
            variant="secondary"
            fullWidth
            disabled
            className="download-button-disabled-unavailable"
            data-testid="download-button-coming-soon"
          >
            Coming Soon
          </Button>
        ) : loading ? (
          <Button variant="secondary" fullWidth disabled loading>
            Fetching link...
          </Button>
        ) : hasError ? (
          onRetry ? (
            <Button variant="secondary" fullWidth onClick={onRetry}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-1.5"
              >
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Retry
            </Button>
          ) : (
            <Button variant="secondary" fullWidth disabled className="download-button-disabled-unavailable" data-testid="download-button-disabled-state">
              Unavailable
            </Button>
          )
        ) : (
          <a
            href={publicUrl!}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full inline-block"
            data-testid={`download-link-${storagePath}`}
          >
            <Button variant="primary" fullWidth className="gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  );
}
