/**
 * apps/web/lib/auth.ts
 *
 * Supabase Authentication helper functions for the Next.js web app.
 */

import { supabase } from './supabase';
import { CreateProfilePayload, UserProfile, parseAuthError as parseAuthErrorMessage } from '@bug-tracker/shared';
import { User, AuthError } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResult {
  user: User | null;
  error: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAuthError(error: AuthError): string {
  return parseAuthErrorMessage(error.message);
}

// ─── Auth Functions ───────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed.');

    const user = data.user;

    const profilePayload = {
      uid: user.id,
      email: user.email!,
      display_name: displayName ?? null,
      avatar_url: null,
      created_at: Date.now(),
      last_seen_at: Date.now(),
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profilePayload]);

    if (profileError) {
      console.error('Failed to create profile record:', profileError);
    }

    return { user, error: null };
  } catch (err) {
    return { user: null, error: parseAuthError(err as AuthError) };
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    const user = data.user;

    // Best-effort last seen update
    try {
      await supabase
        .from('profiles')
        .update({ last_seen_at: Date.now() })
        .eq('uid', user.id);
    } catch {}

    return { user, error: null };
  } catch (err) {
    return { user: null, error: parseAuthError(err as AuthError) };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('uid', uid)
    .single();

  if (error || !data) return null;
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    bugCount: 0, // Need aggregation for this in postgres if wanted
    createdAt: data.created_at,
    lastSeenAt: data.last_seen_at,
  } as UserProfile;
}

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user ?? null);
    }
  );
  return () => subscription.unsubscribe();
}
