import { NextRequest, NextResponse } from 'next/server';
import { Subject } from '@/types';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';

// Mock subject data - replace with actual database
const mockSubjects: Subject[] = [
  {
    id: 'subj1',
    name: 'Mathematics',
    code: 'MATH',
    gradeLevels: ['Grade 7'],
    gradeLevel: 'Grade 7',
    teacherId: 'teacher1',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj2',
    name: 'English',
    code: 'ENG',
    gradeLevels: ['Grade 7'],
    gradeLevel: 'Grade 7',
    teacherId: 'teacher1',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj3',
    name: 'Science',
    code: 'SCI',
    gradeLevels: ['Grade 8'],
    gradeLevel: 'Grade 8',
    teacherId: 'teacher2',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj4',
    name: 'Filipino',
    code: 'FIL',
    gradeLevels: ['Grade 8'],
    gradeLevel: 'Grade 8',
    teacherId: 'teacher2',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj5',
    name: 'Araling Panlipunan',
    code: 'AP',
    gradeLevels: ['Grade 7'],
    gradeLevel: 'Grade 7',
    teacherId: 'teacher1',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj6',
    name: 'MAPEH',
    code: 'MAPEH',
    gradeLevels: ['Grade 7'],
    gradeLevel: 'Grade 7',
    teacherId: 'teacher1',
    schoolYear: '2024-2025'
  },
  {
    id: 'subj7',
    name: 'Edukasyon sa Pagpapakatao',
    code: 'ESP',
    gradeLevels: ['Grade 7'],
    gradeLevel: 'Grade 7',
    teacherId: 'teacher1',
    schoolYear: '2024-2025'
  }
];

function getTeacherId(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

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

function getTeacherUid(request: NextRequest) {
  // Authorization header should carry the teacher uid/id. Prefer uid; fall back to id.
  const bearer = getTeacherId(request);
  if (bearer) return bearer;

  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      return sessionData?.teacher?.uid ?? sessionData?.teacher?.id ?? sessionData?.user?.uid ?? null;
    } catch {
      return null;
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherIdFromQuery = searchParams.get('teacherId');
    const teacherUidFromQuery = searchParams.get('teacherUid');
    const teacherUid = getTeacherUid(request) || teacherUidFromQuery || teacherIdFromQuery;

    if (!teacherUid) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const subjectsCollection = collection(db, 'subjects');
    // Prefer the canonical key teacherUid; fall back to teacherId for older data.
    const [byUidSnap, byIdSnap] = await Promise.all([
      getDocs(query(subjectsCollection, where('teacherUid', '==', teacherUid))),
      getDocs(query(subjectsCollection, where('teacherId', '==', teacherUid))),
    ]);

    const mergedDocs = new Map<string, (typeof byUidSnap.docs)[number]>();
    byUidSnap.docs.forEach(d => mergedDocs.set(d.id, d));
    byIdSnap.docs.forEach(d => mergedDocs.set(d.id, d));

    const subjects = Array.from(mergedDocs.values()).map((docSnap) => {
      const data = docSnap.data() as any;
      const gradeLevels = Array.isArray(data.gradeLevels)
        ? data.gradeLevels
        : (typeof data.gradeLevel === 'string' && data.gradeLevel ? [data.gradeLevel] : []);
      return {
        id: docSnap.id,
        ...data,
        gradeLevels,
        gradeLevel: gradeLevels[0] || data.gradeLevel,
      } as Subject;
    });

    return NextResponse.json(subjects);

  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const teacherUid = getTeacherUid(request);
    if (!teacherUid) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    const gradeLevelsFromBody = Array.isArray(body?.gradeLevels)
      ? body.gradeLevels.filter((g: any) => typeof g === 'string').map((g: string) => g.trim()).filter(Boolean)
      : [];
    const gradeLevelFromBody = typeof body?.gradeLevel === 'string' ? body.gradeLevel.trim() : '';
    const gradeLevels = gradeLevelsFromBody.length > 0
      ? Array.from(new Set(gradeLevelsFromBody))
      : (gradeLevelFromBody ? [gradeLevelFromBody] : []);
    const schoolYear = typeof body?.schoolYear === 'string' ? body.schoolYear.trim() : '';

    if (!name || !code || gradeLevels.length === 0 || !schoolYear) {
      return NextResponse.json(
        { message: 'name, code, gradeLevels (or gradeLevel), and schoolYear are required' },
        { status: 400 }
      );
    }

    const subjectsCollection = collection(db, 'subjects');
    const subjectData: Omit<Subject, 'id'> = {
      name,
      code,
      gradeLevels,
      gradeLevel: gradeLevels[0],
      teacherId: teacherUid,
      teacherUid,
      schoolYear
    };

    const docRef = await addDoc(subjectsCollection, subjectData);

    return NextResponse.json(
      {
        message: 'Subject created successfully',
        subject: { id: docRef.id, ...subjectData }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const teacherId = getTeacherId(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subjectId, gradeLevels } = body;

    if (!subjectId || !Array.isArray(gradeLevels) || gradeLevels.length === 0) {
      return NextResponse.json(
        { message: 'subjectId and gradeLevels are required' },
        { status: 400 }
      );
    }

    // Verify the subject belongs to the teacher
    const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
    if (!subjectDoc.exists()) {
      return NextResponse.json(
        { message: 'Subject not found' },
        { status: 404 }
      );
    }

    const subjectData = subjectDoc.data();
    if (subjectData.teacherId !== teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Subject does not belong to this teacher' },
        { status: 403 }
      );
    }

    // Update the subject with new grade levels
    const updatedGradeLevels = Array.from(new Set([...(subjectData.gradeLevels || []), ...gradeLevels]));
    await updateDoc(doc(db, 'subjects', subjectId), {
      gradeLevels: updatedGradeLevels,
      gradeLevel: updatedGradeLevels[0] // Update primary grade level
    });

    return NextResponse.json({
      message: 'Grade levels added successfully',
      gradeLevels: updatedGradeLevels
    });

  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
