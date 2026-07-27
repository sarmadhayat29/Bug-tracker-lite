/**
 * apps/web/lib/supabase.ts
 *
 * Initialises and exports the Supabase client instance for the Next.js app.
 */

import { assertSupabaseConfig, getSupabaseApp } from '@bug-tracker/shared';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

assertSupabaseConfig(supabaseUrl, supabaseAnonKey);

export const supabase = getSupabaseApp(supabaseUrl!, supabaseAnonKey!);
