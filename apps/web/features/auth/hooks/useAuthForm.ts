'use client';

/**
 * features/auth/hooks/useAuthForm.ts
 *
 * Shared form state hook for auth forms.
 * Extracts common loading/error state management used by both
 * LoginForm and SignupForm.
 */

import { useState } from 'react';

interface UseAuthFormReturn {
  loading:     boolean;
  error:       string | null;
  setError:    (msg: string | null) => void;
  setLoading:  (v: boolean) => void;
  clearError:  () => void;
}

/**
 * Manages loading and error state for auth form submissions.
 *
 * @example
 * const { loading, error, setError, setLoading, clearError } = useAuthForm();
 */
export function useAuthForm(): UseAuthFormReturn {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  return {
    loading,
    error,
    setError,
    setLoading,
    clearError: () => setError(null),
  };
}
