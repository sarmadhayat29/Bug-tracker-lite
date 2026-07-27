#!/usr/bin/env node
/**
 * scripts/validate-env.mjs
 *
 * Validates that all required Supabase environment variables are set
 * before running a build or dev server.
 *
 * Usage:
 *   node scripts/validate-env.mjs web      → checks NEXT_PUBLIC_SUPABASE_*
 *   node scripts/validate-env.mjs android  → checks EXPO_PUBLIC_SUPABASE_*
 *
 * Add to package.json scripts:
 *   "prebuild": "node ../../scripts/validate-env.mjs web"
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const platform  = process.argv[2] ?? 'web';

const REQUIRED_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

const PREFIX_MAP = {
  web:     'NEXT_PUBLIC_',
  android: 'EXPO_PUBLIC_',
};

const prefix   = PREFIX_MAP[platform] ?? 'NEXT_PUBLIC_';
const missing  = [];

for (const key of REQUIRED_KEYS) {
  const envKey = `${prefix}${key}`;
  if (!process.env[envKey]) {
    missing.push(envKey);
  }
}

if (missing.length > 0) {
  console.error('\n❌ Missing Supabase environment variables:');
  missing.forEach((k) => console.error(`   - ${k}`));
  console.error(`\n   Copy apps/${platform}/.env.example → apps/${platform}/.env.local and fill in values.\n`);
  process.exit(1);
} else {
  console.log(`✅ Supabase env vars OK for platform: ${platform}`);
}
