/**
 * Automated smoke test for Android Auth Error Parsing & Validation logic.
 * Run with: node scripts/test-android-auth.mjs
 */

import assert from 'node:assert/strict';

// Mirroring parseAuthError & isValidEmail helpers from apps/android/app/index.tsx
function parseAuthError(message) {
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim() || '');
}

console.log('🧪 Running Android Auth Logic Smoke Tests...\n');

// Test 1: Email Validation
console.log('Test 1: Valid Email Formatting');
assert.equal(isValidEmail('user@example.com'), true, 'Valid email should pass');
assert.equal(isValidEmail('  intern@bugtracker.test  '), true, 'Trimmed valid email should pass');
assert.equal(isValidEmail('invalid-email'), false, 'Email without @ should fail');
assert.equal(isValidEmail('user@'), false, 'Incomplete email should fail');
assert.equal(isValidEmail(''), false, 'Empty email should fail');
console.log('  ✅ Email validation tests passed.');

// Test 2: Supabase Error Message Normalization
console.log('\nTest 2: Supabase Auth Error Mapping');
assert.equal(
  parseAuthError('Invalid login credentials'),
  'Incorrect email or password. Please try again.',
  'Invalid credentials error should map properly'
);
assert.equal(
  parseAuthError('User already registered'),
  'An account with this email already exists.',
  'Already registered error should map properly'
);
assert.equal(
  parseAuthError('Email not confirmed'),
  'Please verify your email address before signing in.',
  'Unconfirmed email error should map properly'
);
assert.equal(
  parseAuthError('Custom network failure'),
  'Custom network failure',
  'Custom errors should fall back to raw message'
);
assert.equal(
  parseAuthError(undefined),
  'An unexpected error occurred. Please try again.',
  'Undefined error message should return generic fallback'
);
console.log('  ✅ Auth error mapping tests passed.');

console.log('\n🎉 All Android Auth Smoke Tests Passed Successfully!');
