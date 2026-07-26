/**
 * apps/web/lib/firebase.ts
 *
 * Initialises and exports all Firebase service instances for the Next.js app.
 * Import from this file — never call initializeApp() directly in page components.
 *
 * Services exported:
 *   auth     → Firebase Authentication
 *   db       → Cloud Firestore
 *   storage  → Firebase Storage
 */

import { assertFirebaseConfig, getFirebaseApp } from '@bug-tracker/shared';
import { getAuth }      from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage }   from 'firebase/storage';

// Next.js only inlines process.env.NEXT_PUBLIC_* when the key is a
// static string literal — dynamic lookups always return undefined.
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

assertFirebaseConfig(firebaseConfig);

const app = getFirebaseApp(firebaseConfig);

export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);

