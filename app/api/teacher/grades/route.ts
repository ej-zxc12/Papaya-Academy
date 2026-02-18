import { NextRequest, NextResponse } from 'next/server';
import { GradeInput } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

// Simple middleware to check for teacher session
function getTeacherSession(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // For now, accept a simple Bearer token for development
    // In production, this should verify Firebase ID tokens
    return authHeader.substring(7);
  }
  
  // Check for session in cookies (alternative approach)
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

export async function POST(request: NextRequest) {
  try {
    // Check teacher session
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { grades } = await request.json();

    if (!Array.isArray(grades)) {
      return NextResponse.json(
        { message: 'Grades must be an array' },
        { status: 400 }
      );
    }

    // Validate each grade entry
    for (const grade of grades) {
      if (!grade.studentId || !grade.subjectId || !grade.gradingPeriod || !grade.teacherId) {
        return NextResponse.json(
          { message: 'Missing required fields in grade entry' },
          { status: 400 }
        );
      }

      if (typeof grade.grade !== 'number' || grade.grade < 0 || grade.grade > 100) {
        return NextResponse.json(
          { message: 'Grade must be a number between 0 and 100' },
          { status: 400 }
        );
      }
    }

    // Save grades to Firebase
    const gradesCollection = collection(db, 'grades');
    const savedGrades = [];

    for (const grade of grades) {
      const gradeData = {
        ...grade,
        dateInput: Timestamp.fromDate(new Date(grade.dateInput))
      };
      const docRef = await addDoc(gradesCollection, gradeData);
      savedGrades.push({ id: docRef.id, ...grade });
    }

    return NextResponse.json({
      message: 'Grades saved successfully',
      savedCount: grades.length
    });

  } catch (error) {
    console.error('Error saving grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check teacher session
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

    const gradesCollection = collection(db, 'grades');
    let q = query(gradesCollection);

    // Add filters if provided
    const constraints = [];
    if (teacherId) {
      constraints.push(where('teacherId', '==', teacherId));
    }
    if (subjectId) {
      constraints.push(where('subjectId', '==', subjectId));
    }
    if (gradingPeriod) {
      constraints.push(where('gradingPeriod', '==', gradingPeriod));
    }

    if (constraints.length > 0) {
      q = query(gradesCollection, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const grades = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dateInput: data.dateInput?.toDate?.()?.toISOString() || data.dateInput
      };
    });

    return NextResponse.json(grades);

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
