import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

/**
 * DownloadCardSkeleton — 3-card grid placeholder with animate-pulse loading skeletons.
 */
export function DownloadCardSkeleton(): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="download-card-skeleton">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="flex flex-col justify-between h-full animate-pulse">
          <div>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-surface-2 shrink-0 animate-pulse" />
                <div className="flex flex-col gap-2">
                  <div className="h-5 w-32 rounded bg-surface-2 animate-pulse" />
                  <div className="h-4 w-20 rounded bg-surface-2 animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-surface-2 animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-surface-2 animate-pulse" />
              </div>
            </CardContent>
          </div>
          <CardFooter className="pt-4 border-t border-surface-3">
            <div className="h-9 w-full rounded bg-surface-2 animate-pulse" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
