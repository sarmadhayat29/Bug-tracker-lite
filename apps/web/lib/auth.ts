/**
 * apps/web/lib/auth.ts
 *
 * Firebase Authentication helper functions for the Next.js web app.
 * All auth state changes flow through these functions — never call
 * Firebase Auth SDK methods directly in components.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
  AuthError,
} from 'firebase/auth';
import { auth, db } from './firebase';
import {
  COLLECTIONS,
  CreateProfilePayload,
  UserProfile,
} from '@bug-tracker/shared';
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResult {
  user: User | null;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a Firebase AuthError code to a human-readable message.
 * Avoids leaking internal error codes to the UI.
 */
function parseAuthError(error: AuthError): string {
  switch (error.code) {
    case 'auth/email-already-in-use':   return 'An account with this email already exists.';
    case 'auth/invalid-email':          return 'Please enter a valid email address.';
    case 'auth/weak-password':          return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':         return 'No account found with this email.';
    case 'auth/wrong-password':         return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':      return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed': return 'Network error. Check your connection.';
    default:                            return 'Something went wrong. Please try again.';
  }
}

// ─── Auth Functions ───────────────────────────────────────────────────────────

/**
 * Creates a new user account and writes their profile document to Firestore.
 * The profile is written in the same operation as account creation.
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = credential;

    // Optionally update the Firebase Auth display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Write the Firestore profile document
    const profilePayload: CreateProfilePayload = {
      uid:         user.uid,
      email:       user.email!,
      displayName: displayName ?? null,
      avatarUrl:   null,
      createdAt:   Date.now(),
    };

    await setDoc(
      doc(db, COLLECTIONS.PROFILES, user.uid),
      profilePayload,
    );

    return { user, error: null };
  } catch (err) {
    return { user: null, error: parseAuthError(err as AuthError) };
  }
}

/**
 * Signs in an existing user and refreshes their `lastSeenAt` timestamp.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = credential;

    // Update last seen — best-effort, don't block login if this fails
    try {
      await updateDoc(
        doc(db, COLLECTIONS.PROFILES, user.uid),
        { lastSeenAt: Date.now() },
      );
    } catch {
      // Non-critical — profile may not exist yet in edge cases
    }

    return { user, error: null };
  } catch (err) {
    return { user: null, error: parseAuthError(err as AuthError) };
  }
}

/**
 * Signs out the current user and clears local Firebase state.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Fetches the current user's Firestore profile.
 * Returns null if the profile document doesn't exist yet.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.PROFILES, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/**
 * Subscribes to auth state changes.
 * Call this once in a top-level provider component.
 * Returns the unsubscribe function — always call it on cleanup.
 *
 * @example
 * useEffect(() => {
 *   const unsub = subscribeToAuthState((user) => setUser(user));
 *   return unsub;
 * }, []);
 */
export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}
