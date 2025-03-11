const express = require('express');
const next = require('next');
const admin = require('firebase-admin');
const path = require('path');
const cors = require('cors');
const functions = require('firebase-functions');

// സെർവർ സ്റ്റാർട്ട് ചെയ്യുന്നതിനുള്ള സെറ്റിംഗ്സ്
const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;

// Firebase അഡ്മിൻ ഇനിഷ്യലൈസ് ചെയ്യുന്നു
try {
  if (!admin.apps.length) {
    const serviceAccount = require('./service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// Next.js ആപ്ലിക്കേഷൻ സെറ്റപ്പ് ചെയ്യുന്നു
const app = next({ dev, dir: './client' });
const handle = app.getRequestHandler();

const db = admin.firestore();
const auth = admin.auth();

// Firebase Function export for Cloud Functions deployment
exports.nextServer = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});

// Only run the server if file is executed directly (not imported)
if (require.main === module) {
  app.prepare().then(() => {
    const server = express();
    
    // ആവശ്യമായ മിഡിൽവെയറുകൾ
    server.use(cors());
    server.use(express.json());
    
    // API റൂട്ടുകൾ
    server.post('/api/auth/validate-token', async (req, res) => {
      try {
        const { token } = req.body;
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }
        
        const decodedToken = await auth.verifyIdToken(token);
        res.status(200).json({ 
          uid: decodedToken.uid, 
          email: decodedToken.email 
        });
      } catch (error) {
        console.error('Token validation error:', error);
        res.status(401).json({ error: 'Invalid token' });
      }
    });
    
    // ബാക്കി എല്ലാ റിക്വസ്റ്റുകളും Next.js ഹാൻഡിൽ ചെയ്യുന്നു
    server.all('*', (req, res) => {
      return handle(req, res);
    });
    
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  }).catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
}