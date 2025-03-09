import { adminAuth, adminDb } from './admin';

export async function verifyUser(token: string) {
  try {
    return await adminAuth.verifyIdToken(token);
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