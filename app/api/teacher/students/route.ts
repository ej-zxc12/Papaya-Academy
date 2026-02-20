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
      return sessionData.teacher?.id;
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

    const studentsCollection = collection(db, 'students');
    let q = query(studentsCollection);

    // Add filters if provided
    const constraints = [];
    if (gradeLevels.length > 0) {
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
    // Filter by teacher's ID to ensure teachers only see their own students
    constraints.push(where('teacherId', '==', teacherId));

    if (constraints.length > 0) {
      q = query(studentsCollection, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const students = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
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

    const { name, gradeLevel } = await request.json();

    // Validate required fields
    if (!name || !gradeLevel) {
      return NextResponse.json(
        { message: 'Name and grade level are required' },
        { status: 400 }
      );
    }

    // Create new student
    const studentsCollection = collection(db, 'students');
    const studentData = {
      name: name.trim(),
      gradeLevel: gradeLevel.trim(),
      teacherId: teacherId // Add teacherId for authorization
    };

    const docRef = await addDoc(studentsCollection, studentData);
    const newStudent = {
      id: docRef.id,
      ...studentData
    };

    return NextResponse.json({
      message: 'Student created successfully',
      student: newStudent
    });

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
