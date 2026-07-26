/**
 * apps/android/lib/bugs.ts
 *
 * Mobile wrapper around @bug-tracker/shared Bug Firestore CRUD operations.
 */

import { db } from './firebase';
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
  return sharedCreateBug(db, null, payload, null, platform);
}

export async function getBug(bugId: string): Promise<Bug | null> {
  return sharedGetBug(db, bugId);
}

export async function getBugs(uid: string): Promise<Bug[]> {
  return sharedGetBugs(db, uid);
}

export async function updateBugStatus(
  payload: UpdateBugStatusPayload,
  previousStatus: Bug['status'],
  uid: string,
  platform: Platform = 'android',
): Promise<void> {
  return sharedUpdateBugStatus(db, payload, previousStatus, uid, platform);
}
