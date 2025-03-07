import admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.KLUMSILAND_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Log the service account to verify the environment variables
console.log("Service Account:", serviceAccount);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();
const storage = admin.storage();

export { admin, db, storage };

