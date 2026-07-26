/**
 * apps/extension/src/config.ts
 *
 * Firebase configuration for the Chrome Extension.
 * Reads environment variables injected at build time by esbuild (build.mjs).
 */

declare const process: {
  env: { [key: string]: string | undefined };
};

const getEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return (
      process.env[`NEXT_PUBLIC_${key}`] ||
      process.env[`EXPO_PUBLIC_${key}`] ||
      process.env[key] ||
      ''
    );
  }
  return '';
};

export const firebaseConfig = {
  apiKey:            getEnv('FIREBASE_API_KEY'),
  authDomain:        getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId:         getEnv('FIREBASE_PROJECT_ID'),
  storageBucket:     getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId:             getEnv('FIREBASE_APP_ID'),
};
