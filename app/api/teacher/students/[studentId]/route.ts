import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const teacherId = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if student exists
    const studentRef = doc(db, 'students', studentId);
    const studentDoc = await getDoc(studentRef);

    if (!studentDoc.exists()) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    const studentData = studentDoc.data();

    // Verify that this student belongs to the requesting teacher
    console.log('Student data:', studentData);
    console.log('Teacher ID from token:', teacherId);
    console.log('Comparison result:', studentData.teacherId !== teacherId);
    
    // (This assumes students have a teacherId field - adjust as needed)
    if (studentData.teacherId && studentData.teacherId !== teacherId) {
      console.log('Unauthorized: student belongs to different teacher');
      return NextResponse.json(
        { message: 'Unauthorized to delete this student' },
        { status: 403 }
      );
    }

    console.log('Authorization check passed, proceeding with deletion');
    
    // Delete the student document
    console.log('Deleting student document...');
    await deleteDoc(studentRef);
    console.log('Student document deleted');

    // Delete related grades for this student
    console.log('Querying grades for student:', studentId);
    const gradesQuery = query(collection(db, 'grades'), where('studentId', '==', studentId));
    const gradesSnapshot = await getDocs(gradesQuery);
    console.log('Found grades to delete:', gradesSnapshot.docs.length);
    
    // Delete all grades for this student
    console.log('Starting grade deletion...');
    const deletePromises = gradesSnapshot.docs.map(gradeDoc => {
      console.log('Deleting grade document:', gradeDoc.id);
      return deleteDoc(gradeDoc.ref);
    });
    
    console.log('Waiting for all deletions to complete...');
    await Promise.all(deletePromises);
    console.log('All deletions completed');

    return NextResponse.json(
      { message: 'Student and related grades deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting student:', error);
    
    // Log specific error details
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', typeof error);
      console.error('Error details:', error);
    }
    
    return NextResponse.json(
      { 
        message: 'Failed to delete student',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const teacherId = authHeader.replace('Bearer ', '');

    // Get student document
    const studentRef = doc(db, 'students', studentId);
    const studentDoc = await getDoc(studentRef);

    if (!studentDoc.exists()) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    const studentData = studentDoc.data();

    // Verify that this student belongs to the requesting teacher
    if (studentData.teacherId && studentData.teacherId !== teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized to access this student' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: studentDoc.id,
      ...studentData
    });

  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
