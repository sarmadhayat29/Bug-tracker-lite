/**
 * apps/android/lib/bugs.ts
 *
 * Mobile wrapper around @bug-tracker/shared Bug Supabase CRUD operations.
 */

import { supabase } from './supabase';
import {
  Bug,
  CreateBugPayload,
  UpdateBugStatusPayload,
  Platform,
  createBug as sharedCreateBug,
  getBug as sharedGetBug,
  getBugs as sharedGetBugs,
  updateBugStatus as sharedUpdateBugStatus,
} from '@bug-tracker/shared';

export async function createBug(
  payload: CreateBugPayload,
  platform: Platform = 'android',
): Promise<Bug> {
  return sharedCreateBug(supabase, payload, null, platform);
}

export async function getBug(bugId: string): Promise<Bug | null> {
  return sharedGetBug(supabase, bugId);
}

export async function getBugs(uid: string): Promise<Bug[]> {
  return sharedGetBugs(supabase, uid);
}

export async function updateBugStatus(
  payload: UpdateBugStatusPayload,
  previousStatus: Bug['status'],
  uid: string,
  platform: Platform = 'android',
): Promise<void> {
  return sharedUpdateBugStatus(supabase, payload, previousStatus, uid, platform);
}
