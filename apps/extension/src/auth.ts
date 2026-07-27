/**
 * apps/extension/src/auth.ts
 *
 * Supabase Auth helpers for the Chrome Extension popup.
 */

import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

const TOKEN_KEY = 'bt_auth_uid';

/** Sign in and persist the UID to chrome.storage.local (optional fallback) */
export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('No user returned');

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ [TOKEN_KEY]: data.user.id });
  }
  return data.user;
}

/** Sign out and clear persisted UID */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.remove(TOKEN_KEY);
  }
}

/** Returns the current user, or null if not signed in */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

/** One-shot check: is a UID stored in chrome.storage? */
export async function getStoredUid(): Promise<string | null> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const result = await chrome.storage.local.get(TOKEN_KEY);
    return result[TOKEN_KEY] ?? null;
  }
  return null;
}
