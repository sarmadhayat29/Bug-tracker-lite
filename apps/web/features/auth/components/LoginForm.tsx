'use client';

/**
 * features/auth/components/LoginForm.tsx
 *
 * Login form component for the /login page.
 * Handles form state, validation, Supabase signIn(), and redirect.
 *
 * This is a placeholder scaffold — the form structure is complete
 * but the submit handler calls the real signIn() from lib/auth.ts.
 */

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input }  from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card }   from '@/components/ui/Card';
import { signIn } from '@/lib/auth';

export function LoginForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.replace(callbackUrl);
  };

  return (
    <Card padding="lg" className="animate-slide-up">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-text">Sign in to your account</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Enter your credentials to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Email"
          type="email"
          id="login-email"
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
          id="login-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={loading}
        />

        {/* Error message */}
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
          Sign In
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary hover:text-primary-light">
          Create one
        </Link>
      </p>
    </Card>
  );
}
