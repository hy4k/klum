import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as adminSdk from 'firebase-admin';

// Check if we're running in a server environment
const isServer = typeof window === 'undefined';
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Mock implementations for build time
const mockDb = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      update: () => Promise.resolve(),
    }),
    where: () => ({
      where: () => ({
        limit: () => ({
          get: () => Promise.resolve({ empty: true }),
        }),
      }),
    }),
  }),
};

// Initialize Firebase Admin
function initAdmin() {
  // Skip initialization during build time or if not on server
  if (isBuildTime || !isServer) {
    console.log('Skipping Firebase Admin initialization (build time or client side)');
    return null;
  }

  try {
    // Check if all required environment variables are present
    const hasCredentials = 
      process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasCredentials) {
      console.warn('Firebase credentials not found in environment. Using mock implementation.');
      return null;
    }

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
    console.warn('Using mock implementation due to initialization failure');
    return null;
  }
}

const app = initAdmin();

// Provide real or mock implementations based on initialization success
export const adminAuth = app ? getAuth(app) : { /* mock auth implementation */ };
export const adminDb = app ? getFirestore(app) : mockDb;
export const adminStorage = app ? getStorage(app) : { /* mock storage implementation */ };

// For compatibility with existing code
export const admin = adminSdk;
export const db = app ? adminDb : mockDb;
export const storage = app ? adminStorage : { bucket: () => ({ file: () => ({}) }) };
export const auth = app ? adminAuth : { 
  verifyIdToken: () => Promise.resolve({ uid: 'mock-uid' }),
  /* other mock auth methods as needed */
};

