import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Spinner } from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Sign In',
};

/**
 * /login — Sign-in page
 * The actual form logic lives in features/auth/components/LoginForm.tsx
 */
export default function LoginPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-10">
        <Spinner />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
