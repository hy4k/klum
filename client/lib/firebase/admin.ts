import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as adminSdk from 'firebase-admin';

// Initialize Firebase Admin
function initAdmin() {
  try {
    if (!getApps().length) {
      return initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
    }
    return getApps()[0];
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin');
  }
}

const app = initAdmin();
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);

// For compatibility with existing code
export const admin = adminSdk;
export const db = adminDb;
export const storage = adminStorage;
export const auth = adminAuth;

