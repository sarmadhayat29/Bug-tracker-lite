// Public API of @bug-tracker/shared
// ─── Supabase ─────────────────────────────────────────────────────────────────
export {
  getSupabaseApp,
  assertSupabaseConfig,
} from './supabase/index';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────
export { parseAuthError, isValidEmail } from './auth';

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
