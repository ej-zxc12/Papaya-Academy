import { NextRequest, NextResponse } from 'next/server';
import { GradeInput } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, doc, setDoc, getDoc } from 'firebase/firestore';

function getTeacherSession(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  const sessionCookie = request.cookies.get('teacherSession')?.value;
  if (sessionCookie) {
    try {
      const sessionData = JSON.parse(sessionCookie);
      return sessionData.teacher?.id;
    } catch {
      return null;
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { grades } = await request.json();

    if (!Array.isArray(grades)) {
      return NextResponse.json(
        { message: 'Grades must be an array' },
        { status: 400 }
      );
    }

    const subjectsCollection = collection(db, 'subjects');
    const subjectsSnapshot = await getDocs(query(subjectsCollection));
    const subjectMap = new Map(subjectsSnapshot.docs.map(doc => [doc.id, doc.data().name]));

    for (const grade of grades) {
      if (!grade.studentId || !grade.subjectId || !grade.gradingPeriod || !grade.teacherId) {
        return NextResponse.json(
          { message: 'Missing required fields in grade entry' },
          { status: 400 }
        );
      }

      if (typeof grade.grade !== 'number' || grade.grade < 0 || grade.grade > 100) {
        return NextResponse.json(
          { message: 'Grade must be a number between 0 and 100' },
          { status: 400 }
        );
      }
    }

    const gradesCollection = collection(db, 'grades');
    const savedGrades = [];
    const updatedGrades = [];

    for (const grade of grades) {
      const existingGradeQuery = query(
        gradesCollection,
        where('studentId', '==', grade.studentId),
        where('subjectId', '==', grade.subjectId),
        where('gradingPeriod', '==', grade.gradingPeriod)
      );
      
      const existingGradeSnapshot = await getDocs(existingGradeQuery);
      
      const gradeData = {
        ...grade,
        subjectName: subjectMap.get(grade.subjectId) || '',
        dateInput: Timestamp.fromDate(new Date(grade.dateInput))
      };

      if (existingGradeSnapshot.empty) {
        const docRef = await addDoc(gradesCollection, gradeData);
        savedGrades.push({ id: docRef.id, ...grade });
      } else {
        const existingDoc = existingGradeSnapshot.docs[0];
        await setDoc(doc(db, 'grades', existingDoc.id), gradeData, { merge: true });
        updatedGrades.push({ id: existingDoc.id, ...grade });
      }
    }

    return NextResponse.json({
      message: 'Grades processed successfully',
      savedCount: savedGrades.length,
      updatedCount: updatedGrades.length,
      totalProcessed: grades.length
    });

  } catch (error) {
    console.error('Error saving grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
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
    const subjectId = searchParams.get('subjectId');
    const gradingPeriod = searchParams.get('gradingPeriod');

    const gradesCollection = collection(db, 'grades');
    let q = query(gradesCollection);

    const constraints = [];
    if (subjectId) {
      constraints.push(where('subjectId', '==', subjectId));
    }
    if (gradingPeriod) {
      constraints.push(where('gradingPeriod', '==', gradingPeriod));
    }

    if (constraints.length > 0) {
      q = query(gradesCollection, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const grades = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dateInput: data.dateInput?.toDate?.()?.toISOString() || data.dateInput
      };
    });

    return NextResponse.json(grades);

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}