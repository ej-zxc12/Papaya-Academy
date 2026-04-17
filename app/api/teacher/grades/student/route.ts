import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

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
    const studentId = searchParams.get('studentId');
    const schoolYear = searchParams.get('schoolYear') || '2024-2025';

    // If studentId is 'all', fetch ALL grades for the school year (from all teachers)
    // Otherwise, fetch grades for a specific student
    let gradesQuery;
    
    if (!studentId) {
      return NextResponse.json(
        { message: 'studentId is required' },
        { status: 400 }
      );
    }

    if (studentId === 'all') {
      // Get ALL grades for the school year - needed for report cards to show all teacher grades
      gradesQuery = query(
        collection(db, 'grades'),
        where('schoolYear', '==', schoolYear)
      );
    } else {
      // Get ALL grades for this specific student - not just current teacher's subjects
      // This is needed for SF10 which should show all grades regardless of who entered them
      gradesQuery = query(
        collection(db, 'grades'),
        where('studentId', '==', studentId),
        where('schoolYear', '==', schoolYear)
      );
    }
    
    const gradesSnapshot = await getDocs(gradesQuery);
    const grades: any[] = gradesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch subject names for grades that have subjectId but no proper subjectName
    const subjectIds = Array.from(new Set(grades.map(g => g.subjectId).filter(Boolean)));
    const subjectNamesMap = new Map<string, string>();
    
    for (const subjectId of subjectIds) {
      try {
        const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
        if (subjectDoc.exists()) {
          const subjectData = subjectDoc.data();
          subjectNamesMap.set(subjectId, subjectData.name || subjectData.subjectName || subjectId);
        } else {
          // Try teacherSubjects collection
          const teacherSubjectDoc = await getDoc(doc(db, 'teacherSubjects', subjectId));
          if (teacherSubjectDoc.exists()) {
            const tsData = teacherSubjectDoc.data();
            subjectNamesMap.set(subjectId, tsData.subjectName || tsData.name || subjectId);
          }
        }
      } catch (err) {
        console.error(`Error fetching subject ${subjectId}:`, err);
      }
    }

    // Enrich grades with proper subject names
    const enrichedGrades = grades.map(grade => ({
      ...grade,
      subjectName: grade.subjectName && grade.subjectName !== 'Unknown Subject' 
        ? grade.subjectName 
        : subjectNamesMap.get(grade.subjectId) || grade.subjectId
    }));

    return NextResponse.json(enrichedGrades);

  } catch (error) {
    console.error('Error fetching student grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
