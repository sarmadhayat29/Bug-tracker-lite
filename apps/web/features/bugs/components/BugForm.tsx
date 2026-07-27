'use client';

/**
 * features/bugs/components/BugForm.tsx
 *
 * Bug creation form — placeholder scaffold.
 * Will house: title, description, severity select, and canvas annotation.
 * Canvas annotation implementation is in a separate CanvasAnnotator component (next phase).
 */

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { BugSeverity } from '@bug-tracker/shared';
import { Input }  from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card }   from '@/components/ui/Card';
import { createBug } from '@/lib/bugs';
import { useAuth }   from '@/providers/AuthProvider';
import { cn }        from '@/lib/utils';
import { CanvasAnnotator } from './CanvasAnnotator';

// ─── Severity options ─────────────────────────────────────────────────────────

const SEVERITIES: { value: BugSeverity; label: string; color: string }[] = [
  { value: 'low',      label: 'Low',      color: 'text-blue-400'   },
  { value: 'medium',   label: 'Medium',   color: 'text-amber-400'  },
  { value: 'high',     label: 'High',     color: 'text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'text-red-400'    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function BugForm(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [severity,    setSeverity]    = useState<BugSeverity>('medium');
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await createBug(
        {
          title:        title.trim(),
          description:  description.trim(),
          severity,
          status:       'open',
          screenshotUrl: null,
          pageUrl:      null,
          createdBy:    user.id,
        },
        screenshotBlob,
        'web',
      );
      router.replace('/dashboard');
    } catch {
      setError('Failed to create bug. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card padding="lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Title */}
        <Input
          label="Bug Title"
          id="bug-title"
          type="text"
          placeholder="e.g. Submit button freezes on Firefox"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />

        {/* Description */}
        <div className="form-group">
          <label htmlFor="bug-description" className="form-label">
            Description <span className="text-red-400" aria-hidden="true">*</span>
          </label>
          <textarea
            id="bug-description"
            rows={5}
            placeholder="Steps to reproduce, expected vs actual behaviour…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            className={cn(
              'w-full rounded bg-surface-2 border border-surface-3 text-text text-sm',
              'px-3 py-2 placeholder:text-text-disabled resize-y',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              'transition-smooth',
              loading && 'cursor-not-allowed opacity-50',
            )}
          />
        </div>

        {/* Severity selector */}
        <div className="form-group">
          <label className="form-label">Severity</label>
          <div className="flex gap-2 flex-wrap">
            {SEVERITIES.map(({ value, label, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSeverity(value)}
                disabled={loading}
                className={cn(
                  'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium border',
                  'transition-smooth',
                  severity === value
                    ? 'bg-surface-2 border-primary/50 text-text'
                    : 'border-surface-3 text-text-secondary hover:border-surface-3/50 hover:text-text',
                )}
                aria-pressed={severity === value}
              >
                <span className={cn('h-2 w-2 rounded-full', color.replace('text-', 'bg-'))} />
                <span className={severity === value ? color : ''}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot / Canvas Annotator */}
        <div className="form-group">
          <label className="form-label">Screenshot (Optional)</label>
          <CanvasAnnotator onScreenshotChange={setScreenshotBlob} />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded bg-red-500/10 border border-red-500/30 px-3 py-2" role="alert">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
          >
            Submit Bug
          </Button>
        </div>
      </form>
    </Card>
  );
}
