import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Singleton FirebaseApp retrieval/initialization.
 * Pass a config on first call; subsequent calls return the existing app.
 */
export function getFirebaseApp(config?: FirebaseOptions): FirebaseApp {
  if (getApps().length > 0) return getApp();
  if (!config) throw new Error('[Bug Tracker] Firebase config must be provided on first initialization.');
  return initializeApp(config);
}

/**
 * Validates that required Firebase config parameters exist.
 */
export function assertFirebaseConfig(config: FirebaseOptions): void {
  const required: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter((k) => !config[k]);
  if (missing.length > 0) {
    throw new Error(`[Bug Tracker] Missing Firebase config keys: ${missing.join(', ')}. Check your .env file.`);
  }
}

export { getApp, getApps } from 'firebase/app';
