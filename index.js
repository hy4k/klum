/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/**
 * Firebase Cloud Functions v2
 */

// v2 API ഇറക്കുമതി ചെയ്യുന്നു
const { onRequest } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const next = require('next');
const path = require('path');

// Firebase അഡ്മിൻ ഇനിഷ്യലൈസ് ചെയ്യുന്നു
try {
  // ഇതിനകം initialize ചെയ്തിട്ടുണ്ടെങ്കിൽ വീണ്ടും ചെയ്യരുത്
  if (!admin.apps.length) {
    admin.initializeApp();
  }
} catch (error) {
  console.error('Admin initialization error:', error);
}

// Express ആപ്പ് സൃഷ്ടിക്കുന്നു
const app = express();

// മിഡിൽവെയേഴ്സ്
app.use(cors({ origin: true }));
app.use(express.json());

// ടെസ്റ്റ് API എൻഡ്പോയിന്റ്
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello from Firebase!' });
});

// ഓതന്റിക്കേറ്റഡ് എൻഡ്പോയിന്റ്
app.get('/api/user-data', async (req, res) => {
  try {
    // റിക്വസ്റ്റിൽ നിന്ന് ഐഡി ടോക്കൺ വെരിഫൈ ചെയ്യുന്നു
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Firestore-ൽ നിന്ന് യൂസർ ഡാറ്റ ലഭ്യമാക്കുന്നു
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(userDoc.data());
  } catch (error) {
    logger.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Next.js app configuration
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({
  dev,
  conf: {
    distDir: '.next',
  },
  dir: path.resolve(__dirname, 'client'),
});
const handle = nextApp.getRequestHandler();

exports.nextServer = functions.https.onRequest(async (req, res) => {
  console.log('File: ' + req.originalUrl);
  await nextApp.prepare();
  return handle(req, res);
});

// Express ആപ്പിനെ Firebase ഫങ്ഷനായി എക്സ്പോർട്ട് ചെയ്യുന്നു
exports.api = onRequest({ cors: true }, app);
