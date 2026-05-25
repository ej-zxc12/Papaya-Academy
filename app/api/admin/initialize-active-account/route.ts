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

export async function POST(request: NextRequest) {
  try {
    const requestorId = getTeacherIdFromRequest(request);
    if (!requestorId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    console.log('[initialize-active-account] Starting initialization for all students');

    // Get all students
    const studentsSnap = await db.collection(STUDENTS_COLLECTION).get();
    console.log(`[initialize-active-account] Found ${studentsSnap.docs.length} students`);

    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Update each student
    for (const doc of studentsSnap.docs) {
      try {
        const studentData = doc.data();
        const studentId = doc.id;

        // Skip if activeAccount already exists
        if (studentData.activeAccount !== undefined) {
          skippedCount++;
          continue;
        }

        // Add activeAccount field with default value true
        await db.collection(STUDENTS_COLLECTION).doc(studentId).update({
          activeAccount: true,
          updatedAt: new Date().toISOString(),
        });

        updatedCount++;
        console.log(`[initialize-active-account] Updated student: ${studentId}`);
      } catch (error: any) {
        const errorMsg = `Failed to update student ${doc.id}: ${error?.message}`;
        console.error(`[initialize-active-account] ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`[initialize-active-account] Completed: ${updatedCount} updated, ${skippedCount} skipped, ${errors.length} errors`);

    return NextResponse.json({
      message: 'Initialization completed',
      totalStudents: studentsSnap.docs.length,
      updated: updatedCount,
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('[initialize-active-account] Error:', error?.message || error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error?.message,
        details: error?.code,
      },
      { status: 500 }
    );
  }
}
