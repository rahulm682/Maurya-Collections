import path from 'path';
import fs from 'fs';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
export let firebaseConfig: any = {};

if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log("Firebase configuration loaded successfully from config file.");
  } catch (err) {
    console.error("Error reading firebase-applet-config.json:", err);
  }
} else {
  console.log("firebase-applet-config.json not found. Falling back to environment variables.");
  firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || '(default)'
  };
}

export const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || 'maurya.rahul6820@gmail.com';
export const PORT = 3000;
