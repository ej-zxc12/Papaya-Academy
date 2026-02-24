import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

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

export async function DELETE(
  request: NextRequest,
  context: { params: { studentId: string } }
) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    console.log("DELETE function called");
    console.log("Context:", context);
    console.log("Params:", context.params);
    
    // Try multiple ways to get studentId
    let studentId = context.params?.studentId;
    
    // If not found, try alternative parameter access
    if (!studentId && context.params) {
      const paramKeys = Object.keys(context.params) as (keyof typeof context.params)[];
      console.log("Available param keys:", paramKeys);
      if (paramKeys.length > 0) {
        studentId = context.params[paramKeys[0]]; // Try first param
      }
    }
    
    // If still not found, try from URL
    if (!studentId) {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      studentId = pathParts[pathParts.length - 1];
      console.log("Extracted from URL:", studentId);
    }
    
    console.log("Student ID extracted:", studentId);
    console.log("Student ID type:", typeof studentId);

    if (!studentId) {
      console.error("No student ID provided");
      return NextResponse.json({ message: "No student ID provided" }, { status: 400 });
    }

    console.log("Database reference:", db);
    console.log("doc function:", typeof doc);
    console.log("deleteDoc function:", typeof deleteDoc);

    const studentRef = doc(db, 'students', studentId);
    console.log("Student reference created:", studentRef);

    const studentDoc = await getDoc(studentRef);
    if (studentDoc.exists()) {
      const studentData = studentDoc.data();
      if (studentData?.teacherId && studentData.teacherId !== teacherId) {
        return NextResponse.json(
          { message: 'Unauthorized to delete this student' },
          { status: 403 }
        );
      }
    }

    console.log("Attempting to delete document...");
    await deleteDoc(studentRef);
    console.log("Document deleted successfully");

    return NextResponse.json({ message: "Deleted successfully" });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    console.error("Error type:", typeof error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json({ 
      message: "Failed", 
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;
    
    // Check teacher session
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

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
