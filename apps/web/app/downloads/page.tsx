'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DownloadCard, DownloadItem } from '@/components/downloads/DownloadCard';
import { DownloadCardSkeleton } from '@/components/downloads/DownloadCardSkeleton';
import { Button } from '@/components/ui/Button';

const INITIAL_DOWNLOADS: Omit<DownloadItem, 'publicUrl' | 'loading' | 'error'>[] = [
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
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const resolveDownloadUrls = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const itemsWithUrls: DownloadItem[] = INITIAL_DOWNLOADS.map((item) => {
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
              error: `Failed to generate public URL for ${item.title}`,
            };
          }
        } catch (err: any) {
          return {
            ...item,
            publicUrl: null,
            loading: false,
            error: err?.message || 'Failed to resolve download URL',
          };
        }
      });

      setDownloads(itemsWithUrls);
    } catch (err: any) {
      console.error('Error fetching download URLs:', err);
      setError(err.message || 'Failed to load downloads storage bucket artifacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    resolveDownloadUrls();
  }, [resolveDownloadUrls]);

  return (
    <main className="min-h-screen bg-surface p-6 md:p-12 text-text" data-testid="downloads-page-container">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-text" data-testid="downloads-title">
            Bug Tracker Downloads
          </h1>
          <p className="text-text-secondary text-base max-w-2xl" data-testid="downloads-subtitle">
            Download our native mobile app, desktop application, or browser extension to manage bugs on any platform.
          </p>
        </header>

        {/* Error Fallback Banner */}
        {error && (
          <div
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between"
            data-testid="downloads-error-fallback"
            role="alert"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={resolveDownloadUrls}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading Skeleton Grid (No CLS layout shift) */}
        {loading ? (
          <div data-testid="downloads-loading-container">
            <DownloadCardSkeleton />
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="downloads-grid">
            {downloads.map((item) => (
              <DownloadCard key={item.storagePath} item={item} onRetry={resolveDownloadUrls} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
