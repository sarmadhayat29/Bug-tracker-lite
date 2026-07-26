import { getFirebaseApp, assertFirebaseConfig } from '@bug-tracker/shared';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

let authInstance: Auth;
let dbInstance: Firestore;

try {
  // Try to assert config but don't crash if it fails during module load
  assertFirebaseConfig();
  const app = getFirebaseApp();

  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  dbInstance = getFirestore(app);
} catch (error) {
  console.error('Firebase Initialization Error:', error);
  // Fallback to empty/dummy objects or re-throw if critical
  // For the sake of not showing a white screen, we let the app load
}

export const auth = authInstance!;
export const db = dbInstance!;
