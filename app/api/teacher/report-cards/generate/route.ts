import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';

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

// POST - Generate report card from existing individual grades
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
    const { studentId, gradeLevel, section, schoolYear } = body;

    if (!studentId || !gradeLevel || !schoolYear) {
      return NextResponse.json(
        { message: 'studentId, gradeLevel, and schoolYear are required' },
        { status: 400 }
      );
    }

    // Get student information
    const studentsCollection = collection(db, 'students');
    const studentQuery = query(studentsCollection, where('id', '==', studentId));
    const studentSnapshot = await getDocs(studentQuery);
    
    if (studentSnapshot.empty) {
      return NextResponse.json(
        { message: 'Student not found' },
        { status: 404 }
      );
    }

    const student = studentSnapshot.docs[0].data();

    // Get subjects for the student (both old and new structure)
    let subjectIds: string[] = [];
    
    if (student.subjectIds && Array.isArray(student.subjectIds)) {
      // New structure - multiple subjects in array
      subjectIds = student.subjectIds;
    } else if (student.subjectId) {
      // Old structure - single subject
      subjectIds = [student.subjectId];
    }

    if (subjectIds.length === 0) {
      return NextResponse.json(
        { message: 'No subjects found for this student' },
        { status: 404 }
      );
    }

    // Get subject details
    const subjectsCollection = collection(db, 'teacherSubjects');
    const subjectsQuery = query(subjectsCollection, where('teacherId', '==', teacherId));
    const subjectsSnapshot = await getDocs(subjectsQuery);
    
    const availableSubjects = subjectsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(subject => subjectIds.includes(subject.id));

    // Get existing grades for all grading periods
    const gradesCollection = collection(db, 'grades');
    const allGradesQuery = query(
      gradesCollection, 
      where('studentId', '==', studentId),
      where('teacherId', '==', teacherId)
    );
    const gradesSnapshot = await getDocs(allGradesQuery);
    
    const existingGrades = gradesSnapshot.docs.map(doc => doc.data());

    // Organize grades by subject and grading period
    const gradesBySubject: { [subjectId: string]: { [period: string]: number } } = {};
    
    existingGrades.forEach(grade => {
      if (!gradesBySubject[grade.subjectId]) {
        gradesBySubject[grade.subjectId] = {};
      }
      // Handle both gradingPeriod and quarter fields for backward compatibility
      const period = grade.gradingPeriod || grade.quarter;
      if (period) {
        // Normalize period names to match expected format
        const normalizedPeriod = period === 'Q1' ? 'first' : 
                                period === 'Q2' ? 'second' : 
                                period === 'Q3' ? 'third' : 
                                period === 'Q4' ? 'fourth' : period;
        gradesBySubject[grade.subjectId][normalizedPeriod] = grade.grade;
      }
    });

    // Build report card subjects array
    const reportCardSubjects = availableSubjects.map((subject: any) => {
      const subjectGrades = gradesBySubject[subject.id] || {};
      
      return {
        subjectId: subject.id,
        subjectName: subject.name || 'Unknown Subject',
        subjectCode: subject.code || (subject.name ? subject.name.substring(0, 3).toUpperCase() : 'SUB'),
        firstGrading: subjectGrades['first'] || 0,
        secondGrading: subjectGrades['second'] || 0,
        thirdGrading: subjectGrades['third'] || 0,
        fourthGrading: subjectGrades['fourth'] || 0,
        finalRating: 0, // Will be calculated
        remarks: '',
        teacherId: teacherId,
        teacherName: '' // Can be populated if needed
      };
    });

    // Calculate final ratings
    const processedSubjects = reportCardSubjects.map(subject => {
      const grades = [subject.firstGrading, subject.secondGrading, subject.thirdGrading, subject.fourthGrading];
      const validGrades = grades.filter(g => g !== null && g !== undefined && !isNaN(g) && g > 0);
      const finalRating = validGrades.length > 0 
        ? validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length 
        : 0;
      
      return {
        ...subject,
        finalRating: Math.round(finalRating * 100) / 100 // Round to 2 decimal places
      };
    });

    // Calculate general average
    const validFinalRatings = processedSubjects.map(s => s.finalRating).filter(r => r > 0);
    const generalAverage = validFinalRatings.length > 0 
      ? validFinalRatings.reduce((sum, rating) => sum + rating, 0) / validFinalRatings.length 
      : 0;

    // Generate report card data
    const reportCardData = {
      studentId,
      gradeLevel,
      section: section || student.section || '',
      schoolYear,
      teacherId,
      subjects: processedSubjects,
      generalAverage: Math.round(generalAverage * 100) / 100,
      adviserName: '', // Can be populated if needed
      status: generalAverage >= 75 ? 'promoted' : 'retained' as 'promoted' | 'retained' | 'dropped'
    };

    return NextResponse.json({
      message: 'Report card generated successfully',
      reportCard: reportCardData,
      student: {
        id: studentId,
        name: student.name,
        gradeLevel: student.gradeLevel,
        section: student.section
      }
    });
  } catch (error) {
    console.error('Error generating report card:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
