const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create test teacher account using Admin SDK would be ideal, but for now we'll create the teacher profile
async function createTestTeacherProfile() {
  try {
    const teacherData = {
      name: 'Test Teacher',
      email: 'test@papaya.edu',
      employeeId: 'TEST001',
      department: 'Computer Science',
      subjects: ['Web Development', 'Database Management'],
      gradeLevel: 'Grade 10',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add teacher profile to Firestore
    const docRef = await addDoc(collection(db, 'teachers'), teacherData);
    
    console.log('✅ Test teacher profile created successfully!');
    console.log('📧 Email: test@papaya.edu');
    console.log('🔑 Password: You need to create this user in Firebase Console');
    console.log('📄 Teacher Profile ID:', docRef.id);
    console.log('\n📋 Next Steps:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/papayaacademy-system');
    console.log('2. Navigate to Authentication > Users');
    console.log('3. Click "Add user"');
    console.log('4. Email: test@papaya.edu');
    console.log('5. Password: teacher123 (or your preferred password)');
    console.log('6. Click "Add user"');
    
  } catch (error) {
    console.error('❌ Error creating teacher profile:', error);
  }
}

createTestTeacherProfile();
