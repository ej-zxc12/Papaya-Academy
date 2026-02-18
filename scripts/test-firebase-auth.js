// Test Firebase Authentication
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtSindkymD94UsJdOr5F0SPyulRbvGA1I",
  authDomain: "papayaacademy-system.firebaseapp.com",
  projectId: "papayaacademy-system",
  storageBucket: "papayaacademy-system.firebasestorage.app",
  messagingSenderId: "1038999818594",
  appId: "1:1038999818594:web:2e8d114a1db0de43011c3b",
  measurementId: "G-KYY5KDBVNP"
};

async function testAuth() {
  try {
    console.log('🔧 Testing Firebase Authentication...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test sign in
    console.log('🔐 Attempting sign in with test credentials...');
    const userCredential = await signInWithEmailAndPassword(auth, 'test@papaya.edu', 'teacher123');
    
    console.log('✅ Sign in successful!');
    console.log('👤 User UID:', userCredential.user.uid);
    console.log('📧 Email:', userCredential.user.email);
    console.log('✅ Email verified:', userCredential.user.emailVerified);
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Solution: User not found. Make sure you created the user in Firebase Console.');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Solution: Wrong password. Check the password you set in Firebase Console.');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Solution: Invalid email format.');
    } else {
      console.log('💡 Check Firebase Console: https://console.firebase.google.com/project/papayaacademy-system/authentication/users');
    }
  }
}

testAuth();
