/**
 * apps/extension/src/auth.ts
 *
 * Firebase Auth helpers for the Chrome Extension popup.
 *
 * Auth persistence in MV3:
 * Firebase Auth's default web persistence (localStorage) is BLOCKED in
 * extension service workers (MV3). We store the auth token manually in
 * chrome.storage.local to persist login across browser sessions.
 */

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

const TOKEN_KEY = 'bt_auth_uid';

/** Sign in and persist the UID to chrome.storage.local */
export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [TOKEN_KEY]: credential.user.uid });
  }
  return credential.user;
}

/** Sign out and clear persisted UID */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.remove(TOKEN_KEY);
  }
}

/** Returns the current user, or null if not signed in */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/** One-shot check: is a UID stored in chrome.storage? */
export async function getStoredUid(): Promise<string | null> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(TOKEN_KEY);
    return result[TOKEN_KEY] ?? null;
  }
  return null;
}
