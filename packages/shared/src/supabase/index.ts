import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Global singleton instance of Supabase
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseApp(supabaseUrl: string, supabaseAnonKey: string): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('[Bug Tracker] Supabase URL and Anon Key must be provided on first initialization.');
  }
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

export function assertSupabaseConfig(url?: string, key?: string): void {
  if (!url || !key) {
    throw new Error('[Bug Tracker] Missing Supabase config keys. Check your .env file.');
  }
}
