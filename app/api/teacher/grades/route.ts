import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import SF10Generator from '@/lib/sf10-generator';

function getTeacherSession(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      return sessionData.teacher?.id;
    } catch {
      return null;
    }
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const gradingPeriod = searchParams.get('gradingPeriod');
    const schoolYear = searchParams.get('schoolYear') || '2024-2025';

    if (!subjectId || !gradingPeriod) {
      return NextResponse.json(
        { message: 'subjectId and gradingPeriod are required' },
        { status: 400 }
      );
    }

    // Get all students for this teacher and subject
    const studentsCollection = collection(db, 'students');
    const studentsQuery = query(
      studentsCollection,
      where('teacherId', '==', teacherId),
      where('subjectId', '==', subjectId)
    );
    const studentsSnapshot = await getDocs(studentsQuery);

    const grades = [];

    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = studentDoc.data();
      const academicRecords = studentData.academicRecords || {};
      const yearRecord = academicRecords[schoolYear];

      if (yearRecord && yearRecord.grades) {
        const gradingPeriodKey = gradingPeriod.charAt(0).toUpperCase() + gradingPeriod.slice(1);
        const periodGrades = yearRecord.grades[gradingPeriodKey] || {};

        // Find the grade for this subject
        const subjectGrade = periodGrades[subjectId];
        if (subjectGrade) {
          grades.push({
            studentId: studentDoc.id,
            studentName: studentData.name,
            subjectId: subjectId,
            gradingPeriod: gradingPeriod,
            grade: subjectGrade.grade,
            remarks: subjectGrade.remarks || '',
            teacherId: subjectGrade.teacherId,
            teacherName: subjectGrade.teacherName || 'Teacher',
            dateInput: subjectGrade.dateInput
          });
        }
      }
    }

    return NextResponse.json(grades);

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { grades, schoolYear = '2024-2025' } = await request.json();

    if (!Array.isArray(grades)) {
      return NextResponse.json(
        { message: 'Grades must be an array' },
        { status: 400 }
      );
    }

    const results: {
      processed: number;
      saved: number;
      updated: number;
      errors: string[];
    } = {
      processed: 0,
      saved: 0,
      updated: 0,
      errors: []
    };

    for (const grade of grades) {
      try {
        results.processed++;
        
        // Get student document
        const studentRef = doc(db, 'students', grade.studentId);
        const studentSnap = await getDoc(studentRef);
        
        if (!studentSnap.exists()) {
          results.errors.push(`Student ${grade.studentId} not found`);
          continue;
        }

        const studentData = studentSnap.data();
        
        // Initialize academic records if needed
        const academicRecords = studentData.academicRecords || {};
        const yearRecord = academicRecords[schoolYear] || {
          gradeLevel: grade.gradeLevel || 'Grade 7',
          section: grade.section || 'Rose',
          adviser: grade.adviser || 'Juan Dela Cruz',
          schoolYear,
          grades: {},
          sf10: null,
          attendance: { daysPresent: 0, daysAbsent: 0, daysTardy: 0 },
          behavior: { conductRating: 'Good', teacherRemarks: '' },
          achievements: []
        };

        // Add grade to student document
        const gradingPeriod = grade.gradingPeriod.charAt(0).toUpperCase() + grade.gradingPeriod.slice(1);
        const subjectCode = grade.subjectId || grade.subjectName || 'UNKNOWN';
        
        if (!yearRecord.grades[gradingPeriod]) {
          yearRecord.grades[gradingPeriod] = {};
        }

        const existingGrade = yearRecord.grades[gradingPeriod][subjectCode];
        if (existingGrade) {
          results.updated++;
        } else {
          results.saved++;
        }

        yearRecord.grades[gradingPeriod][subjectCode] = {
          grade: grade.grade,
          teacherId: grade.teacherId || teacherId,
          teacherName: grade.teacherName || 'Teacher',
          dateInput: grade.dateInput || new Date().toISOString(),
          remarks: grade.remarks || ''
        };

        // Update student document
        await updateDoc(studentRef, {
          [`academicRecords.${schoolYear}`]: yearRecord,
          updatedAt: serverTimestamp()
        });

        // Generate SF10
        try {
          const sf10 = await SF10Generator.generateOrUpdateSF10(grade.studentId, schoolYear);
          
          if (sf10) {
            await updateDoc(studentRef, {
              [`academicRecords.${schoolYear}.sf10`]: sf10,
              updatedAt: serverTimestamp()
            });
            console.log(`✅ SF10 generated for student ${grade.studentId}`);
          }
        } catch (sf10Error) {
          console.error(`⚠️ SF10 generation failed for student ${grade.studentId}:`, sf10Error);
          // Don't fail the entire grade save if SF10 generation fails
          // Grades are still saved successfully
        }

      } catch (error) {
        results.errors.push(`Error processing student ${grade.studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: 'Grades processed successfully',
      results
    });

  } catch (error) {
    console.error('Grade processing error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
