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
    const requestorId = getTeacherIdFromRequest(request);
    if (!requestorId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { studentId } = params;
    const body = await request.json();
    const { rolloverActive } = body;

    if (typeof rolloverActive !== 'boolean') {
      return NextResponse.json(
        { message: 'Invalid rolloverActive value. Must be boolean.' },
        { status: 400 }
      );
    }

    // Update the student's rolloverActive status
    await db.collection(STUDENTS_COLLECTION).doc(studentId).update({
      rolloverActive,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Rollover status updated successfully',
      studentId,
      rolloverActive,
    });
  } catch (error: any) {
    console.error('[rollover] Error updating rollover status:', error?.message || error);
    return NextResponse.json(
      { message: 'Internal server error', error: error?.message },
      { status: 500 }
    );
  }
}
