const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "papayaacademy-system",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "YOUR_PRIVATE_KEY",
  "client_email": "firebase-adminsdk-xxxxx@papayaacademy-system.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

// Initialize admin with environment variables or service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'papayaacademy-system'
});

const auth = admin.auth();
const db = admin.firestore();

async function createTestTeacher() {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: 'test@papaya.edu',
      password: 'teacher123',
      displayName: 'Test Teacher',
      emailVerified: true
    });

    console.log('✅ Firebase Auth user created successfully!');
    console.log('📧 Email:', userRecord.email);
    console.log('🆔 UID:', userRecord.uid);

    // Create teacher profile in Firestore
    const teacherData = {
      uid: userRecord.uid,
      name: 'Test Teacher',
      email: 'test@papaya.edu',
      employeeId: 'TEST001',
      department: 'Computer Science',
      subjects: ['Web Development', 'Database Management'],
      gradeLevel: 'Grade 10',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('teachers').doc(userRecord.uid).set(teacherData);
    
    console.log('✅ Teacher profile created in Firestore!');
    console.log('📄 Document ID:', userRecord.uid);
    console.log('\n🔐 Login Credentials:');
    console.log('Email: test@papaya.edu');
    console.log('Password: teacher123');
    
  } catch (error) {
    console.error('❌ Error creating test teacher:', error);
  }
}

// Note: This requires Firebase Admin SDK setup with service account
// For now, let's create a simpler version that just shows the credentials
console.log('📋 Test Teacher Account Credentials:');
console.log('Email: test@papaya.edu');
console.log('Password: teacher123');
console.log('\n⚠️  Manual Setup Required:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/papayaacademy-system');
console.log('2. Navigate to Authentication > Users');
console.log('3. Click "Add user"');
console.log('4. Email: test@papaya.edu');
console.log('5. Password: teacher123');
console.log('6. Click "Add user"');
