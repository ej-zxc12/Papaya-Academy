import admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  // Initialize Firebase Admin with service account
  // For development, you might use a different approach
  try {
    // This will work if you have the service account key file
    const serviceAccount = require('../service-account-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'papayaacademy-system'
    });
  } catch (error) {
    // Fallback for development without service account key
    console.warn('Service account key not found, using application default credentials');
    admin.initializeApp({
      projectId: 'papayaacademy-system',
      credential: admin.credential.applicationDefault()
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
