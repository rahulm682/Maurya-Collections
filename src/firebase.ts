import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import config from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || config.apiKey,
  authDomain: `${(import.meta as any).env.VITE_FIREBASE_PROJECT_ID || config.projectId}.firebaseapp.com`,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || config.projectId,
  storageBucket: `${(import.meta as any).env.VITE_FIREBASE_PROJECT_ID || config.projectId}.appspot.com`,
  databaseId: (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || config.firestoreDatabaseId || '(default)'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
