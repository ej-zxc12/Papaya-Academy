import { NextRequest, NextResponse } from 'next/server';
import type { Student } from '@/types';
import { db } from '@/lib/firebase-admin';

function getPrincipalIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return decodeURIComponent(authHeader.substring(7));
  }

  const sessionCookie = request.cookies.get('principalSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      const p = sessionData?.principal ?? sessionData;
      return p?.id ?? p?.uid ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const principalId = getPrincipalIdFromRequest(request);
    if (!principalId) {
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

    let studentsQuery: FirebaseFirestore.Query = db.collection('students');
    if (gradeLevels.length > 0) {
      if (gradeLevels.length > 10) {
        return NextResponse.json(
          { message: 'gradeLevels must contain at most 10 values' },
          { status: 400 }
        );
      }
      studentsQuery = studentsQuery.where('gradeLevel', 'in', gradeLevels);
    } else if (gradeLevel) {
      studentsQuery = studentsQuery.where('gradeLevel', '==', gradeLevel);
    }

    const snap = await studentsQuery.get();
    const students: Student[] = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        name: data?.name,
        gradeLevel: data?.gradeLevel,
        teacherId: data?.teacherId,
        subjectId: data?.subjectId,
      };
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('[principal/students] Error fetching students:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
