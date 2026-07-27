/**
 * Shared TypeScript types for Bug Tracker Lite.
 * Used across all platforms: web, extension, android, desktop.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';
export type BugStatus   = 'open' | 'in_progress' | 'resolved';
export type LogAction   = 'bug_created' | 'status_changed' | 'screenshot_added' | 'bug_deleted';
export type Platform    = 'web' | 'extension' | 'android' | 'desktop';

// ─── Core Documents ───────────────────────────────────────────────────────────

/** User profile stored in Firestore `profiles/{uid}` */
export interface UserProfile {
  uid:          string;           // Supabase Auth UID (mirrors document ID)
  email:        string;           // User's email — immutable after creation
  displayName:  string | null;    // Optional display name
  avatarUrl:    string | null;    // Supabase Storage or external URL
  bugCount:     number;           // Cached count — incremented on bug create/delete
  createdAt:    number;           // Unix timestamp ms — set once at signup
  lastSeenAt:   number;           // Unix timestamp ms — updated on login
}

/** Bug report document stored in Firestore `bugs/{bugId}` */
export interface Bug {
  id:            string;          // Firestore auto-ID (copied into document)
  title:         string;          // Short summary shown in list view
  description:   string;          // Full bug details
  severity:      BugSeverity;     // low | medium | high | critical
  status:        BugStatus;       // open | in_progress | resolved
  screenshotUrl: string | null;   // Supabase Storage download URL for annotated PNG
  pageUrl:       string | null;   // Page URL captured by Chrome extension
  createdBy:     string;          // Supabase Auth UID — key for security rules
  createdAt:     number;          // Unix timestamp ms
  updatedAt:     number;          // Unix timestamp ms — updated on every write
}

/** Activity log entry stored in Firestore `activity_logs/{logId}` */
export interface ActivityLog {
  id:         string;             // Firestore auto-ID
  bugId:      string;             // References bugs/{bugId}
  userId:     string;             // Supabase Auth UID of the actor
  action:     LogAction;          // What happened
  fromStatus: BugStatus | null;   // Previous status (status_changed only)
  toStatus:   BugStatus | null;   // New status (status_changed only)
  platform:   Platform;           // Which client performed the action
  createdAt:  number;             // Unix timestamp ms — immutable
}

// ─── Payload Types ────────────────────────────────────────────────────────────

/** What the client sends when creating a new bug */
export type CreateBugPayload = Omit<Bug, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'screenshotUrl'> & {
  status?: BugStatus;
  screenshotUrl?: string | null;
};

/** What the client sends when updating status */
export type UpdateBugStatusPayload = Pick<Bug, 'id' | 'status'>;

/** What the client sends when creating a profile on signup */
export type CreateProfilePayload = Omit<UserProfile, 'bugCount' | 'lastSeenAt'>;

// ─── Constants ────────────────────────────────────────────────────────────────

/** Firestore collection names — single source of truth to avoid typos */
export const COLLECTIONS = {
  PROFILES:      'profiles',
  BUGS:          'bugs',
  ACTIVITY_LOGS: 'activity_logs',
} as const;

/** Supabase Storage path builder */
export const storagePath = {
  bugScreenshot: (uid: string, bugId: string) => `${uid}/${bugId}.png`,
} as const;

/** Severity display config — colour + label used by all UI platforms */
export const SEVERITY_CONFIG: Record<BugSeverity, { label: string; color: string }> = {
  low:      { label: 'Low',      color: '#3b82f6' },
  medium:   { label: 'Medium',   color: '#f59e0b' },
  high:     { label: 'High',     color: '#f97316' },
  critical: { label: 'Critical', color: '#ef4444' },
};

/** Status display config */
export const STATUS_CONFIG: Record<BugStatus, { label: string; color: string }> = {
  open:        { label: 'Open',        color: '#6366f1' },
  in_progress: { label: 'In Progress', color: '#f59e0b' },
  resolved:    { label: 'Resolved',    color: '#22c55e' },
};
