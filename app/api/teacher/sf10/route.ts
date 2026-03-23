import { NextRequest, NextResponse } from 'next/server';
import { StudentDocument, SF10Record } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import SF10NormalizedGenerator from '@/lib/sf10-normalized-generator';

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

/**
 * NEW HYBRID SF10 API
 * Reads SF10 records from student documents
 */
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
    const studentId = searchParams.get('studentId');
    const schoolYear = searchParams.get('schoolYear') || '2024-2025';
    const gradeLevel = searchParams.get('gradeLevel');
    const section = searchParams.get('section');

    // Get teacher info to verify permissions
    const teacherDoc = await getDoc(doc(db, 'teachers', teacherId));
    if (!teacherDoc.exists()) {
      // For testing, allow any teacher if session is valid
      console.log(`⚠️ Teacher ${teacherId} not found in teachers collection, but session is valid`);
      // Continue without teacher verification for now
    }

    const teacherData = teacherDoc.exists() ? teacherDoc.data() : null;

    // If specific student requested
    if (studentId) {
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) {
        return NextResponse.json(
          { message: 'Student not found' },
          { status: 404 }
        );
      }

      const student = studentDoc.data() as StudentDocument;
      const sf10Record = student.academicRecords[schoolYear]?.sf10;

      if (!sf10Record) {
        return NextResponse.json(
          { message: 'SF10 record not found for this school year' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        student: {
          id: student.id,
          lrn: student.lrn,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                `Student ${student.id}`,
          gradeLevel: student.academicRecords[schoolYear]?.gradeLevel || student.currentGradeLevel,
          section: student.academicRecords[schoolYear]?.section || student.currentSection
        },
        sf10: sf10Record,
        completionStatus: {
          firstGrading: student.academicRecords[schoolYear]?.grades?.first ? true : false,
          secondGrading: student.academicRecords[schoolYear]?.grades?.second ? true : false,
          thirdGrading: student.academicRecords[schoolYear]?.grades?.third ? true : false,
          fourthGrading: student.academicRecords[schoolYear]?.grades?.fourth ? true : false,
          overall: student.academicRecords[schoolYear]?.grades?.first && 
                    student.academicRecords[schoolYear]?.grades?.second && 
                    student.academicRecords[schoolYear]?.grades?.third && 
                    student.academicRecords[schoolYear]?.grades?.fourth
        }
      });
    }

    // Get all students with SF10 records
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    const sf10Records: Array<{
      student: any;
      sf10: SF10Record;
      completionStatus: any;
    }> = [];

    for (const studentDoc of studentsSnapshot.docs) {
      const student = studentDoc.data() as StudentDocument;
      
      // Skip if no academic record for this school year
      if (!student.academicRecords[schoolYear]) {
        continue;
      }

      const yearRecord = student.academicRecords[schoolYear];
      const sf10Record = yearRecord.sf10;

      // Skip if no SF10 record
      if (!sf10Record) {
        continue;
      }

      // Apply filters
      if (gradeLevel && yearRecord.gradeLevel !== gradeLevel) {
        continue;
      }

      if (section && yearRecord.section !== section) {
        continue;
      }

      // Only include students this teacher has grades for
      // For testing, show all SF10 records regardless of teacher
      const hasTeacherGrades = true; // Show all for now
      
      if (!hasTeacherGrades) {
        continue;
      }

      sf10Records.push({
        student: {
          id: student.id,
          lrn: student.lrn,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
                `Student ${student.id}`,
          gradeLevel: yearRecord.gradeLevel || student.currentGradeLevel,
          section: yearRecord.section || student.currentSection
        },
        sf10: sf10Record,
        completionStatus: {
          firstGrading: yearRecord?.grades?.first ? true : false,
          secondGrading: yearRecord?.grades?.second ? true : false,
          thirdGrading: yearRecord?.grades?.third ? true : false,
          fourthGrading: yearRecord?.grades?.fourth ? true : false,
          overall: yearRecord?.grades?.first && 
                    yearRecord?.grades?.second && 
                    yearRecord?.grades?.third && 
                    yearRecord?.grades?.fourth
        }
      });
    }

    // Sort by student name
    sf10Records.sort((a, b) => a.student.name.localeCompare(b.student.name));

    return NextResponse.json({
      sf10Records,
      totalRecords: sf10Records.length,
      schoolYear,
      filters: { gradeLevel, section }
    });

  } catch (error) {
    console.error('Error fetching SF10 records:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate or regenerate SF10 for a student
 */
export async function POST(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { studentId, schoolYear = '2024-2025' } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Verify teacher has grades for this student
    const studentDoc = await getDoc(doc(db, 'students', studentId));
    if (!studentDoc.exists()) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    const student = studentDoc.data() as StudentDocument;
    const yearRecord = student.academicRecords[schoolYear];

    if (!yearRecord) {
      return NextResponse.json(
        { message: `No academic record for ${schoolYear}` },
        { status: 404 }
      );
    }

    // Check if teacher has grades for this student
    const hasTeacherGrades = Object.values(yearRecord.grades).some(periodGrades =>
      Object.values(periodGrades).some(grade => grade.teacherId === teacherId)
    );

    if (!hasTeacherGrades) {
      return NextResponse.json(
        { message: 'Unauthorized - You do not have grades for this student' },
        { status: 403 }
      );
    }

    // Generate SF10
    const sf10Record = await SF10NormalizedGenerator.generateSF10(studentId, schoolYear);

    return NextResponse.json({
      message: 'SF10 generated successfully',
      sf10: sf10Record,
      completionStatus: {
          firstGrading: yearRecord?.grades?.first ? true : false,
          secondGrading: yearRecord?.grades?.second ? true : false,
          thirdGrading: yearRecord?.grades?.third ? true : false,
          fourthGrading: yearRecord?.grades?.fourth ? true : false,
          overall: yearRecord?.grades?.first && 
                    yearRecord?.grades?.second && 
                    yearRecord?.grades?.third && 
                    yearRecord?.grades?.fourth
        }
    });

  } catch (error) {
    console.error('Error generating SF10:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get SF10 statistics and summary
 */
export async function PATCH(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const schoolYear = searchParams.get('schoolYear') || '2024-2025';

    const studentsSnapshot = await getDocs(collection(db, 'students'));
    
    let totalStudents = 0;
    let sf10Generated = 0;
    let firstGradingComplete = 0;
    let secondGradingComplete = 0;
    let thirdGradingComplete = 0;
    let fourthGradingComplete = 0;
    let overallComplete = 0;

    const gradeLevelStats: Record<string, any> = {};
    const sectionStats: Record<string, any> = {};

    for (const studentDoc of studentsSnapshot.docs) {
      const student = studentDoc.data() as StudentDocument;
      const yearRecord = student.academicRecords[schoolYear];

      if (!yearRecord) continue;

      // Only count students this teacher has grades for
      const hasTeacherGrades = Object.values(yearRecord.grades).some(periodGrades =>
        Object.values(periodGrades).some(grade => grade.teacherId === teacherId)
      );

      if (!hasTeacherGrades) continue;

      totalStudents++;

      const gradeLevel = yearRecord.gradeLevel;
      const section = yearRecord.section;

      // Initialize grade level stats
      if (!gradeLevelStats[gradeLevel]) {
        gradeLevelStats[gradeLevel] = { total: 0, sf10Generated: 0, complete: 0 };
      }

      // Initialize section stats
      if (!sectionStats[section]) {
        sectionStats[section] = { total: 0, sf10Generated: 0, complete: 0 };
      }

      gradeLevelStats[gradeLevel].total++;
      sectionStats[section].total++;

      // Check SF10 and completion status
      if (yearRecord.sf10) {
        sf10Generated++;
        gradeLevelStats[gradeLevel].sf10Generated++;
        sectionStats[section].sf10Generated++;
      }

      const completionStatus = {
          firstGrading: yearRecord?.grades?.first ? true : false,
          secondGrading: yearRecord?.grades?.second ? true : false,
          thirdGrading: yearRecord?.grades?.third ? true : false,
          fourthGrading: yearRecord?.grades?.fourth ? true : false,
          overall: yearRecord?.grades?.first && 
                    yearRecord?.grades?.second && 
                    yearRecord?.grades?.third && 
                    yearRecord?.grades?.fourth
        };

      if (completionStatus.firstGrading) firstGradingComplete++;
      if (completionStatus.secondGrading) secondGradingComplete++;
      if (completionStatus.thirdGrading) thirdGradingComplete++;
      if (completionStatus.fourthGrading) fourthGradingComplete++;
      if (completionStatus.overall) {
        overallComplete++;
        gradeLevelStats[gradeLevel].complete++;
        sectionStats[section].complete++;
      }
    }

    return NextResponse.json({
      summary: {
        totalStudents,
        sf10Generated,
        completionRates: {
          firstGrading: totalStudents > 0 ? (firstGradingComplete / totalStudents) * 100 : 0,
          secondGrading: totalStudents > 0 ? (secondGradingComplete / totalStudents) * 100 : 0,
          thirdGrading: totalStudents > 0 ? (thirdGradingComplete / totalStudents) * 100 : 0,
          fourthGrading: totalStudents > 0 ? (fourthGradingComplete / totalStudents) * 100 : 0,
          overall: totalStudents > 0 ? (overallComplete / totalStudents) * 100 : 0
        }
      },
      breakdown: {
        gradeLevels: gradeLevelStats,
        sections: sectionStats
      },
      schoolYear
    });

  } catch (error) {
    console.error('Error getting SF10 statistics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
