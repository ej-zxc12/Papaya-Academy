import { NextRequest, NextResponse } from 'next/server';
import { Student } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';

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
      return sessionData?.teacher?.id ?? sessionData?.teacher?.uid ?? sessionData?.user?.uid ?? null;
    } catch {
      return null;
    }
  }
  
  return null;
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
    const gradeLevel = searchParams.get('gradeLevel');
    const gradeLevels = searchParams
      .getAll('gradeLevels')
      .filter(Boolean)
      .map((g) => g.trim())
      .filter(Boolean);
    const subjectId = searchParams.get('subjectId');

    const studentsCollection = collection(db, 'students');
    let q = query(studentsCollection);

    // Add filters if provided
    const constraints = [];
    constraints.push(where('teacherId', '==', teacherId));
    if (subjectId) {
      constraints.push(where('subjectId', '==', subjectId));
    } else if (gradeLevels.length > 0) {
      if (gradeLevels.length > 10) {
        return NextResponse.json(
          { message: 'gradeLevels must contain at most 10 values' },
          { status: 400 }
        );
      }
      constraints.push(where('gradeLevel', 'in', gradeLevels));
    } else if (gradeLevel) {
      constraints.push(where('gradeLevel', '==', gradeLevel));
    }

    if (constraints.length > 0) {
      q = query(studentsCollection, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const students = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data?.name,
        gradeLevel: data?.gradeLevel,
        teacherId: data?.teacherId,
        subjectId: data?.subjectId
      };
    });

    return NextResponse.json(students);

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
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

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const gradeLevel = typeof body?.gradeLevel === 'string' ? body.gradeLevel.trim() : '';
    const subjectId = typeof body?.subjectId === 'string' ? body.subjectId.trim() : '';

    if (!name || !gradeLevel || !teacherId) {
      return NextResponse.json(
        { message: 'name, gradeLevel, and teacherId are required' },
        { status: 400 }
      );
    }

    const studentsCollection = collection(db, 'students');
    const studentData = {
      name,
      gradeLevel,
      teacherId,
      subjectId,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(studentsCollection, studentData);
    const newStudent = {
      id: docRef.id,
      ...studentData,
      createdAt: studentData.createdAt.toDate().toISOString()
    };

    return NextResponse.json(newStudent);

  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}