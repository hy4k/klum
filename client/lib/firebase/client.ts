import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

// Check if we're in a browser/client environment
const isBrowser = typeof window !== 'undefined';
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
const hasFirebaseConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Initialize Firebase conditionally
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let database: Database | null = null;

// Only initialize Firebase if we're in a browser environment and not in build time
if (isBrowser && !isBuildTime && hasFirebaseConfig) {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize services
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    database = getDatabase(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

// Create mock implementations or export the real ones
export { 
  app,
  auth: auth as Auth,
  firestore: firestore as Firestore,
  storage: storage as FirebaseStorage,
  database: database as Database
};

export default app;

