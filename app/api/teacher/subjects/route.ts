import { NextRequest, NextResponse } from 'next/server';
import { Subject } from '@/types';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherIdFromQuery = searchParams.get('teacherId');
    const authHeader = request.headers.get('authorization');
    const teacherIdFromAuth = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const teacherId = teacherIdFromAuth || teacherIdFromQuery;

    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const subjectsCollection = collection(db, 'subjects');
    const q = query(subjectsCollection, where('teacherId', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const subjects = querySnapshot.docs.map((docSnap) => {
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
    const authHeader = request.headers.get('authorization');
    const teacherId = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!teacherId) {
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
      teacherId,
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
