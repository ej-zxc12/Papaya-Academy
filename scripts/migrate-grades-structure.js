const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, query, where } = require('firebase/firestore');

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

async function migrateGrades() {
  try {
    console.log('Starting grade migration...');
    
    // Get all grades that might be missing subjectId or gradeLevel
    const gradesRef = collection(db, 'grades');
    const snapshot = await getDocs(gradesRef);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const gradeDoc of snapshot.docs) {
      const grade = gradeDoc.data();
      const updates = {};
      
      // Check if subjectId is missing or empty
      if (!grade.subjectId || grade.subjectId === '') {
        // Try to get subjectId from student data or set a default
        console.log(`Grade ${gradeDoc.id} missing subjectId`);
        // We'll need to look up the student's subject
      }
      
      // Check if gradeLevel is missing or "Unknown"
      if (!grade.gradeLevel || grade.gradeLevel === 'Unknown') {
        console.log(`Grade ${gradeDoc.id} missing gradeLevel`);
        updates.gradeLevel = 'Grade 6'; // Default, or look up from student
      }
      
      // Check if section is missing
      if (!grade.section) {
        updates.section = 'Default';
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        try {
          await updateDoc(doc(db, 'grades', gradeDoc.id), updates);
          console.log(`Updated grade ${gradeDoc.id}:`, updates);
          updatedCount++;
        } catch (error) {
          console.error(`Error updating grade ${gradeDoc.id}:`, error);
          errorCount++;
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`Updated: ${updatedCount} grades`);
    console.log(`Skipped: ${skippedCount} grades (already have all fields)`);
    console.log(`Errors: ${errorCount} grades`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

// Alternative: More intelligent migration that looks up student data
async function migrateGradesWithStudentLookup() {
  try {
    console.log('Starting intelligent grade migration with student lookup...');
    
    const gradesRef = collection(db, 'grades');
    const gradesSnapshot = await getDocs(gradesRef);
    
    // Get all students for lookup
    const studentsRef = collection(db, 'students');
    const studentsSnapshot = await getDocs(studentsRef);
    const studentsMap = new Map();
    
    studentsSnapshot.docs.forEach(doc => {
      studentsMap.set(doc.id, doc.data());
    });
    
    console.log(`Found ${studentsMap.size} students for reference`);
    console.log(`Found ${gradesSnapshot.size} grades to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const gradeDoc of gradesSnapshot.docs) {
      const grade = gradeDoc.data();
      const updates = {};
      
      // Look up student data
      const student = studentsMap.get(grade.studentId);
      
      if (student) {
        // Update gradeLevel from student if missing
        if (!grade.gradeLevel || grade.gradeLevel === 'Unknown') {
          if (student.gradeLevel) {
            updates.gradeLevel = student.gradeLevel;
          }
        }
        
        // Update section from student if missing
        if (!grade.section) {
          if (student.section) {
            updates.section = student.section;
          }
        }
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        try {
          await updateDoc(doc(db, 'grades', gradeDoc.id), updates);
          console.log(`✓ Updated grade ${gradeDoc.id}:`, updates);
          updatedCount++;
        } catch (error) {
          console.error(`✗ Error updating grade ${gradeDoc.id}:`, error);
          errorCount++;
        }
      } else {
        skippedCount++;
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`Updated: ${updatedCount} grades`);
    console.log(`Skipped: ${skippedCount} grades (already have all fields)`);
    console.log(`Errors: ${errorCount} grades`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

// Run the migration
migrateGradesWithStudentLookup();
