import admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  // Initialize Firebase Admin with environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID || 'papayaacademy-system';
  
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use environment variables for service account
    const serviceAccount = {
      projectId,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId
    });
  } else {
    // Fallback for development without service account key
    console.warn('Firebase credentials not found in environment variables, using application default credentials');
    admin.initializeApp({
      projectId,
      credential: admin.credential.applicationDefault()
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
