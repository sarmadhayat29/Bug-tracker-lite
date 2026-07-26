import type { Metadata } from 'next';
import { BugList } from '@/features/bugs/components/BugList';
import { PageHeader } from '@/components/layout/PageHeader';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/**
 * /dashboard — Bug list page (primary view)
 *
 * This is the home screen of the authenticated app.
 * Shows the real-time bug list owned by the current user.
 * BugList handles its own data fetching via the useBugs() hook.
 */
export default function DashboardPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="All Bugs"
        description="Track and manage bug reports in real time."
        action={{
          label: 'Report Bug',
          href:  '/bugs/new',
        }}
      />
      <BugList />
    </div>
  );
}
