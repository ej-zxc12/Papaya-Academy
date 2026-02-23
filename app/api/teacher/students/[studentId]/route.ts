import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

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

    const teacherId = authHeader.replace('Bearer ', '');

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
    // (This assumes students have a teacherId field - adjust as needed)
    if (studentData.teacherId && studentData.teacherId !== teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized to delete this student' },
        { status: 403 }
      );
    }

    // Delete the student document
    await deleteDoc(studentRef);

    // Optionally: Delete related grades from separate grades collection
    // This would depend on your database structure
    // For example, you might want to delete grades for this student:
    // const gradesQuery = query(collection(db, 'grades'), where('gradeLevel', '==', studentId));
    // const gradesSnapshot = await getDocs(gradesQuery);
    // gradesSnapshot.forEach(async (gradeDoc) => {
    //   await deleteDoc(gradeDoc.ref);
    // });

    return NextResponse.json(
      { message: 'Student deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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
