import path from 'path';
import fs from 'fs';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
export let firebaseConfig: any = {};

if (fs.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log("Firebase configuration loaded successfully.");
  } catch (err) {
    console.error("Error reading firebase-applet-config.json:", err);
  }
} else {
  console.warn("firebase-applet-config.json not found. API routes might fail.");
}

export const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || 'maurya.rahul6820@gmail.com';
export const PORT = 3000;
