'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DownloadCard, DownloadItem } from '@/components/downloads/DownloadCard';
import { DownloadCardSkeleton } from '@/components/downloads/DownloadCardSkeleton';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

const INITIAL_DELIVERABLES: Omit<DownloadItem, 'publicUrl' | 'loading' | 'error'>[] = [
  {
    title: 'Android App',
    description: 'Native mobile application for tracking and reporting bugs on Android devices.',
    formatSize: 'APK • 48 MB',
    storagePath: 'builds/Android.apk',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
  {
    title: 'Windows App',
    description: 'Native desktop installer for full-featured desktop bug tracking and annotation.',
    formatSize: 'EXE • 75 MB',
    storagePath: 'builds/Desktop.exe',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: 'Chrome Extension',
    description: 'Web extension package for seamless web bug capture and instant reporting.',
    formatSize: 'ZIP • 12 MB',
    storagePath: 'builds/ChromeExtension.zip',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

export default function DownloadsPage(): React.ReactElement {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetchDownloadUrls = useCallback(async () => {
    setLoading(true);
    setGlobalError(null);

    try {
      const updatedItems: DownloadItem[] = INITIAL_DELIVERABLES.map((item) => {
        try {
          const { data } = supabase.storage.from('downloads').getPublicUrl(item.storagePath);
          if (data?.publicUrl) {
            return {
              ...item,
              publicUrl: data.publicUrl,
              loading: false,
              error: null,
            };
          } else {
            return {
              ...item,
              publicUrl: null,
              loading: false,
              error: 'Download URL missing',
            };
          }
        } catch (err: any) {
          return {
            ...item,
            publicUrl: null,
            loading: false,
            error: err?.message || 'Failed to fetch public URL',
          };
        }
      });

      setItems(updatedItems);
    } catch (err: any) {
      setGlobalError(err?.message || 'An unexpected error occurred while loading downloads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDownloadUrls();
  }, [fetchDownloadUrls]);

  return (
    <div className="flex flex-col gap-6" data-testid="downloads-page-container">
      <PageHeader
        title="Download Center"
        description="Download official Bug Tracker Lite apps and browser extensions for your platform."
      />

      {globalError ? (
        <div
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400 flex flex-col gap-3"
          role="alert"
          data-testid="downloads-error-fallback"
        >
          <p className="text-sm font-medium">{globalError}</p>
          <div>
            <Button variant="secondary" size="sm" onClick={fetchDownloadUrls}>
              Retry Loading
            </Button>
          </div>
        </div>
      ) : loading ? (
        <DownloadCardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="downloads-grid">
          {items.map((item) => (
            <DownloadCard key={item.storagePath} item={item} onRetry={fetchDownloadUrls} />
          ))}
        </div>
      )}
    </div>
  );
}
