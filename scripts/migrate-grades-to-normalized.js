/**
 * Migration Script: Move grades from student documents to normalized grades collection
 * 
 * This script safely migrates existing grade data from:
 * students/{id}/academicRecords/{schoolYear}/grades/{gradingPeriod}/{subjectCode}
 * 
 * To the new normalized structure:
 * grades/{gradeId}
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, writeBatch } = require('firebase/firestore');

// Firebase configuration - same as your main app
const firebaseConfig = {
  apiKey: "AIzaSyDtSindkymD94UsJdOr5F0SPyulRbvGA1I",
  authDomain: "papayaacademy-system.firebaseapp.com",
  projectId: "papayaacademy-system",
  storageBucket: "papayaacademy-system.firebasestorage.app",
  messagingSenderId: "1038999818594",
  appId: "1:1038999818594:web:2e8d114a1db0de43011c3b",
  measurementId: "G-KYY5KDBVNP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Migration function to move grades to normalized collection
 */
async function migrateGradesToNormalizedCollection() {
  console.log('🔄 Starting grade migration...');
  
  try {
    // Get all students
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    console.log(`📊 Found ${studentsSnapshot.size} students to process`);
    
    let totalGradesMigrated = 0;
    let totalStudentsProcessed = 0;
    let errors = [];
    
    // Process each student
    for (const studentDoc of studentsSnapshot.docs) {
      try {
        const studentId = studentDoc.id;
        const studentData = studentDoc.data();
        const academicRecords = studentData.academicRecords || {};
        
        console.log(`👤 Processing student: ${studentData.name || studentId}`);
        
        let studentGradesMigrated = 0;
        
        // Process each school year
        for (const [schoolYear, yearRecord] of Object.entries(academicRecords)) {
          if (!yearRecord || !yearRecord.grades) continue;
          
          const grades = yearRecord.grades;
          const gradeLevel = yearRecord.gradeLevel || studentData.gradeLevel;
          const section = yearRecord.section || 'Unassigned';
          
          // Process each grading period
          for (const [gradingPeriod, periodGrades] of Object.entries(grades)) {
            if (!periodGrades) continue;
            
            // Process each subject grade
            for (const [subjectCode, gradeEntry] of Object.entries(periodGrades)) {
              if (!gradeEntry || typeof gradeEntry.grade !== 'number') continue;
              
              // Create new grade document
              const newGrade = {
                studentId,
                teacherId: gradeEntry.teacherId || 'unknown',
                subjectId: subjectCode,
                gradeLevel,
                section,
                schoolYear,
                quarter: normalizeGradingPeriod(gradingPeriod),
                grade: gradeEntry.grade,
                remarks: gradeEntry.remarks || '',
                createdAt: new Date(gradeEntry.dateInput || Date.now()),
                updatedAt: new Date(),
                migratedFrom: `students/${studentId}/academicRecords/${schoolYear}/grades/${gradingPeriod}/${subjectCode}`
              };
              
              // Add to grades collection
              await addDoc(collection(db, 'grades'), newGrade);
              totalGradesMigrated++;
              studentGradesMigrated++;
              
              console.log(`  ✅ Migrated grade: ${subjectCode} - ${gradeEntry.grade} (${gradingPeriod})`);
            }
          }
        }
        
        totalStudentsProcessed++;
        console.log(`  ✅ Student ${studentData.name || studentId}: ${studentGradesMigrated} grades migrated`);
        
      } catch (studentError) {
        const errorMsg = `Error processing student ${studentDoc.id}: ${studentError.message}`;
        console.error(`  ❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }
    
    // Create teacher-subject assignments from existing data
    console.log('\n📚 Creating teacher-subject assignments...');
    await createTeacherSubjectAssignments();
    
    console.log('\n📊 Migration Summary:');
    console.log(`  - Total students processed: ${totalStudentsProcessed}`);
    console.log(`  - Total grades migrated: ${totalGradesMigrated}`);
    console.log(`  - Errors encountered: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    return {
      success: true,
      totalStudentsProcessed,
      totalGradesMigrated,
      errors
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Normalize grading period names
 */
function normalizeGradingPeriod(period) {
  const periodMap = {
    'First': 'Q1',
    'Second': 'Q2', 
    'Third': 'Q3',
    'Fourth': 'Q4',
    'first': 'Q1',
    'second': 'Q2',
    'third': 'Q3', 
    'fourth': 'Q4'
  };
  
  return periodMap[period] || period;
}

/**
 * Create teacher-subject assignments from existing data
 */
async function createTeacherSubjectAssignments() {
  try {
    // Get all grades to extract unique teacher-subject combinations
    const gradesSnapshot = await getDocs(collection(db, 'grades'));
    const teacherSubjectMap = new Map();
    
    gradesSnapshot.forEach(gradeDoc => {
      const grade = gradeDoc.data();
      const key = `${grade.teacherId}-${grade.subjectId}-${grade.gradeLevel}-${grade.section}-${grade.schoolYear}`;
      
      if (!teacherSubjectMap.has(key)) {
        teacherSubjectMap.set(key, {
          teacherId: grade.teacherId,
          subjectId: grade.subjectId,
          gradeLevel: grade.gradeLevel,
          section: grade.section,
          schoolYear: grade.schoolYear
        });
      }
    });
    
    console.log(`📚 Found ${teacherSubjectMap.size} unique teacher-subject assignments`);
    
    let assignmentsCreated = 0;
    
    for (const assignment of teacherSubjectMap.values()) {
      await addDoc(collection(db, 'teacherSubjects'), {
        ...assignment,
        createdAt: new Date()
      });
      assignmentsCreated++;
    }
    
    console.log(`✅ Created ${assignmentsCreated} teacher-subject assignments`);
    
  } catch (error) {
    console.error('❌ Error creating teacher-subject assignments:', error);
    throw error;
  }
}

/**
 * Verify migration by comparing data
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...');
  
  try {
    // Count original grades in student documents
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    let originalGradeCount = 0;
    
    studentsSnapshot.forEach(studentDoc => {
      const academicRecords = studentDoc.data().academicRecords || {};
      
      Object.values(academicRecords).forEach(yearRecord => {
        if (yearRecord.grades) {
          Object.values(yearRecord.grades).forEach(periodGrades => {
            if (periodGrades) {
              originalGradeCount += Object.keys(periodGrades).length;
            }
          });
        }
      });
    });
    
    // Count migrated grades
    const gradesSnapshot = await getDocs(collection(db, 'grades'));
    const migratedGradeCount = gradesSnapshot.size;
    
    console.log(`📊 Verification Results:`);
    console.log(`  - Original grades in student documents: ${originalGradeCount}`);
    console.log(`  - Migrated grades in grades collection: ${migratedGradeCount}`);
    console.log(`  - Match: ${originalGradeCount === migratedGradeCount ? '✅' : '❌'}`);
    
    return {
      originalGradeCount,
      migratedGradeCount,
      success: originalGradeCount === migratedGradeCount
    };
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateGradesToNormalizedCollection()
    .then(() => verifyMigration())
    .then(() => {
      console.log('\n🎉 Migration and verification completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  migrateGradesToNormalizedCollection,
  verifyMigration
};
