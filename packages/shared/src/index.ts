// Public API of @bug-tracker/shared
// ─── Firebase ─────────────────────────────────────────────────────────────────
export {
  firebaseConfig,
  getFirebaseApp,
  assertFirebaseConfig,
  app,
  auth,
  firestore,
  db,
} from './firebase/index';

// ─── Bug Firestore CRUD Operations ───────────────────────────────────────────
export * from './bugs';

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  Bug,
  UserProfile,
  ActivityLog,
  BugSeverity,
  BugStatus,
  LogAction,
  Platform,
  CreateBugPayload,
  UpdateBugStatusPayload,
  CreateProfilePayload,
} from './types';

// ─── Constants ────────────────────────────────────────────────────────────────
export {
  COLLECTIONS,
  storagePath,
  SEVERITY_CONFIG,
  STATUS_CONFIG,
} from './types';
