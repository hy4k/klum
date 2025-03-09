// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { FirebaseError } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyCFutMsbZrNABtZtcgkl1_zY9llalBvwbw",
    authDomain: "springgreen-weasel-192475.hostingersite.com",
    databaseURL: "https://springgreen-weasel-192475-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "klumsiland",
    storageBucket: "springgreen-weasel-192475.appspot.com",
    messagingSenderId: "381084089005",
    appId: "1:381084089005:web:ce09934ac3550f74e4e424"
};

let app;
let database;
let auth;
let analytics;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
    
    // Analytics only works in browser environment
    if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
} catch (error) {
    const firebaseError = error as FirebaseError;
    console.error('Error initializing Firebase:', {
        code: firebaseError.code,
        message: firebaseError.message
    });
    throw firebaseError;
}

export { app, database, auth, analytics };
