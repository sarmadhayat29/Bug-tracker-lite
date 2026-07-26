import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Bug Tracker Lite',
    default:  'Bug Tracker Lite',
  },
  description: 'A minimal cross-platform bug reporting tool for developers and QA.',
  keywords:    ['bug tracker', 'issue tracker', 'QA', 'developer tools'],
};

/**
 * Root layout — wraps the entire app.
 * Only sets up the HTML shell and the AuthProvider context.
 * Visual layouts (auth-centered, dashboard-sidebar) live in route group layouts.
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="h-full bg-surface text-text antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
