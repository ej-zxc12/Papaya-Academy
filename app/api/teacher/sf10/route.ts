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
    const view = searchParams.get('view'); // 'cumulative' or 'single' (default)

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
      try {
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        if (!studentDoc.exists()) {
          return NextResponse.json(
            { message: 'Student not found' },
            { status: 404 }
          );
        }

        const student = studentDoc.data() as StudentDocument;
        
        // If byYear view requested, return data grouped by school year for two-column layout
        if (view === 'byYear') {
          try {
            const yearData = await SF10NormalizedGenerator.generateSF10ByYear(studentId);
            
            return NextResponse.json({
              student: {
                id: student.id || studentId,
                lrn: student.lrn || '',
                name: `${student.lastName || ''}, ${student.firstName || ''} ${student.middleName || ''}`.trim().replace(/\s+/g, ' ') ||
                      `Student ${studentId}`,
                gradeLevel: student.currentGradeLevel || 'Unknown',
                section: student.currentSection || 'Default'
              },
              yearData,
              view: 'byYear',
              schoolYears: yearData.map(y => y.schoolYear)
            });
          } catch (byYearError) {
            console.error('Error generating SF10 by year:', byYearError);
            // Fall back to single year view if byYear fails
          }
        }
        
        // If cumulative view requested, generate merged SF10 from all years
        if (view === 'cumulative') {
          try {
            const cumulativeSF10 = await SF10NormalizedGenerator.generateCumulativeSF10(studentId);
            
            return NextResponse.json({
              student: {
                id: student.id || studentId,
                lrn: student.lrn || '',
                name: `${student.lastName || ''}, ${student.firstName || ''} ${student.middleName || ''}`.trim().replace(/\s+/g, ' ') ||
                      `Student ${studentId}`,
                gradeLevel: student.currentGradeLevel || 'Unknown',
                section: student.currentSection || 'Default'
              },
              sf10: cumulativeSF10,
              view: 'cumulative',
              schoolYears: cumulativeSF10.schoolYears
            });
          } catch (cumulativeError) {
            console.error('Error generating cumulative SF10:', cumulativeError);
            // Fall back to single year view if cumulative fails
          }
        }
        
        // Safely access academic records for single year view
        const academicRecords = student.academicRecords || {};
        const yearRecord = academicRecords[schoolYear] || {};
        const sf10Record = yearRecord.sf10;

        if (!sf10Record) {
          return NextResponse.json(
            { message: 'SF10 record not found for this school year' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          student: {
            id: student.id || studentId,
            lrn: student.lrn || '',
            name: `${student.lastName || ''}, ${student.firstName || ''} ${student.middleName || ''}`.trim().replace(/\s+/g, ' ') ||
                  `Student ${studentId}`,
            firstName: student.firstName,
            lastName: student.lastName,
            middleName: student.middleName,
            gradeLevel: yearRecord.gradeLevel || student.currentGradeLevel || 'Unknown',
            section: yearRecord.section || student.currentSection || 'Default',
            sex: student.sex,
            birthdate: student.birthdate
          },
          sf10: sf10Record,
          view: 'single',
          completionStatus: {
            firstGrading: yearRecord.grades?.first ? true : false,
            secondGrading: yearRecord.grades?.second ? true : false,
            thirdGrading: yearRecord.grades?.third ? true : false,
            fourthGrading: yearRecord.grades?.fourth ? true : false,
            overall: yearRecord.grades?.first && 
                      yearRecord.grades?.second && 
                      yearRecord.grades?.third && 
                      yearRecord.grades?.fourth
          }
        });
      } catch (studentError) {
        console.error('Error fetching student SF10:', studentError);
        return NextResponse.json(
          { message: 'Error fetching student record', error: studentError instanceof Error ? studentError.message : String(studentError) },
          { status: 500 }
        );
      }
    }

    const debugLogs: string[] = [];

    // Query ALL students directly to count SF10 records for the school year
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    
    debugLogs.push(`Found ${studentsSnapshot.docs.length} total students`);

    const sf10Records: any[] = [];

    // Process each student to check for SF10 records in the specified school year
    for (const studentDoc of studentsSnapshot.docs) {
      const student = studentDoc.data() as StudentDocument;
      const studentId = studentDoc.id;
      
      const yearRecord = student.academicRecords?.[schoolYear];
      
      if (!yearRecord || !yearRecord.sf10) {
        continue; // Skip if no SF10 record for this school year
      }

      // Get student name in correct format: "LASTNAME, FIRSTNAME MIDDLENAME"
      const studentName = (student.lastName || student.firstName) 
        ? `${student.lastName || ''}, ${student.firstName || ''} ${student.middleName || ''}`.trim().replace(/\s+/g, ' ')
        : (student as any).name || `Student ${studentId}`;
      
      sf10Records.push({
        student: {
          id: studentId,
          lrn: student.lrn || '',
          name: studentName,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName,
          gradeLevel: yearRecord.gradeLevel || student.currentGradeLevel,
          section: yearRecord.section || student.currentSection,
          sex: student.sex,
          birthdate: student.birthdate
        },
        sf10: yearRecord.sf10,
        completionStatus: {
          firstGrading: !!yearRecord.grades?.first,
          secondGrading: !!yearRecord.grades?.second,
          thirdGrading: !!yearRecord.grades?.third,
          fourthGrading: !!yearRecord.grades?.fourth,
          overall: !!yearRecord.grades?.first && !!yearRecord.grades?.second && !!yearRecord.grades?.third && !!yearRecord.grades?.fourth
        },
        hasGrades: true
      });
      
      debugLogs.push(`Found SF10 for student: ${studentName}`);
    }
    
    // Apply filters
    let filteredRecords = sf10Records;
    if (gradeLevel) {
      filteredRecords = filteredRecords.filter(r => r.student.gradeLevel === gradeLevel);
    }
    if (section) {
      filteredRecords = filteredRecords.filter(r => r.student.section === section);
    }
    
    debugLogs.push(`Final: ${filteredRecords.length} SF10 records after filtering`);

    // Sort by student name
    filteredRecords.sort((a, b) => a.student.name.localeCompare(b.student.name));

    return NextResponse.json({
      sf10Records: filteredRecords,
      totalRecords: filteredRecords.length,
      schoolYear,
      filters: { gradeLevel, section },
      debug: {
        source: 'students',
        studentsChecked: studentsSnapshot.docs.length,
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
