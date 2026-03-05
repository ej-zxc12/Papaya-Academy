import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  let serviceAccount: any = null;
  
  // Try to load from service-account-key.json file
  try {
    const serviceAccountPath = join(process.cwd(), 'service-account-key.json');
    console.log('[firebase-admin] Attempting to load from:', serviceAccountPath);
    const fileContent = readFileSync(serviceAccountPath, 'utf-8');
    serviceAccount = JSON.parse(fileContent);
    console.log('[firebase-admin] Loaded service account from file, project_id:', serviceAccount?.project_id);
  } catch (err: any) {
    console.error('[firebase-admin] Error loading service-account-key.json:', err?.message || err);
  }
  
  // If env vars are available, use them
  if (!serviceAccount && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID || 'papayaacademy-system',
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
    console.log('[firebase-admin] Using env var credentials');
  }
  
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.projectId || 'papayaacademy-system'
    });
    console.log('[firebase-admin] Initialized with service account');
  } else {
    // Fallback for development without service account key
    console.warn('[firebase-admin] No credentials found, using application default');
    admin.initializeApp({
      projectId: 'papayaacademy-system',
      credential: admin.credential.applicationDefault()
    });
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
