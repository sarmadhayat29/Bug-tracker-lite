import type { Metadata } from 'next';
import { SignupForm } from '@/features/auth/components/SignupForm';

export const metadata: Metadata = {
  title: 'Create Account',
};

/**
 * /signup — Registration page
 * The actual form logic lives in features/auth/components/SignupForm.tsx
 */
export default function SignupPage(): JSX.Element {
  return <SignupForm />;
}
