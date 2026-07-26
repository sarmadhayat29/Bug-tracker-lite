/**
 * apps/web/lib/bugs.ts
 *
 * Web wrapper around @bug-tracker/shared Bug Firestore CRUD operations.
 */

import { db, storage } from './firebase';
import {
  Bug,
  ActivityLog,
  CreateBugPayload,
  UpdateBugStatusPayload,
  Platform,
  uploadScreenshot as sharedUploadScreenshot,
  deleteScreenshot as sharedDeleteScreenshot,
  createBug as sharedCreateBug,
  getBug as sharedGetBug,
  getBugs as sharedGetBugs,
  subscribeToBug as sharedSubscribeToBug,
  subscribeToBugs as sharedSubscribeToBugs,
  updateBugStatus as sharedUpdateBugStatus,
  deleteBug as sharedDeleteBug,
  getBugActivityLogs as sharedGetBugActivityLogs,
} from '@bug-tracker/shared';
import { Unsubscribe } from 'firebase/firestore';

export async function uploadScreenshot(
  uid: string,
  bugId: string,
  blob: Blob,
): Promise<string> {
  return sharedUploadScreenshot(storage, uid, bugId, blob);
}

export async function deleteScreenshot(uid: string, bugId: string): Promise<void> {
  return sharedDeleteScreenshot(storage, uid, bugId);
}

export async function createBug(
  payload: CreateBugPayload,
  screenshotBlob: Blob | null,
  platform: Platform = 'web',
): Promise<Bug> {
  return sharedCreateBug(db, storage, payload, screenshotBlob, platform);
}

export async function getBug(bugId: string): Promise<Bug | null> {
  return sharedGetBug(db, bugId);
}

export async function getBugs(uid: string): Promise<Bug[]> {
  return sharedGetBugs(db, uid);
}

export function subscribeToBug(
  bugId: string,
  onUpdate: (bug: Bug | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return sharedSubscribeToBug(db, bugId, onUpdate, onError);
}

export function subscribeToBugs(
  uid: string,
  onUpdate: (bugs: Bug[]) => void,
  statusFilter?: Bug['status'],
  onError?: (error: Error) => void,
): Unsubscribe {
  return sharedSubscribeToBugs(db, uid, onUpdate, statusFilter, onError);
}

export async function updateBugStatus(
  payload: UpdateBugStatusPayload,
  previousStatus: Bug['status'],
  uid: string,
  platform: Platform = 'web',
): Promise<void> {
  return sharedUpdateBugStatus(db, payload, previousStatus, uid, platform);
}

export async function deleteBug(
  bug: Bug,
  platform: Platform = 'web',
): Promise<void> {
  return sharedDeleteBug(db, storage, bug, platform);
}

export async function getBugActivityLogs(bugId: string): Promise<ActivityLog[]> {
  return sharedGetBugActivityLogs(db, bugId);
}
