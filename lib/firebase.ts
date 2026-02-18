// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtSindkymD94UsJdOr5F0SPyulRbvGA1I",
  authDomain: "papayaacademy-system.firebaseapp.com",
  projectId: "papayaacademy-system",
  storageBucket: "papayaacademy-system.firebasestorage.app",
  messagingSenderId: "1038999818594",
  appId: "1:1038999818594:web:2e8d114a1db0de43011c3b",
  measurementId: "G-KYY5KDBVNP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Only initialize analytics on client side
let analytics = null;
if (typeof window !== 'undefined') {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  }).catch(console.error);
}

export { app, analytics, db, auth };
