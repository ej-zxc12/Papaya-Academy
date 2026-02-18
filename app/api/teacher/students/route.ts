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

    const studentsCollection = collection(db, 'students');
    let q = query(studentsCollection);

    // Add filters if provided
    const constraints = [];
    if (gradeLevel) {
      constraints.push(where('grade', '==', gradeLevel));
    }
    // In a real application, you would filter by teacher's assigned classes
    // This might involve querying a separate teacher-student assignment collection

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

    const { name, grade, enrolledDate } = await request.json();

    // Validate required fields
    if (!name || !grade) {
      return NextResponse.json(
        { message: 'Name and grade are required' },
        { status: 400 }
      );
    }

    // Create new student
    const studentsCollection = collection(db, 'students');
    const studentData = {
      name: name.trim(),
      grade: grade.trim(),
      enrolledDate: enrolledDate ? Timestamp.fromDate(new Date(enrolledDate)) : Timestamp.fromDate(new Date()),
      attendance: [],
      grades: []
    };

    const docRef = await addDoc(studentsCollection, studentData);
    const newStudent = {
      id: docRef.id,
      ...studentData,
      enrolledDate: studentData.enrolledDate.toDate().toISOString()
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
