/**
 * apps/extension/src/config.ts
 *
 * Supabase configuration for the Chrome Extension.
 * Reads environment variables injected at build time by esbuild (build.mjs).
 */

declare var process: any;

export const CONFIG = {
  supabaseUrl:     process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};
