/**
 * apps/extension/src/supabase.ts
 */

import { assertSupabaseConfig, getSupabaseApp } from '@bug-tracker/shared';
import { CONFIG } from './config';

assertSupabaseConfig(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);

export const supabase = getSupabaseApp(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
