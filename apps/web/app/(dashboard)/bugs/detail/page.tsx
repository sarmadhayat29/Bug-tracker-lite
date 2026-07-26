import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { BugDetailWrapper } from './BugDetailWrapper';
import { Spinner } from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Bug Detail',
};

/**
 * /bugs/detail — Bug detail page
 *
 * Displays a single bug report using the id from the query string.
 */
export default function BugDetailPage(): React.ReactElement {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    }>
      <BugDetailWrapper />
    </Suspense>
  );
}
