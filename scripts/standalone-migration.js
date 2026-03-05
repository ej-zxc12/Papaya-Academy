// Standalone migration script for hybrid structure
// This script uses Firebase SDK directly without Next.js dependencies

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, query, where, getDoc, addDoc } = require('firebase/firestore');

// Firebase configuration - update with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyDtSindkymD94UsJdOr5F0SPyulRbvGA1I",
  authDomain: "papayaacademy-system.firebaseapp.com",
  projectId: "papayaacademy-system",
  storageBucket: "papayaacademy-system.firebasestorage.app",
  messagingSenderId: "1038999818594",
  appId: "1:1038999818594:web:2e8d114a1db0de43011c3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Migration Script: Convert from separate collections to hybrid student structure
 */
const CURRENT_SCHOOL_YEAR = '2024-2025';

async function migrateToHybridStructure() {
  console.log('🚀 Starting migration to hybrid student structure...');
  
  try {
    // Step 1: Get all existing grades
    console.log('📚 Reading existing grades...');
    const gradesSnapshot = await getDocs(collection(db, 'grades'));
    const allGrades = [];
    
    gradesSnapshot.forEach(doc => {
      allGrades.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${allGrades.length} grade records`);
    
    // Step 2: Get all existing SF10 records
    console.log('📄 Reading existing SF10 records...');
    const sf10Snapshot = await getDocs(collection(db, 'sf10'));
    const allSF10 = [];
    
    sf10Snapshot.forEach(doc => {
      allSF10.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Found ${allSF10.length} SF10 records`);
    
    // Step 3: Group grades by student
    const gradesByStudent = {};
    allGrades.forEach(grade => {
      const studentId = grade.studentId;
      if (!gradesByStudent[studentId]) {
        gradesByStudent[studentId] = [];
      }
      gradesByStudent[studentId].push(grade);
    });
    
    // Step 4: Group SF10 by student
    const sf10ByStudent = {};
    allSF10.forEach(sf10 => {
      const studentId = sf10.studentId;
      sf10ByStudent[studentId] = sf10;
    });
    
    // Step 5: Process each student
    const studentIds = new Set([
      ...Object.keys(gradesByStudent),
      ...Object.keys(sf10ByStudent)
    ]);
    
    console.log(`👤 Processing ${studentIds.size} students...`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const studentId of studentIds) {
      try {
        await migrateStudent(studentId, gradesByStudent[studentId] || [], sf10ByStudent[studentId]);
        migratedCount++;
        
        if (migratedCount % 10 === 0) {
          console.log(`📊 Progress: ${migratedCount}/${studentIds.size} students migrated`);
        }
      } catch (error) {
        console.error(`❌ Error migrating student ${studentId}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Migration Complete!`);
    console.log(`✅ Successfully migrated: ${migratedCount} students`);
    console.log(`❌ Errors: ${errorCount} students`);
    
    if (errorCount === 0) {
      console.log('\n🔥 All students migrated successfully!');
      console.log('💡 Next steps:');
      console.log('   1. Test the new APIs');
      console.log('   2. Verify data integrity');
      console.log('   3. Remove old collections (/grades, /sf10)');
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

async function migrateStudent(studentId, grades, sf10Record) {
  // Create base student document
  const studentDoc = {
    id: studentId,
    lrn: studentId, // Default to studentId, should be updated with real LRN
    firstName: 'Unknown',
    lastName: 'Student',
    currentGradeLevel: 'Grade 7', // Default
    currentSection: 'Rose', // Default
    schoolYear: CURRENT_SCHOOL_YEAR,
    status: 'enrolled',
    academicRecords: {
      [CURRENT_SCHOOL_YEAR]: {
        gradeLevel: 'Grade 7',
        section: 'Rose',
        adviser: 'Juan Dela Cruz',
        schoolYear: CURRENT_SCHOOL_YEAR,
        grades: {},
        sf10: null,
        attendance: {
          daysPresent: 0,
          daysAbsent: 0,
          daysTardy: 0
        },
        behavior: {
          conductRating: 'Good',
          teacherRemarks: ''
        },
        achievements: []
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Process grades
  const yearRecord = studentDoc.academicRecords[CURRENT_SCHOOL_YEAR];
  
  grades.forEach(grade => {
    // Skip grades with undefined values
    if (!grade || grade.grade === undefined || grade.grade === null) {
      console.warn(`⚠️ Skipping invalid grade for student ${studentId}`);
      return;
    }
    
    const gradingPeriod = mapGradingPeriod(grade.gradingPeriod);
    const subjectCode = grade.subjectId || grade.subjectName || 'UNKNOWN';
    
    if (!yearRecord.grades[gradingPeriod]) {
      yearRecord.grades[gradingPeriod] = {};
    }
    
    yearRecord.grades[gradingPeriod][subjectCode] = {
      grade: grade.grade,
      teacherId: grade.teacherId || 'unknown',
      teacherName: grade.teacherName || 'Unknown Teacher',
      dateInput: grade.dateInput || new Date().toISOString(),
      remarks: grade.remarks || ''
    };
  });
  
  // Process SF10 record
  if (sf10Record) {
    yearRecord.sf10 = {
      id: sf10Record.id,
      studentId: sf10Record.studentId,
      lrn: sf10Record.lrn || studentId,
      studentName: sf10Record.studentName || 'Unknown Student',
      gradeLevel: sf10Record.gradeLevel || 'Grade 7',
      section: sf10Record.section || 'Rose',
      schoolYear: sf10Record.schoolYear || CURRENT_SCHOOL_YEAR,
      semester: sf10Record.semester || 'First',
      subjects: sf10Record.subjects || [],
      generalAverage: sf10Record.generalAverage || 0,
      status: sf10Record.status || 'promoted',
      adviserName: sf10Record.adviserName || 'Juan Dela Cruz',
      dateCompleted: sf10Record.dateCompleted || new Date().toISOString()
    };
    
    // Update student basic info from SF10
    if (sf10Record.studentName) {
      const nameParts = sf10Record.studentName.split(' ');
      studentDoc.firstName = nameParts[0] || 'Unknown';
      studentDoc.lastName = nameParts[nameParts.length - 1] || 'Student';
      if (nameParts.length > 2) {
        studentDoc.middleName = nameParts.slice(1, -1).join(' ');
      }
    }
    
    if (sf10Record.lrn) {
      studentDoc.lrn = sf10Record.lrn;
    }
    
    if (sf10Record.gradeLevel) {
      studentDoc.currentGradeLevel = sf10Record.gradeLevel;
      yearRecord.gradeLevel = sf10Record.gradeLevel;
    }
    
    if (sf10Record.section) {
      studentDoc.currentSection = sf10Record.section;
      yearRecord.section = sf10Record.section;
    }
    
    if (sf10Record.adviserName) {
      yearRecord.adviser = sf10Record.adviserName;
    }
  }
  
  // Generate SF10 if not exists but we have grades
  if (!yearRecord.sf10 && Object.keys(yearRecord.grades).length > 0) {
    yearRecord.sf10 = generateSF10FromGrades(yearRecord.grades, studentDoc);
  }
  
  // Save to Firebase
  const studentRef = doc(db, 'students', studentId);
  await setDoc(studentRef, studentDoc, { merge: true });
}

function mapGradingPeriod(period) {
  const mapping = {
    'first': 'First',
    'second': 'Second', 
    'third': 'Third',
    'fourth': 'Fourth',
    'First': 'First',
    'Second': 'Second',
    'Third': 'Third',
    'Fourth': 'Fourth'
  };
  
  return mapping[period] || 'First';
}

function generateSF10FromGrades(grades, studentDoc) {
  const subjects = [];
  let totalGrades = 0;
  let gradeCount = 0;
  
  // Get all unique subjects
  const allSubjects = new Set();
  Object.values(grades).forEach(periodGrades => {
    Object.keys(periodGrades).forEach(subject => allSubjects.add(subject));
  });
  
  // Create SF10 subjects
  allSubjects.forEach(subjectCode => {
    const subject = {
      subjectCode,
      subjectName: subjectCode, // Should be mapped to real subject names
      firstGrading: grades.First?.[subjectCode]?.grade || 0,
      secondGrading: grades.Second?.[subjectCode]?.grade || 0,
      thirdGrading: grades.Third?.[subjectCode]?.grade || 0,
      fourthGrading: grades.Fourth?.[subjectCode]?.grade || 0,
      finalRating: 0,
      remarks: ''
    };
    
    // Calculate final rating (average of non-zero grades)
    const validGrades = [
      subject.firstGrading,
      subject.secondGrading,
      subject.thirdGrading,
      subject.fourthGrading
    ].filter(g => g > 0);
    
    if (validGrades.length > 0) {
      subject.finalRating = Math.round(validGrades.reduce((a, b) => a + b, 0) / validGrades.length);
      totalGrades += subject.finalRating;
      gradeCount++;
    }
    
    subjects.push(subject);
  });
  
  const generalAverage = gradeCount > 0 ? Math.round(totalGrades / gradeCount) : 0;
  
  return {
    id: `sf10-${Date.now()}`,
    studentId: studentDoc.id,
    lrn: studentDoc.lrn,
    studentName: `${studentDoc.firstName} ${studentDoc.middleName || ''} ${studentDoc.lastName}`.trim(),
    gradeLevel: studentDoc.currentGradeLevel,
    section: studentDoc.currentSection,
    schoolYear: studentDoc.schoolYear,
    semester: 'First',
    subjects,
    generalAverage,
    status: generalAverage >= 75 ? 'promoted' : 'retained',
    adviserName: studentDoc.academicRecords[studentDoc.schoolYear].adviser,
    dateCompleted: new Date().toISOString()
  };
}

// Run migration
if (require.main === module) {
  migrateToHybridStructure()
    .then(() => {
      console.log('✨ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToHybridStructure, migrateStudent, generateSF10FromGrades };
