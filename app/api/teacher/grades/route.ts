import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import GradeService from '@/lib/grade-service';

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

    const quarter = normalizePeriod(gradingPeriod);
    const grades = await GradeService.getGradesByTeacherSubject(teacherId, subjectId, quarter, schoolYear);

    return NextResponse.json(grades);

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function normalizePeriod(period: string): string {
  const map: Record<string, string> = {
    first: 'Q1',
    second: 'Q2',
    third: 'Q3',
    fourth: 'Q4',
    '1st': 'Q1',
    '2nd': 'Q2',
    '3rd': 'Q3',
    '4th': 'Q4'
  };

  return map[period.toLowerCase()] || period;
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

    const gradeData = grades.map(grade => ({
      studentId: grade.studentId,
      subjectId: grade.subjectId,
      gradeLevel: grade.gradeLevel || 'Unknown',
      section: grade.section || 'Default',
      schoolYear,
      quarter: normalizePeriod(grade.gradingPeriod) as 'Q1' | 'Q2' | 'Q3' | 'Q4',
      grade: grade.grade,
      remarks: grade.remarks || '',
      teacherId: grade.teacherId || teacherId
    }));

    const results = await GradeService.saveGrades(gradeData);

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
