import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, where, addDoc, updateDoc, serverTimestamp, getDoc, deleteDoc, Timestamp } from 'firebase/firestore';

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

// GET - Fetch report card grades for a student
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
    const gradeLevel = searchParams.get('gradeLevel');
    const schoolYear = searchParams.get('schoolYear') || '2024-2025';

    const reportCardsCollection = collection(db, 'reportCardGrades');
    let q;

    if (studentId) {
      // Get specific student's report card
      q = query(reportCardsCollection, where('studentId', '==', studentId), where('schoolYear', '==', schoolYear));
    } else if (gradeLevel) {
      // Get all report cards for a grade level
      q = query(reportCardsCollection, where('gradeLevel', '==', gradeLevel), where('schoolYear', '==', schoolYear));
    } else {
      // Get all report cards for the teacher
      q = query(reportCardsCollection, where('teacherId', '==', teacherId), where('schoolYear', '==', schoolYear));
    }

    const querySnapshot = await getDocs(q);
    const reportCards = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null,
      };
    });

    return NextResponse.json(reportCards);
  } catch (error) {
    console.error('Error fetching report cards:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update report card grades for a student
export async function POST(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { studentId, gradeLevel, section, schoolYear, subjects, adviserName } = body;

    if (!studentId || !gradeLevel || !schoolYear || !subjects || !Array.isArray(subjects)) {
      return NextResponse.json(
        { message: 'studentId, gradeLevel, schoolYear, and subjects array are required' },
        { status: 400 }
      );
    }

    // Check if report card already exists
    const reportCardsCollection = collection(db, 'reportCardGrades');
    const existingQuery = query(
      reportCardsCollection, 
      where('studentId', '==', studentId), 
      where('schoolYear', '==', schoolYear)
    );
    const existingSnapshot = await getDocs(existingQuery);

    // Calculate final ratings and general average
    const processedSubjects = subjects.map(subject => {
      const grades = [subject.firstGrading, subject.secondGrading, subject.thirdGrading, subject.fourthGrading];
      const validGrades = grades.filter(g => g !== null && g !== undefined && !isNaN(g));
      const finalRating = validGrades.length > 0 
        ? validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length 
        : 0;
      
      return {
        ...subject,
        finalRating: Math.round(finalRating * 100) / 100, // Round to 2 decimal places
        teacherId: teacherId
      };
    });

    // Calculate general average
    const validFinalRatings = processedSubjects.map(s => s.finalRating).filter(r => r > 0);
    const generalAverage = validFinalRatings.length > 0 
      ? validFinalRatings.reduce((sum, rating) => sum + rating, 0) / validFinalRatings.length 
      : 0;

    const reportCardData = {
      studentId,
      gradeLevel,
      section: section || '',
      schoolYear,
      teacherId,
      subjects: processedSubjects,
      generalAverage: Math.round(generalAverage * 100) / 100,
      adviserName: adviserName || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (!existingSnapshot.empty) {
      // Update existing report card
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(doc(reportCardsCollection, existingDoc.id), {
        ...reportCardData,
        updatedAt: serverTimestamp()
      });

      return NextResponse.json({
        message: 'Report card updated successfully',
        reportCard: {
          id: existingDoc.id,
          ...reportCardData,
          createdAt: new Date().toISOString(), // Use current date for response
          updatedAt: new Date().toISOString()
        }
      });
    } else {
      // Create new report card
      const docRef = await addDoc(reportCardsCollection, reportCardData);
      
      return NextResponse.json({
        message: 'Report card created successfully',
        reportCard: {
          id: docRef.id,
          ...reportCardData,
          createdAt: new Date().toISOString(), // Use current date for response
          updatedAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Error saving report card:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update specific subject in report card
export async function PUT(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportCardId, subjectId, subjectData } = body;

    if (!reportCardId || !subjectId || !subjectData) {
      return NextResponse.json(
        { message: 'reportCardId, subjectId, and subjectData are required' },
        { status: 400 }
      );
    }

    const reportCardRef = doc(db, 'reportCardGrades', reportCardId);
    const reportCardDoc = await getDoc(reportCardRef);

    if (!reportCardDoc.exists()) {
      return NextResponse.json(
        { message: 'Report card not found' },
        { status: 404 }
      );
    }

    const reportCardData = reportCardDoc.data();
    
    // Update or add the subject
    const existingSubjectIndex = reportCardData.subjects.findIndex((s: any) => s.subjectId === subjectId);
    
    const updatedSubject = {
      ...subjectData,
      finalRating: calculateFinalRating(subjectData),
      teacherId: teacherId
    };

    if (existingSubjectIndex >= 0) {
      reportCardData.subjects[existingSubjectIndex] = updatedSubject;
    } else {
      reportCardData.subjects.push(updatedSubject);
    }

    // Recalculate general average
    const validFinalRatings = reportCardData.subjects
      .map((s: any) => s.finalRating)
      .filter((r: number) => r > 0);
    const generalAverage = validFinalRatings.length > 0 
      ? validFinalRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validFinalRatings.length 
      : 0;

    await updateDoc(reportCardRef, {
      subjects: reportCardData.subjects,
      generalAverage: Math.round(generalAverage * 100) / 100,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({
      message: 'Subject updated successfully',
      reportCard: {
        id: reportCardId,
        ...reportCardData,
        generalAverage: Math.round(generalAverage * 100) / 100,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete report card
export async function DELETE(request: NextRequest) {
  try {
    const teacherId = getTeacherSession(request);
    if (!teacherId) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportCardId = searchParams.get('reportCardId');
    const studentId = searchParams.get('studentId');

    if (!reportCardId && !studentId) {
      return NextResponse.json(
        { message: 'Either reportCardId or studentId is required' },
        { status: 400 }
      );
    }

    const reportCardsCollection = collection(db, 'reportCardGrades');

    if (reportCardId) {
      // Delete specific report card
      await deleteDoc(doc(reportCardsCollection, reportCardId));
      return NextResponse.json({ message: 'Report card deleted successfully' });
    } else if (studentId) {
      // Delete all report cards for a student
      const q = query(reportCardsCollection, where('studentId', '==', studentId));
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      return NextResponse.json({ message: 'All report cards for student deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting report card:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateFinalRating(subjectData: any): number {
  const grades = [
    subjectData.firstGrading, 
    subjectData.secondGrading, 
    subjectData.thirdGrading, 
    subjectData.fourthGrading
  ];
  const validGrades = grades.filter(g => g !== null && g !== undefined && !isNaN(g));
  
  if (validGrades.length === 0) return 0;
  
  const average = validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length;
  return Math.round(average * 100) / 100; // Round to 2 decimal places
}
