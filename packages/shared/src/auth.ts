/**
 * Shared auth helper utilities used across web, Android, and extension clients.
 */

/** Normalize Supabase Auth error messages for end-user display. */
export function parseAuthError(message?: string): string {
  if (!message) return 'An unexpected error occurred. Please try again.';
  switch (message) {
    case 'Invalid login credentials':
      return 'Incorrect email or password. Please try again.';
    case 'User already registered':
      return 'An account with this email already exists.';
    case 'Email not confirmed':
      return 'Please verify your email address before signing in.';
    default:
      return message;
  }
}

/** Basic client-side email format validation. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
