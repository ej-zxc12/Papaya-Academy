import { NextRequest, NextResponse } from 'next/server';
import { Student } from '@/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, Timestamp, QueryConstraint } from 'firebase/firestore';

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

function getTeacherIdentifiers(request: NextRequest) {
  const bearer = getTeacherSession(request);

  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (!sessionCookie) {
    return { uid: bearer ?? null, id: bearer ?? null };
  }

  try {
    const sessionData = JSON.parse(sessionCookie);
    const t = sessionData?.teacher ?? sessionData;
    const uid = (typeof t?.uid === 'string' && t.uid) ? t.uid : null;
    const id = (typeof t?.id === 'string' && t.id) ? t.id : null;

    // If bearer exists, it should represent the canonical teacher identifier for this device.
    return {
      uid: uid ?? bearer ?? null,
      id: id ?? bearer ?? null,
    };
  } catch {
    return { uid: bearer ?? null, id: bearer ?? null };
  }
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

    const { uid, id } = getTeacherIdentifiers(request);
    const teacherIdsToTry = Array.from(new Set([uid, id, teacherId].filter(Boolean))) as string[];

    if (teacherIdsToTry.length === 0) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Add filters if provided
    const baseConstraints: QueryConstraint[] = [];
    if (subjectId) {
      baseConstraints.push(where('subjectId', '==', subjectId));
    } else if (gradeLevels.length > 0) {
      if (gradeLevels.length > 10) {
        return NextResponse.json(
          { message: 'gradeLevels must contain at most 10 values' },
          { status: 400 }
        );
      }
      baseConstraints.push(where('gradeLevel', 'in', gradeLevels));
    } else if (gradeLevel) {
      baseConstraints.push(where('gradeLevel', '==', gradeLevel));
    }

    const results = await Promise.all(
      teacherIdsToTry.map(async (tid) => {
        const constraints: QueryConstraint[] = [where('teacherId', '==', tid), ...baseConstraints];
        const q = query(studentsCollection, ...constraints);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }));
      })
    );

    const merged = new Map<string, any>();
    for (const group of results) {
      for (const item of group) {
        merged.set(item.id, item.data);
      }
    }

    const students = Array.from(merged.entries()).map(([id, data]) => {
      return {
        id,
        name: data?.name,
        gradeLevel: data?.gradeLevel,
        teacherId: data?.teacherId,
        subjectId: data?.subjectId,
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
    const subjectIds = Array.isArray(body?.subjectIds) 
      ? body.subjectIds.filter((id: any) => typeof id === 'string' && id.trim()).map((id: string) => id.trim())
      : (typeof body?.subjectId === 'string' ? [body.subjectId.trim()] : []);

    if (!name || !gradeLevel || !teacherId) {
      return NextResponse.json(
        { message: 'name, gradeLevel, and teacherId are required' },
        { status: 400 }
      );
    }

    if (subjectIds.length === 0) {
      return NextResponse.json(
        { message: 'At least one subject ID is required' },
        { status: 400 }
      );
    }

    const studentsCollection = collection(db, 'students');
    const createdStudents = [];

    // Create a separate student record for each subject
    for (const subjectId of subjectIds) {
      const studentData = {
        name,
        gradeLevel,
        teacherId,
        subjectId, // Each student record gets its own subject ID
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(studentsCollection, studentData);
      const newStudent = {
        id: docRef.id,
        ...studentData,
        createdAt: studentData.createdAt.toDate().toISOString()
      };

      createdStudents.push(newStudent);
    }

    return NextResponse.json({
      message: `Student created for ${subjectIds.length} subject(s)`,
      students: createdStudents
    });

  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}