import type { Metadata } from 'next';
import { BugForm } from '@/features/bugs/components/BugForm';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Report Bug',
};

/**
 * /bugs/new — Create bug page
 *
 * Houses the bug creation form including:
 *   - Title, description, severity fields
 *   - HTML Canvas screenshot annotation
 *   - Submit handler via createBug() from lib/bugs.ts
 */
export default function NewBugPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Report a Bug"
        description="Fill in the details below. You can annotate a screenshot before submitting."
        backHref="/dashboard"
      />
      <BugForm />
    </div>
  );
}
