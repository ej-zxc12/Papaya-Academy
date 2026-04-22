import { NextRequest, NextResponse } from 'next/server';
import { StudentDocument, SF10Record, SF10Subject } from '@/types';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

export interface CumulativeSF10Record {
  student: {
    id: string;
    lrn: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    nameExtn?: string;
    birthdate: string;
    sex: 'M' | 'F';
  };
  cumulativeRecord: {
    schoolYears: Array<{
      schoolYear: string;
      gradeLevel: string;
      section: string;
      adviser: string;
      subjects: SF10Subject[];
      generalAverage: number;
      status: 'promoted' | 'retained' | 'dropped';
      dateCompleted: string;
      attendance?: {
        daysPresent: number;
        daysAbsent: number;
        daysTardy: number;
      };
    }>;
    totalYearsCompleted: number;
    currentGradeLevel: string;
    overallStatus: string;
  };
  generatedAt: string;
}

/**
 * GET Cumulative SF10 (Form 137)
 * Returns the complete academic record from Grade 1 to current grade
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { studentId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json or printable

    if (!studentId) {
      return NextResponse.json(
        { message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Fetch student document
    const studentDoc = await getDoc(doc(db, 'students', studentId));
    if (!studentDoc.exists()) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    const student = studentDoc.data() as StudentDocument;

    // Check if student has any academic records
    if (!student.academicRecords || Object.keys(student.academicRecords).length === 0) {
      return NextResponse.json(
        { message: 'No academic records found for this student' },
        { status: 404 }
      );
    }

    // Extract and sort academic records by school year
    const schoolYears = Object.entries(student.academicRecords)
      .map(([schoolYear, record]) => ({
        schoolYear,
        gradeLevel: record.gradeLevel,
        section: record.section,
        adviser: record.adviser,
        subjects: record.sf10?.subjects || [],
        generalAverage: record.sf10?.generalAverage || 0,
        status: record.sf10?.status || 'promoted',
        dateCompleted: record.sf10?.dateCompleted || '',
        attendance: record.attendance
      }))
      .sort((a, b) => {
        // Sort by grade level (Grade 1 -> Grade 2 -> Grade 3, etc.)
        const gradeOrder = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
        const gradeA = gradeOrder.indexOf(a.gradeLevel);
        const gradeB = gradeOrder.indexOf(b.gradeLevel);
        return gradeA - gradeB;
      });

    // Build cumulative record
    const cumulativeRecord: CumulativeSF10Record = {
      student: {
        id: student.id,
        lrn: student.lrn,
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName,
        nameExtn: student.nameExtn,
        birthdate: student.birthdate,
        sex: student.sex
      },
      cumulativeRecord: {
        schoolYears,
        totalYearsCompleted: schoolYears.length,
        currentGradeLevel: student.currentGradeLevel,
        overallStatus: determineOverallStatus(schoolYears)
      },
      generatedAt: new Date().toISOString()
    };

    // If printable format requested, return additional metadata
    if (format === 'printable') {
      return NextResponse.json({
        ...cumulativeRecord,
        printableVersion: generatePrintableData(cumulativeRecord)
      });
    }

    return NextResponse.json(cumulativeRecord);

  } catch (error) {
    console.error('Error fetching cumulative SF10:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Determine overall status based on all school years
 */
function determineOverallStatus(schoolYears: Array<{ status: string }>): string {
  const hasRetained = schoolYears.some(year => year.status === 'retained');
  const hasDropped = schoolYears.some(year => year.status === 'dropped');
  
  if (hasDropped) return 'incomplete';
  if (hasRetained) return 'ongoing';
  return 'progressing_normally';
}

/**
 * Generate printable version data
 */
function generatePrintableData(cumulativeRecord: CumulativeSF10Record) {
  const { student, cumulativeRecord: record } = cumulativeRecord;
  
  return {
    title: `School Permanent Record (Form 137) - ${student.lrn}`,
    studentName: `${student.lastName}, ${student.firstName} ${student.middleName || ''}`.trim(),
    lrn: student.lrn,
    birthdate: student.birthdate,
    sex: student.sex,
    record: record.schoolYears.map(year => ({
      academicYear: year.schoolYear,
      gradeLevel: year.gradeLevel,
      section: year.section,
      adviser: year.adviser,
      subjects: year.subjects.map(subj => ({
        code: subj.subjectCode,
        name: subj.subjectName,
        finalRating: subj.finalRating,
        remarks: subj.remarks
      })),
      generalAverage: year.generalAverage,
      status: year.status,
      attendance: year.attendance
    }))
  };
}
