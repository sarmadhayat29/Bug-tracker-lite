import { SupabaseClient } from '@supabase/supabase-js';
import {
  Bug,
  ActivityLog,
  CreateBugPayload,
  UpdateBugStatusPayload,
  Platform,
  storagePath,
} from './types';

/**
 * Uploads an annotated screenshot blob to Supabase Storage.
 */
export async function uploadScreenshot(
  supabase: SupabaseClient,
  uid: string,
  bugId: string,
  blob: Blob,
): Promise<string> {
  const path = storagePath.bugScreenshot(uid, bugId);
  const { data, error } = await supabase.storage
    .from('bugs')
    .upload(path, blob, { contentType: blob.type || 'image/png', upsert: true });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('bugs')
    .getPublicUrl(path);

  return publicUrlData.publicUrl;
}

/**
 * Deletes a screenshot from Supabase Storage.
 */
export async function deleteScreenshot(
  supabase: SupabaseClient,
  uid: string,
  bugId: string,
): Promise<void> {
  const path = storagePath.bugScreenshot(uid, bugId);
  await supabase.storage.from('bugs').remove([path]);
}

/**
 * Creates a new bug document.
 */
export async function createBug(
  supabase: SupabaseClient,
  payload: CreateBugPayload,
  screenshotBlob?: Blob | null,
  platform: Platform = 'web',
): Promise<Bug> {
  const now = Date.now();
  
  // We will let Supabase generate the UUID, but since we need it for the screenshot, 
  // we first insert a partial bug, or we generate a UUID locally.
  // Generating a local UUID for standard postgres uuid_generate_v4() is best done via crypto.randomUUID()
  const bugId = crypto.randomUUID();

  let screenshotUrl: string | null = null;
  if (screenshotBlob) {
    screenshotUrl = await uploadScreenshot(supabase, payload.createdBy, bugId, screenshotBlob);
  }

  const bug = {
    ...payload,
    id: bugId,
    screenshotUrl: screenshotUrl ?? payload.screenshotUrl ?? null,
    status: 'open',
    reporter_id: payload.createdBy, // Mapping createdBy to reporter_id for the database
    created_at: now,
    updated_at: now,
  };

  // We map the JS properties to DB columns
  const dbBug = {
    id: bug.id,
    title: bug.title,
    description: bug.description,
    severity: bug.severity,
    status: bug.status,
    platform: platform,
    reporter_id: bug.reporter_id,
    image_urls: bug.screenshotUrl ? [bug.screenshotUrl] : [],
    created_at: bug.created_at,
    updated_at: bug.updated_at,
  };

  const { error } = await supabase.from('bugs').insert(dbBug);
  if (error) throw error;

  // We could also log the activity to an activity_logs table if we had one in Supabase.
  // For simplicity, we are just returning the constructed bug object.
  return {
    ...bug,
    createdAt: bug.created_at,
    updatedAt: bug.updated_at,
  } as unknown as Bug;
}

/**
 * Fetches a single bug by ID.
 */
export async function getBug(supabase: SupabaseClient, bugId: string): Promise<Bug | null> {
  const { data, error } = await supabase
    .from('bugs')
    .select('*')
    .eq('id', bugId)
    .single();

  if (error || !data) return null;
  
  return {
    ...data,
    createdBy: data.reporter_id,
    screenshotUrl: data.image_urls?.[0] || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as unknown as Bug;
}

/**
 * Fetches all bugs owned by the given user.
 */
export async function getBugs(
  supabase: SupabaseClient,
  uid: string,
  maxResults?: number,
): Promise<Bug[]> {
  let query = supabase
    .from('bugs')
    .select('*')
    .eq('reporter_id', uid)
    .order('created_at', { ascending: false });

  if (maxResults && maxResults > 0) {
    query = query.limit(maxResults);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((d: any) => ({
    ...d,
    createdBy: d.reporter_id,
    screenshotUrl: d.image_urls?.[0] || null,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  })) as Bug[];
}

/**
 * Updates a bug's status.
 */
export async function updateBugStatus(
  supabase: SupabaseClient,
  { id, status }: UpdateBugStatusPayload,
  previousStatus: Bug['status'],
  uid: string,
  platform: Platform = 'web',
): Promise<void> {
  const now = Date.now();
  
  const { error } = await supabase
    .from('bugs')
    .update({ status, updated_at: now })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Deletes a bug document and its screenshot from Storage.
 */
export async function deleteBug(
  supabase: SupabaseClient,
  bug: Bug,
  platform: Platform = 'web',
): Promise<void> {
  const { error } = await supabase.from('bugs').delete().eq('id', bug.id);
  if (error) throw error;

  if (bug.screenshotUrl) {
    await deleteScreenshot(supabase, bug.createdBy, bug.id);
  }
}
