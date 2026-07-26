import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  writeBatch,
  Unsubscribe,
  DocumentData,
  Firestore,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage';
import {
  Bug,
  ActivityLog,
  CreateBugPayload,
  UpdateBugStatusPayload,
  COLLECTIONS,
  storagePath,
  Platform,
} from './types';

/** Converts a Firestore document snapshot to a typed Bug */
export function docToBug(snap: DocumentData): Bug {
  return snap.data() as Bug;
}

/** Builds an ActivityLog payload (without id — Firestore assigns it) */
export function buildLog(
  partial: Omit<ActivityLog, 'id' | 'createdAt'>,
): Omit<ActivityLog, 'id'> {
  return { ...partial, createdAt: Date.now() };
}

/**
 * Uploads an annotated screenshot blob to Firebase Storage.
 */
export async function uploadScreenshot(
  storage: FirebaseStorage,
  uid: string,
  bugId: string,
  blob: Blob,
): Promise<string> {
  const path = storagePath.bugScreenshot(uid, bugId);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: 'image/png' });
  return getDownloadURL(storageRef);
}

/**
 * Deletes a screenshot from Firebase Storage.
 */
export async function deleteScreenshot(
  storage: FirebaseStorage,
  uid: string,
  bugId: string,
): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath.bugScreenshot(uid, bugId)));
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code !== 'storage/object-not-found'
    ) {
      console.warn('Screenshot deletion failed:', err);
    }
  }
}

/**
 * Creates a new bug document and its corresponding activity_log entry atomically.
 */
export async function createBug(
  db: Firestore,
  storage: FirebaseStorage | null,
  payload: CreateBugPayload,
  screenshotBlob?: Blob | null,
  platform: Platform = 'web',
): Promise<Bug> {
  const now = Date.now();
  const bugId = doc(collection(db, COLLECTIONS.BUGS)).id;

  let screenshotUrl: string | null = null;
  if (screenshotBlob && storage) {
    screenshotUrl = await uploadScreenshot(storage, payload.createdBy, bugId, screenshotBlob);
  }

  const bug: Bug = {
    ...payload,
    id: bugId,
    screenshotUrl: screenshotUrl ?? payload.screenshotUrl ?? null,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };

  const logPayload = buildLog({
    bugId,
    userId: payload.createdBy,
    action: 'bug_created',
    fromStatus: null,
    toStatus: null,
    platform,
  });

  const batch = writeBatch(db);
  batch.set(doc(db, COLLECTIONS.BUGS, bugId), bug);
  batch.set(doc(collection(db, COLLECTIONS.ACTIVITY_LOGS)), logPayload);
  await batch.commit();

  return bug;
}

/**
 * Fetches a single bug by ID.
 */
export async function getBug(db: Firestore, bugId: string): Promise<Bug | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.BUGS, bugId));
  if (!snap.exists()) return null;
  return snap.data() as Bug;
}

/**
 * Fetches all bugs owned by the given user.
 */
export async function getBugs(
  db: Firestore,
  uid: string,
  maxResults?: number,
): Promise<Bug[]> {
  const constraints: any[] = [
    where('createdBy', '==', uid),
    orderBy('createdAt', 'desc'),
  ];
  if (maxResults && maxResults > 0) {
    constraints.push(firestoreLimit(maxResults));
  }
  const q = query(collection(db, COLLECTIONS.BUGS), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Bug);
}

/**
 * Subscribes to real-time updates for a single bug document.
 */
export function subscribeToBug(
  db: Firestore,
  bugId: string,
  onUpdate: (bug: Bug | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, COLLECTIONS.BUGS, bugId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
      } else {
        onUpdate(snapshot.data() as Bug);
      }
    },
    (error) => {
      console.error('subscribeToBug error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribes to real-time updates on the user's bug list.
 */
export function subscribeToBugs(
  db: Firestore,
  uid: string,
  onUpdate: (bugs: Bug[]) => void,
  statusFilter?: Bug['status'],
  onError?: (error: Error) => void,
): Unsubscribe {
  const constraints: any[] = [
    where('createdBy', '==', uid),
    orderBy('createdAt', 'desc'),
  ];

  if (statusFilter) {
    constraints.push(where('status', '==', statusFilter));
  }

  const q = query(collection(db, COLLECTIONS.BUGS), ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const bugs = snapshot.docs.map((d) => d.data() as Bug);
      onUpdate(bugs);
    },
    (error) => {
      console.error('subscribeToBugs error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Updates a bug's status and writes an activity_log entry atomically.
 */
export async function updateBugStatus(
  db: Firestore,
  { id, status }: UpdateBugStatusPayload,
  previousStatus: Bug['status'],
  uid: string,
  platform: Platform = 'web',
): Promise<void> {
  const now = Date.now();

  const logPayload = buildLog({
    bugId: id,
    userId: uid,
    action: 'status_changed',
    fromStatus: previousStatus,
    toStatus: status,
    platform,
  });

  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTIONS.BUGS, id), {
    status,
    updatedAt: now,
  });
  batch.set(doc(collection(db, COLLECTIONS.ACTIVITY_LOGS)), logPayload);
  await batch.commit();
}

/**
 * Deletes a bug document, its screenshot from Storage, and writes a deletion log.
 */
export async function deleteBug(
  db: Firestore,
  storage: FirebaseStorage | null,
  bug: Bug,
  platform: Platform = 'web',
): Promise<void> {
  const logPayload = buildLog({
    bugId: bug.id,
    userId: bug.createdBy,
    action: 'bug_deleted',
    fromStatus: bug.status,
    toStatus: null,
    platform,
  });

  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.BUGS, bug.id));
  batch.set(doc(collection(db, COLLECTIONS.ACTIVITY_LOGS)), logPayload);
  await batch.commit();

  if (bug.screenshotUrl && storage) {
    await deleteScreenshot(storage, bug.createdBy, bug.id);
  }
}

/**
 * Fetches all activity log entries for a specific bug, ordered chronologically.
 */
export async function getBugActivityLogs(
  db: Firestore,
  bugId: string,
): Promise<ActivityLog[]> {
  const q = query(
    collection(db, COLLECTIONS.ACTIVITY_LOGS),
    where('bugId', '==', bugId),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ActivityLog);
}
