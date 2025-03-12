import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as adminSdk from 'firebase-admin';

// Check if we're running in a server environment
const isServer = typeof window === 'undefined';
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Define auth interface with the methods we use
interface AuthInterface {
  verifyIdToken(token: string): Promise<DecodedIdToken>;
}

// Create more comprehensive mock implementations
const mockStorage = {
  bucket: (name?: string) => ({
    file: (path: string) => ({
      save: (data: any, options: any) => Promise.resolve(),
      makePublic: () => Promise.resolve(),
      getSignedUrl: () => Promise.resolve(['https://example.com/mock-url']),
      delete: () => Promise.resolve(),
    }),
    upload: () => Promise.resolve(),
    getFiles: () => Promise.resolve([]),
    name: 'mock-bucket',
  }),
};

// Mock DB implementation with more complete API
const mockDb = {
  collection: (collectionName: string) => ({
    doc: (docId: string) => ({
      get: () => Promise.resolve({ 
        exists: false, 
        data: () => ({}),
        id: 'mock-id',
        ref: {
          update: (data: any) => Promise.resolve(),
          set: (data: any) => Promise.resolve(),
          delete: () => Promise.resolve(),
        }
      }),
      update: (data: any) => Promise.resolve(),
      set: (data: any) => Promise.resolve(),
      delete: () => Promise.resolve(),
    }),
    where: () => ({
      where: () => ({
        limit: () => ({
          get: () => Promise.resolve({ 
            empty: true,
            docs: [],
            size: 0,
          }),
        }),
      }),
      orderBy: () => ({
        get: () => Promise.resolve({
          empty: true,
          docs: [],
          size: 0,
        }),
      }),
      limit: () => ({
        get: () => Promise.resolve({
          empty: true,
          docs: [],
          size: 0,
        }),
      }),
      get: () => Promise.resolve({
        empty: true,
        docs: [],
        size: 0,
      }),
    }),
    add: (data: any) => Promise.resolve({ id: 'mock-id' }),
    orderBy: () => ({
      get: () => Promise.resolve({
        empty: true,
        docs: [],
        size: 0,
      }),
    }),
  }),
  batch: () => ({
    set: () => ({}),
    update: () => ({}),
    delete: () => ({}),
    commit: () => Promise.resolve(),
  }),
};

// Mock auth implementation with proper types
const mockAuth: AuthInterface = {
  verifyIdToken: (token: string) => Promise.resolve({ 
    uid: 'mock-uid',
    email: 'mock@example.com',
    email_verified: true,
    name: 'Mock User',
    aud: 'mock-aud',
    auth_time: 0,
    exp: 0,
    firebase: { sign_in_provider: 'custom' },
    iat: 0,
    iss: 'https://securetoken.google.com/mock-project',
    sub: 'mock-uid'
  } as unknown as DecodedIdToken),
};

// Initialize Firebase Admin - handle build time and client-side more safely
function initAdmin() {
  // Skip initialization during build time or client-side rendering
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

// For compatibility with existing code - ensuring these are properly exported with mock implementations
export const admin = adminSdk;
export const db = app ? getFirestore(app) : mockDb;
export const storage = app ? getStorage(app) : mockStorage;
export const auth: AuthInterface = app ? (getAuth(app) as unknown as AuthInterface) : mockAuth;

// Also export the original objects for backwards compatibility
export const adminAuth = app ? getAuth(app) : mockAuth;
export const adminDb = app ? getFirestore(app) : mockDb;
export const adminStorage = app ? getStorage(app) : mockStorage;

