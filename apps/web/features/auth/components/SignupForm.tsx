'use client';

/**
 * features/auth/components/SignupForm.tsx
 *
 * Signup form component for the /signup page.
 * Calls signUp() from lib/auth.ts which creates both the Firebase
 * Auth account and the Firestore profile document atomically.
 */

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input }  from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card }   from '@/components/ui/Card';
import { signUp } from '@/lib/auth';

export function SignupForm(): React.ReactElement {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [error,       setError]       = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, displayName || undefined);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.replace('/dashboard');
  };

  return (
    <Card padding="lg" className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text">Create your account</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Start tracking bugs across all your projects.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Display Name"
          type="text"
          id="signup-name"
          placeholder="Alex Dev"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          hint="Optional — shown in activity logs."
          disabled={loading}
        />

        <Input
          label="Email"
          type="email"
          id="signup-email"
          placeholder="dev@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          id="signup-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          hint="Minimum 6 characters."
          autoComplete="new-password"
          disabled={loading}
        />

        <Input
          label="Confirm Password"
          type="password"
          id="signup-confirm"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          disabled={loading}
        />

        {/* Error */}
        {error && (
          <div
            className="rounded bg-red-500/10 border border-red-500/30 px-3 py-2"
            role="alert"
          >
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          className="mt-2"
        >
          Create Account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-primary-light">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
