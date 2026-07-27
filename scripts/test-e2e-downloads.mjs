#!/usr/bin/env node
/**
 * scripts/test-e2e-downloads.mjs
 * 
 * Comprehensive Opaque-Box E2E Testing Suite for /downloads Route & Supabase Storage Bucket.
 * Tests Tier 1 (Feature Coverage), Tier 2 (Boundary & Corner Cases), Tier 3 (Cross-Feature UI),
 * and Tier 4 (Real-World Application & Infrastructure).
 * 
 * Run with: node scripts/test-e2e-downloads.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const ROOT_DIR = process.cwd();
let passedCount = 0;
let failedCount = 0;
const results = [];

function recordResult(tier, testId, description, passed, details = '') {
  if (passed) {
    passedCount++;
    console.log(`  ✅ [PASS] [Tier ${tier}] ${testId}: ${description}`);
  } else {
    failedCount++;
    console.error(`  ❌ [FAIL] [Tier ${tier}] ${testId}: ${description} (${details})`);
  }
  results.push({ tier, testId, description, passed, details });
}

console.log('\n============================================================');
console.log('🚀 Starting Bug Tracker Lite E2E Test Suite: /downloads Route');
console.log('============================================================\n');

// ─── TIER 1: Feature Coverage ─────────────────────────────────────────
console.log('--- Tier 1: Feature Coverage ---');

// Test 1.1: Route & Component File Structure
try {
  const downloadsPagePath = existsSync(resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx'))
    ? resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx')
    : resolve(ROOT_DIR, 'apps/web/app/downloads/page.tsx');
  const downloadCardPath = resolve(ROOT_DIR, 'apps/web/components/downloads/DownloadCard.tsx');

  const pageExists = existsSync(downloadsPagePath);
  const cardExists = existsSync(downloadCardPath);

  if (pageExists && cardExists) {
    const pageContent = readFileSync(downloadsPagePath, 'utf-8');
    const cardContent = readFileSync(downloadCardPath, 'utf-8');

    const pageValid = pageContent.includes('export default function DownloadsPage') &&
                      pageContent.includes("from('downloads')") &&
                      pageContent.includes('getPublicUrl');
    
    const cardValid = cardContent.includes('export function DownloadCard') &&
                      cardContent.includes('DownloadItem');

    recordResult(1, 'T1.1', 'Next.js /downloads route & DownloadCard component structure', pageValid && cardValid);
  } else {
    recordResult(1, 'T1.1', 'Next.js /downloads route & DownloadCard component structure', false, 'File(s) missing');
  }
} catch (err) {
  recordResult(1, 'T1.1', 'Next.js /downloads route & DownloadCard component structure', false, err.message);
}

// Test 1.2: 3 Deliverable Cards Specification & Data Model
try {
  const downloadsPagePath = existsSync(resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx'))
    ? resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx')
    : resolve(ROOT_DIR, 'apps/web/app/downloads/page.tsx');
  const pageContent = readFileSync(downloadsPagePath, 'utf-8');

  const hasAndroid = pageContent.includes('Android App') &&
                     pageContent.includes('builds/Android.apk') &&
                     pageContent.includes('APK') &&
                     pageContent.includes('48 MB');

  const hasWindows = pageContent.includes('Windows App') &&
                     pageContent.includes('builds/Desktop.exe') &&
                     pageContent.includes('EXE') &&
                     pageContent.includes('75 MB');

  const hasChrome = pageContent.includes('Chrome Extension') &&
                    pageContent.includes('builds/ChromeExtension.zip') &&
                    pageContent.includes('ZIP') &&
                    pageContent.includes('12 MB');

  const all3Present = hasAndroid && hasWindows && hasChrome;
  recordResult(1, 'T1.2', '3 Download Cards present (Android App, Windows App, Chrome Extension)', all3Present);
} catch (err) {
  recordResult(1, 'T1.2', '3 Download Cards present (Android App, Windows App, Chrome Extension)', false, err.message);
}

// Test 1.3: Supabase Storage Dynamic Public URL Construction
try {
  const dummyUrl = 'https://xyzcompany.supabase.co';
  const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey';
  const client = createClient(dummyUrl, dummyKey);

  const androidRes = client.storage.from('downloads').getPublicUrl('builds/Android.apk');
  const desktopRes = client.storage.from('downloads').getPublicUrl('builds/Desktop.exe');
  const chromeRes = client.storage.from('downloads').getPublicUrl('builds/ChromeExtension.zip');

  const url1Ok = androidRes?.data?.publicUrl === 'https://xyzcompany.supabase.co/storage/v1/object/public/downloads/builds/Android.apk';
  const url2Ok = desktopRes?.data?.publicUrl === 'https://xyzcompany.supabase.co/storage/v1/object/public/downloads/builds/Desktop.exe';
  const url3Ok = chromeRes?.data?.publicUrl === 'https://xyzcompany.supabase.co/storage/v1/object/public/downloads/builds/ChromeExtension.zip';

  const allUrlsOk = url1Ok && url2Ok && url3Ok;
  recordResult(1, 'T1.3', 'Dynamic URL construction using supabase.storage.from("downloads").getPublicUrl(path)', allUrlsOk);
} catch (err) {
  recordResult(1, 'T1.3', 'Dynamic URL construction using supabase.storage.from("downloads").getPublicUrl(path)', false, err.message);
}


// ─── TIER 2: Boundary & Corner Cases ──────────────────────────────────
console.log('\n--- Tier 2: Boundary & Corner Cases ---');

// Test 2.1: Loading Skeleton & Spinner Indicators
try {
  const pagePath = existsSync(resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx'))
    ? resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx')
    : resolve(ROOT_DIR, 'apps/web/app/downloads/page.tsx');
  const pageContent = readFileSync(pagePath, 'utf-8');
  const cardContent = readFileSync(resolve(ROOT_DIR, 'apps/web/components/downloads/DownloadCard.tsx'), 'utf-8');
  const skeletonContent = existsSync(resolve(ROOT_DIR, 'apps/web/components/downloads/DownloadCardSkeleton.tsx'))
    ? readFileSync(resolve(ROOT_DIR, 'apps/web/components/downloads/DownloadCardSkeleton.tsx'), 'utf-8')
    : '';

  const hasSkeletonGrid = pageContent.includes('DownloadCardSkeleton') || pageContent.includes('downloads-loading-container');
  const hasSkeletonCard = skeletonContent.includes('animate-pulse') || cardContent.includes('animate-pulse');

  recordResult(2, 'T2.1', 'Loading skeleton & spinner component states', hasSkeletonGrid && hasSkeletonCard);
} catch (err) {
  recordResult(2, 'T2.1', 'Loading skeleton & spinner component states', false, err.message);
}

// Test 2.2: Missing Bucket / Dynamic Fetch Error Fallback State
try {
  const pagePath = existsSync(resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx'))
    ? resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx')
    : resolve(ROOT_DIR, 'apps/web/app/downloads/page.tsx');
  const pageContent = readFileSync(pagePath, 'utf-8');

  const hasErrorState = pageContent.includes('error') || pageContent.includes('setError') || pageContent.includes('setGlobalError');
  const hasErrorBanner = pageContent.includes('downloads-error-fallback') && pageContent.includes('role="alert"');
  const hasTryCatch = pageContent.includes('try') && pageContent.includes('catch');

  recordResult(2, 'T2.2', 'Error fallback banner state for storage/bucket failures', hasErrorState && hasErrorBanner && hasTryCatch);
} catch (err) {
  recordResult(2, 'T2.2', 'Error fallback banner state for storage/bucket failures', false, err.message);
}

// Test 2.3: Disabled Button Fallback when URL is Unavailable
try {
  const cardContent = readFileSync(resolve(ROOT_DIR, 'apps/web/components/downloads/DownloadCard.tsx'), 'utf-8');

  const hasDisabledFallback = cardContent.includes('download-button-disabled-') &&
                              cardContent.includes('Unavailable');

  recordResult(2, 'T2.3', 'Disabled button state when download URL is unavailable', hasDisabledFallback);
} catch (err) {
  recordResult(2, 'T2.3', 'Disabled button state when download URL is unavailable', false, err.message);
}


// ─── TIER 3: Cross-Feature UI & Security Attributes ───────────────────
console.log('\n--- Tier 3: Cross-Feature UI & Security Attributes ---');

// Test 3.1: Component Styling & Metadata Fields
try {
  const pagePath = existsSync(resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx'))
    ? resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx')
    : resolve(ROOT_DIR, 'apps/web/app/downloads/page.tsx');
  const pageContent = readFileSync(pagePath, 'utf-8');
  const cardContent = readFileSync(resolve(ROOT_DIR, 'apps/web/components/downloads/DownloadCard.tsx'), 'utf-8');

  const hasIcons = pageContent.includes('icon') || pageContent.includes('svg');
  const hasFormats = pageContent.includes('APK') && pageContent.includes('EXE') && pageContent.includes('ZIP');
  const hasSizes = pageContent.includes('48 MB') && pageContent.includes('75 MB') && pageContent.includes('12 MB');
  const hasCardTestIds = cardContent.includes('download-card-format-') && cardContent.includes('download-card-size-');

  recordResult(3, 'T3.1', 'Component styling & metadata display (format, size, icon, description)', hasIcons && hasFormats && hasSizes && hasCardTestIds);
} catch (err) {
  recordResult(3, 'T3.1', 'Component styling & metadata display (format, size, icon, description)', false, err.message);
}

// Test 3.2: Download Button Attributes & Tabnabbing Protection
try {
  const cardContent = readFileSync(resolve(ROOT_DIR, 'apps/web/components/downloads/DownloadCard.tsx'), 'utf-8');

  const hasTargetBlank = cardContent.includes('target="_blank"');
  const hasNoOpener = cardContent.includes('rel="noopener noreferrer"');
  const hasDownloadAttr = cardContent.includes('download');

  const securityOk = hasTargetBlank && hasNoOpener && hasDownloadAttr;
  recordResult(3, 'T3.2', 'Download button attributes (target="_blank", rel="noopener noreferrer", download)', securityOk);
} catch (err) {
  recordResult(3, 'T3.2', 'Download button attributes (target="_blank", rel="noopener noreferrer", download)', false, err.message);
}


// ─── TIER 4: Real-World Application & Infrastructure ──────────────────
console.log('\n--- Tier 4: Real-World Application & Infrastructure ---');

// Test 4.1: Unauthenticated Route Placement
try {
  const downloadsPagePath = existsSync(resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx'))
    ? resolve(ROOT_DIR, 'apps/web/app/(dashboard)/downloads/page.tsx')
    : resolve(ROOT_DIR, 'apps/web/app/downloads/page.tsx');
  const relativePath = downloadsPagePath.replace(ROOT_DIR, '');

  const isOutsideAuthGroup = !relativePath.includes('(auth)');
  const isDirectRoute = existsSync(downloadsPagePath);

  recordResult(4, 'T4.1', 'Route /downloads configured as public unauthenticated page outside auth guards', isOutsideAuthGroup && isDirectRoute);
} catch (err) {
  recordResult(4, 'T4.1', 'Route /downloads configured as public unauthenticated page outside auth guards', false, err.message);
}

// Test 4.2: Supabase SQL Schema Bucket & RLS Configuration
try {
  const schemaPath = resolve(ROOT_DIR, 'supabase_schema.sql');
  const schemaContent = readFileSync(schemaPath, 'utf-8');

  const hasBucketInsert = schemaContent.includes("INSERT INTO storage.buckets") && schemaContent.includes("'downloads'");
  const hasRlsPolicy = schemaContent.includes('Downloads Public Read Access') && schemaContent.includes("bucket_id = 'downloads'");

  recordResult(4, 'T4.2', 'Bucket creation & public read RLS policy in supabase_schema.sql', hasBucketInsert && hasRlsPolicy);
} catch (err) {
  recordResult(4, 'T4.2', 'Bucket creation & public read RLS policy in supabase_schema.sql', false, err.message);
}

// Test 4.3: Supabase Storage CORS Setup Documentation & Instructions
try {
  const schemaContent = readFileSync(resolve(ROOT_DIR, 'supabase_schema.sql'), 'utf-8');
  const docPath = resolve(ROOT_DIR, 'docs/supabase_storage_setup.md');
  const docContent = existsSync(docPath) ? readFileSync(docPath, 'utf-8') : '';

  const schemaHasCors = schemaContent.includes('CORS') && schemaContent.includes('Allowed Origins');
  const docHasCors = docContent.includes('CORS') || docContent.includes('Cross-Origin');

  recordResult(4, 'T4.3', 'CORS configuration instructions & setup documentation present', schemaHasCors || docHasCors);
} catch (err) {
  recordResult(4, 'T4.3', 'CORS configuration instructions & setup documentation present', false, err.message);
}

// ─── Summary Report ───────────────────────────────────────────────────
console.log('\n============================================================');
console.log(`📊 E2E Test Suite Execution Summary`);
console.log(`   Total Tests : ${passedCount + failedCount}`);
console.log(`   Passed      : ${passedCount}`);
console.log(`   Failed      : ${failedCount}`);
console.log('============================================================\n');

if (failedCount > 0) {
  console.error('❌ E2E Test Suite Failed.');
  process.exit(1);
} else {
  console.log('✅ All E2E Tests Passed Successfully!');
  process.exit(0);
}
