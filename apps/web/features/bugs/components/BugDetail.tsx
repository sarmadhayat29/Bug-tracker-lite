'use client';

/**
 * features/bugs/components/BugDetail.tsx
 *
 * Bug detail view — fetches a single bug and renders all fields.
 * Uses useBug() hook for status update and delete operations.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BugStatus, STATUS_CONFIG } from '@bug-tracker/shared';
import { useBug } from '../hooks/useBug';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatDate, timeAgo, cn } from '@/lib/utils';

interface BugDetailProps {
  bugId: string;
}

const STATUS_OPTIONS: BugStatus[] = ['open', 'in_progress', 'resolved'];

export function BugDetail({ bugId }: BugDetailProps): React.ReactElement {
  const router = useRouter();
  const { bug, loading, error, updating, deleting, handleStatusChange, handleDelete } = useBug(bugId);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error / not found state
  if (error || !bug) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-sm text-red-400">{error ?? 'Bug not found.'}</p>
        <Button variant="secondary" onClick={() => router.replace('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const onConfirmDelete = async () => {
    try {
      await handleDelete();
      router.replace('/dashboard');
    } catch {
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title={bug.title}
          backHref="/dashboard"
        />

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4">
          <SeverityBadge severity={bug.severity} />
          <StatusBadge   status={bug.status} />
          <span className="text-xs text-text-disabled tracking-wide">
            Created {formatDate(bug.createdAt)}
          </span>
          <span className="text-xs text-text-disabled tracking-wide">
            Updated {timeAgo(bug.updatedAt)}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left: main content */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Description */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-text-secondary whitespace-pre-wrap leading-relaxed">
                  {bug.description}
                </p>
                {bug.pageUrl && (
                  <p className="mt-3 text-xs text-text-disabled break-words">
                    Captured from:{' '}
                    {/^https?:\/\//i.test(bug.pageUrl) ? (
                      <a
                        href={bug.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {bug.pageUrl}
                      </a>
                    ) : (
                      <span>{bug.pageUrl}</span>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Screenshot */}
            {bug.screenshotUrl && (
              <Card padding="md">
                <CardHeader>
                  <CardTitle>Annotated Screenshot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-hidden rounded-lg border border-surface-3">
                    <Image
                      src={bug.screenshotUrl}
                      alt="Bug screenshot"
                      width={800}
                      height={500}
                      className="w-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: actions sidebar */}
          <div className="flex flex-col gap-4">
            {/* Status update */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {STATUS_OPTIONS.map((s) => {
                    const { label, color } = STATUS_CONFIG[s];
                    const isActive = bug.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => !isActive && handleStatusChange(s)}
                        disabled={isActive || updating}
                        className={cn(
                          'flex items-center gap-2.5 rounded px-3 py-2 text-sm w-full text-left',
                          'border transition-smooth',
                          isActive
                            ? 'border-primary/30 bg-primary/10 text-text font-medium cursor-default'
                            : 'border-surface-3 text-text-secondary hover:text-text hover:border-surface-3/50',
                          (isActive || updating) && 'opacity-60',
                        )}
                        aria-pressed={isActive}
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                          aria-hidden="true"
                        />
                        {label}
                        {updating && isActive && (
                          <Spinner size="sm" className="ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Delete */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                >
                  Delete Bug
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Bug"
        description="This action cannot be undone. The bug and its screenshot will be permanently deleted."
        size="sm"
      >
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deleting}
            onClick={onConfirmDelete}
          >
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </>
  );
}
