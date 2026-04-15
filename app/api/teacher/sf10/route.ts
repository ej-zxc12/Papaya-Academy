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

    const debugLogs: string[] = [];
    
    // Get teacher's subjects first (like the grades/all API does)
    const subjectsQuery = query(
      collection(db, 'subjects'),
      where('teacherId', '==', teacherId),
      where('schoolYear', '==', schoolYear)
    );
    
    const teacherSubjectsQuery = query(
      collection(db, 'teacherSubjects'),
      where('teacherId', '==', teacherId),
      where('schoolYear', '==', schoolYear)
    );
    
    const [subjectsSnapshot, teacherSubjectsSnapshot] = await Promise.all([
      getDocs(subjectsQuery),
      getDocs(teacherSubjectsQuery)
    ]);
    
    const subjects = subjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      subjectId: doc.id,
      ...doc.data()
    }));
    
    const teacherSubjects = teacherSubjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Combine both collections and remove duplicates
    const allTeacherSubjects = [...subjects, ...teacherSubjects];
    const uniqueSubjects = Array.from(new Map(allTeacherSubjects.map(item => [
      (item as any).subjectId || (item as any).id, 
      item
    ])).values());
    
    debugLogs.push(`Found ${uniqueSubjects.length} subjects for teacher ${teacherId}`);
    
    if (uniqueSubjects.length === 0) {
      return NextResponse.json({
        sf10Records: [],
        totalRecords: 0,
        schoolYear,
        filters: { gradeLevel, section },
        debug: {
          source: 'grades',
          logs: debugLogs
        }
      });
    }

    // Get all grades for the teacher's assigned subjects
    const gradesPromises = uniqueSubjects.map(async (ts: any) => {
      const subjectId = ts.subjectId || ts.id;
      const gradesQuery = query(
        collection(db, 'grades'),
        where('teacherId', '==', teacherId),
        where('subjectId', '==', subjectId),
        where('schoolYear', '==', schoolYear)
      );
      
      const gradesSnapshot = await getDocs(gradesQuery);
      return gradesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          studentId: data.studentId,
          quarter: data.quarter,
          ...data
        };
      });
    });

    const gradesArrays = await Promise.all(gradesPromises);
    const allGrades: Array<{id: string; studentId: string; quarter: string; [key: string]: any}> = gradesArrays.flat();
    
    debugLogs.push(`Found ${allGrades.length} total grades`);
    
    // Create a map of students with grades
    const studentsWithGrades = new Map();
    
    for (const grade of allGrades) {
      const studentId = grade.studentId;
      if (!studentId) continue;
      
      if (!studentsWithGrades.has(studentId)) {
        // Get student details
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        if (!studentDoc.exists()) continue;
        
        const student = studentDoc.data() as StudentDocument;
        const yearRecord = student.academicRecords?.[schoolYear] || {};
        
        // Get all grades for this student to determine completion status
        const studentGrades = allGrades.filter(g => g.studentId === studentId);
        const quarters = studentGrades.map(g => g.quarter);
        
        // Get student name - prioritize firstName/lastName, fall back to name field, then studentId
        const studentName = (student.firstName || student.lastName) 
          ? `${student.firstName || ''} ${student.lastName || ''}`.trim()
          : (student as any).name || `Student ${studentId}`;
        
        studentsWithGrades.set(studentId, {
          student: {
            id: studentId,
            lrn: student.lrn || '',
            name: studentName,
            gradeLevel: yearRecord.gradeLevel || student.currentGradeLevel,
            section: yearRecord.section || student.currentSection
          },
          sf10: yearRecord.sf10 || null,
          completionStatus: {
            firstGrading: quarters.some((q: string) => q === 'Q1' || q === '1'),
            secondGrading: quarters.some((q: string) => q === 'Q2' || q === '2'),
            thirdGrading: quarters.some((q: string) => q === 'Q3' || q === '3'),
            fourthGrading: quarters.some((q: string) => q === 'Q4' || q === '4'),
            overall: quarters.includes('Q1') && quarters.includes('Q2') && quarters.includes('Q3') && quarters.includes('Q4')
          },
          hasGrades: true
        });
        debugLogs.push(`Added student: ${student.firstName} ${student.lastName}`);
      }
    }
    
    // Convert map to array and apply filters
    let sf10Records = Array.from(studentsWithGrades.values());
    
    // Apply filters
    if (gradeLevel) {
      sf10Records = sf10Records.filter(r => r.student.gradeLevel === gradeLevel);
    }
    if (section) {
      sf10Records = sf10Records.filter(r => r.student.section === section);
    }
    
    debugLogs.push(`Final: ${sf10Records.length} students after filtering`);

    // Sort by student name
    sf10Records.sort((a, b) => a.student.name.localeCompare(b.student.name));

    return NextResponse.json({
      sf10Records,
      totalRecords: sf10Records.length,
      schoolYear,
      filters: { gradeLevel, section },
      debug: {
        source: 'grades',
        gradesChecked: allGrades.length,
        logs: debugLogs
      }
    });

  } catch (error) {
    console.error('Error fetching SF10 records:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
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
    const hasTeacherGrades = yearRecord.grades && Object.values(yearRecord.grades).some(periodGrades =>
      periodGrades && Object.values(periodGrades).some(grade => grade.teacherId === teacherId)
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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
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
      const hasTeacherGrades = yearRecord.grades && Object.values(yearRecord.grades).some(periodGrades =>
        periodGrades && Object.values(periodGrades).some(grade => grade.teacherId === teacherId)
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
