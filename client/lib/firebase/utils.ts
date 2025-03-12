import { auth, adminDb } from './admin';
import { FirebaseAdminError } from './error';

export async function verifyUser(token: string) {
  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    throw new FirebaseAdminError('Invalid user token');
  }
}

export async function getUserData(uid: string) {
  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    return userDoc.data();
  } catch (error) {
    throw new FirebaseAdminError('Failed to fetch user data');
  }
} 