export class FirebaseAdminError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'FirebaseAdminError';
  }
}

export function handleFirebaseError(error: any): never {
  console.error('Firebase operation failed:', error);
  throw new FirebaseAdminError(
    error.message || 'Firebase operation failed',
    error.code
  );
} 
