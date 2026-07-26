'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { BugDetail } from '@/features/bugs/components/BugDetail';

export function BugDetailWrapper(): React.ReactElement {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="flex items-center justify-center py-20 text-text-secondary">
        No bug ID provided.
      </div>
    );
  }

  return <BugDetail bugId={id} />;
}
