/**
 * Script to update schoolYear in grades collection to match student's schoolYear
 * Run this script to fix grades that were saved with incorrect or missing schoolYear
 *
 * Usage: node scripts/fix-grades-schoolyear.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Your Firebase config - using the same config from your project
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixGradesSchoolYear() {
  console.log('🔧 Starting grades schoolYear fix...');
  
  try {
    // Fetch all grades
    const gradesCollection = collection(db, 'grades');
    const gradesSnapshot = await getDocs(gradesCollection);
    
    console.log(`📊 Found ${gradesSnapshot.docs.length} grade records`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const gradeDoc of gradesSnapshot.docs) {
      const gradeData = gradeDoc.data();
      const gradeId = gradeDoc.id;
      
      // Skip if schoolYear is already set and not the default '2024-2025'
      if (gradeData.schoolYear && gradeData.schoolYear !== '2024-2025') {
        console.log(`⏭️  Skipping grade ${gradeId} - already has schoolYear: ${gradeData.schoolYear}`);
        skippedCount++;
        continue;
      }
      
      // Get the student record
      const studentId = gradeData.studentId;
      if (!studentId) {
        console.log(`⚠️  Skipping grade ${gradeId} - no studentId`);
        skippedCount++;
        continue;
      }
      
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) {
        console.log(`⚠️  Skipping grade ${gradeId} - student ${studentId} not found`);
        skippedCount++;
        continue;
      }
      
      const studentData = studentDoc.data();
      const studentSchoolYear = studentData.schoolYear;
      
      if (!studentSchoolYear) {
        console.log(`⚠️  Skipping grade ${gradeId} - student ${studentId} has no schoolYear`);
        skippedCount++;
        continue;
      }
      
      // Update the grade with the student's schoolYear
      try {
        await updateDoc(doc(db, 'grades', gradeId), {
          schoolYear: studentSchoolYear
        });
        
        console.log(`✅ Updated grade ${gradeId}: ${gradeData.schoolYear || '(empty)'} → ${studentSchoolYear}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating grade ${gradeId}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📋 Summary:');
    console.log(`✅ Updated: ${updatedCount} grades`);
    console.log(`⏭️  Skipped: ${skippedCount} grades`);
    console.log(`❌ Errors: ${errorCount} grades`);
    console.log('\n✨ Fix complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the fix
fixGradesSchoolYear()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
