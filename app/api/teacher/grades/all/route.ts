import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function getTeacherSession(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      return sessionData.teacher?.id || sessionData.teacher?.uid;
    } catch {
      return null;
    }
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const schoolYear = searchParams.get('schoolYear') || '2024-2025';

    // Get teacher's subjects from both subjects and teacherSubjects collections
    const subjectsQuery = query(
      collection(db, 'subjects'),
      where('teacherId', '==', teacherId),
      where('schoolYear', '==', schoolYear)
    );
    
    const teacherSubjectsQuery = query(
      collection(db, 'teacherSubjects'),
      where('teacherId', '==', teacherId),
      where('schoolYear', '==', schoolYear)
    );
    
    const [subjectsSnapshot, teacherSubjectsSnapshot] = await Promise.all([
      getDocs(subjectsQuery),
      getDocs(teacherSubjectsQuery)
    ]);
    
    const subjects = subjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      subjectId: doc.id,
      ...doc.data()
    }));
    
    const teacherSubjects = teacherSubjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Combine both collections and remove duplicates
    const allTeacherSubjects = [...subjects, ...teacherSubjects];
    const uniqueSubjects = Array.from(new Map(allTeacherSubjects.map(item => [
      (item as any).subjectId || (item as any).id, 
      item
    ])).values());

    if (uniqueSubjects.length === 0) {
      return NextResponse.json([]);
    }

    // Get all grades for the teacher's assigned subjects
    const gradesPromises = uniqueSubjects.map(async (ts: any) => {
      const subjectId = ts.subjectId || ts.id;
      const gradesQuery = query(
        collection(db, 'grades'),
        where('teacherId', '==', teacherId),
        where('subjectId', '==', subjectId),
        where('schoolYear', '==', schoolYear)
      );
      
      const gradesSnapshot = await getDocs(gradesQuery);
      return gradesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });

    const gradesArrays = await Promise.all(gradesPromises);
    const allGrades = gradesArrays.flat();

    return NextResponse.json(allGrades);

  } catch (error) {
    console.error('Error fetching all grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
