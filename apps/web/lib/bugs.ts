/**
 * apps/web/lib/bugs.ts
 *
 * Web wrapper around @bug-tracker/shared Bug Supabase CRUD operations.
 */

import { supabase } from './supabase';
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
  updateBugStatus as sharedUpdateBugStatus,
  deleteBug as sharedDeleteBug,
} from '@bug-tracker/shared';

// We do not export Unsubscribe from supabase anymore, Supabase returns a RealtimeChannel
import { RealtimeChannel } from '@supabase/supabase-js';

export async function uploadScreenshot(
  uid: string,
  bugId: string,
  blob: Blob,
): Promise<string> {
  return sharedUploadScreenshot(supabase, uid, bugId, blob);
}

export async function deleteScreenshot(uid: string, bugId: string): Promise<void> {
  return sharedDeleteScreenshot(supabase, uid, bugId);
}

export async function createBug(
  payload: CreateBugPayload,
  screenshotBlob: Blob | null,
  platform: Platform = 'web',
): Promise<Bug> {
  return sharedCreateBug(supabase, payload, screenshotBlob, platform);
}

export async function getBug(bugId: string): Promise<Bug | null> {
  return sharedGetBug(supabase, bugId);
}

export async function getBugs(uid: string): Promise<Bug[]> {
  return sharedGetBugs(supabase, uid);
}

export function subscribeToBug(
  bugId: string,
  onUpdate: (bug: Bug | null) => void,
  onError?: (error: Error) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`public:bugs:id=eq.${bugId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bugs', filter: `id=eq.${bugId}` },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          onUpdate(null);
        } else {
          const data = payload.new as any;
          onUpdate({
            ...data,
            createdBy: data.reporter_id,
            screenshotUrl: data.image_urls?.[0] || null,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          } as Bug);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        // Fetch initial state
        getBug(bugId).then(onUpdate).catch(e => onError?.(e));
      }
      if (err && onError) {
        onError(err);
      }
    });

  return channel;
}

export function subscribeToBugs(
  uid: string,
  onUpdate: (bugs: Bug[]) => void,
  statusFilter?: Bug['status'],
  onError?: (error: Error) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`public:bugs:reporter_id=eq.${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bugs', filter: `reporter_id=eq.${uid}` },
      () => {
        // For lists, it's often easier to just refetch the whole list rather than applying patch
        getBugs(uid).then((bugs) => {
          if (statusFilter) {
            onUpdate(bugs.filter(b => b.status === statusFilter));
          } else {
            onUpdate(bugs);
          }
        }).catch(e => onError?.(e));
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        // Fetch initial state
        getBugs(uid).then((bugs) => {
          if (statusFilter) {
            onUpdate(bugs.filter(b => b.status === statusFilter));
          } else {
            onUpdate(bugs);
          }
        }).catch(e => onError?.(e));
      }
      if (err && onError) {
        onError(err);
      }
    });

  return channel;
}

export async function updateBugStatus(
  payload: UpdateBugStatusPayload,
  previousStatus: Bug['status'],
  uid: string,
  platform: Platform = 'web',
): Promise<void> {
  return sharedUpdateBugStatus(supabase, payload, previousStatus, uid, platform);
}

export async function deleteBug(
  bug: Bug,
  platform: Platform = 'web',
): Promise<void> {
  return sharedDeleteBug(supabase, bug, platform);
}

// Activity logs were omitted for simplicity in the shared file, but we return an empty array if used
export async function getBugActivityLogs(bugId: string): Promise<ActivityLog[]> {
  return [];
}
