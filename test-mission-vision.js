// Test script to verify mission-vision Firebase connection
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, orderBy, limit } = require("firebase/firestore");

// Your Firebase configuration
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

async function testMissionVisionConnection() {
  try {
    console.log('🔍 Testing connection to missionVision collection...');
    
    const missionVisionRef = collection(db, 'missionVision');
    const q = query(missionVisionRef, orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No mission-vision data found in Firebase');
      console.log('💡 Make sure you have created data in the missionVision collection from your desktop');
      return;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    console.log('✅ Successfully connected to Firebase!');
    console.log('📄 Document ID:', doc.id);
    console.log('📊 Data structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check for expected fields
    const hasMission = data.mission && data.mission.title && data.mission.content;
    const hasVision = data.vision && data.vision.title && data.vision.content;
    const hasValues = data.values && Array.isArray(data.values);
    
    console.log('\n🎯 Data Validation:');
    console.log('Mission:', hasMission ? '✅' : '❌');
    console.log('Vision:', hasVision ? '✅' : '❌');
    console.log('Values:', hasValues ? '✅' : '❌');
    
    if (hasMission) {
      console.log('\n📝 Mission Title:', data.mission.title);
      console.log('📝 Mission Content:', data.mission.content.substring(0, 100) + '...');
    }
    
    if (hasVision) {
      console.log('\n👁️ Vision Title:', data.vision.title);
      console.log('👁️ Vision Content:', data.vision.content.substring(0, 100) + '...');
    }
    
    if (hasValues) {
      console.log('\n💎 Values Count:', data.values.length);
      data.values.forEach((value, index) => {
        console.log(`  ${index + 1}. ${value.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Firebase:', error);
    console.log('💡 Check your Firebase configuration and permissions');
  }
}

// Run the test
testMissionVisionConnection().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
