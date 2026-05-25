import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

const STUDENTS_COLLECTION = 'students';

function getTeacherIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      const t = sessionData?.teacher ?? sessionData;
      return t?.uid || t?.id || null;
    } catch {
      return null;
    }
  }

  const principalCookie = request.cookies.get('principalSession')?.value;
  if (principalCookie) {
    try {
      const sessionData = JSON.parse(principalCookie);
      const p = sessionData?.principal ?? sessionData;
      return p?.id ?? p?.uid ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    console.log('[rollover] Starting rollover update for student:', params.studentId);
    
    const requestorId = getTeacherIdFromRequest(request);
    console.log('[rollover] Requestor ID:', requestorId);
    
    if (!requestorId) {
      console.log('[rollover] Unauthorized - no requestor ID');
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { studentId } = params;
    const body = await request.json();
    const { activeAccount } = body;

    console.log('[rollover] Request body:', { studentId, activeAccount });

    if (typeof activeAccount !== 'boolean') {
      console.log('[rollover] Invalid activeAccount value:', activeAccount);
      return NextResponse.json(
        { message: 'Invalid activeAccount value. Must be boolean.' },
        { status: 400 }
      );
    }

    // Check if student exists
    const studentDoc = await db.collection(STUDENTS_COLLECTION).doc(studentId).get();
    console.log('[rollover] Student doc exists:', studentDoc.exists);
    
    if (!studentDoc.exists) {
      console.log('[rollover] Student not found:', studentId);
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    console.log('[rollover] Student data:', studentDoc.data());

    // Update the student's activeAccount status
    const studentData = studentDoc.data();
    const updateData: any = {
      activeAccount,
      updatedAt: new Date().toISOString(),
    };

    // Only add createdAt if it doesn't exist (for backward compatibility)
    if (studentData && !studentData.createdAt) {
      updateData.createdAt = new Date().toISOString();
    }

    await db.collection(STUDENTS_COLLECTION).doc(studentId).update(updateData);

    console.log('[rollover] Successfully updated student:', studentId);

    return NextResponse.json({
      message: 'Account status updated successfully',
      studentId,
      activeAccount,
    });
  } catch (error: any) {
    console.error('[rollover] Error updating account status:', error?.message || error);
    console.error('[rollover] Full error:', error);
    
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error?.message, 
        details: error?.code,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
