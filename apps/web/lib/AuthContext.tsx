/**
 * lib/AuthContext.tsx
 *
 * Re-export from the canonical location for backward compatibility.
 * The provider and hook now live in providers/AuthProvider.tsx.
 *
 * Import from providers/AuthProvider.tsx directly for new code.
 */
export { AuthProvider, useAuth } from '@/providers/AuthProvider';
export type { AuthContextValue } from '@/providers/AuthProvider';
