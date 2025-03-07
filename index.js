import * as functions from 'firebase-functions';
import next from 'next';
import admin from "firebase-admin";
import serviceAccount from "./service-account.json";

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, conf: { distDir: 'client/.next' } });
const handle = app.getRequestHandler();

exports.nextApp = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});

// Example Firebase Function API Endpoint
exports.getFirestoreData = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('SecretCodes').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});