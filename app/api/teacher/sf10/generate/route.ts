import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Get teacher session from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }
    
    const teacherId = authHeader.slice(7); // Remove 'Bearer '
    
    // Parse request body
    const body = await request.json();
    const { studentId, schoolYear } = body;
    
    if (!studentId || !schoolYear) {
      return NextResponse.json(
        { message: 'Missing required fields: studentId and schoolYear' },
        { status: 400 }
      );
    }
    
    console.log(`Generating SF10 for student ${studentId}, school year ${schoolYear}`);
    
    // Get student data from admin SDK
    const studentRef = db.collection('students').doc(studentId);
    const studentDoc = await studentRef.get();
    
    if (!studentDoc.exists) {
      return NextResponse.json(
        { message: `Student ${studentId} not found` },
        { status: 404 }
      );
    }
    
    const student = studentDoc.data() as any;
    
    // Get all grades for this student
    const gradesQuery = db.collection('grades')
      .where('studentId', '==', studentId)
      .where('schoolYear', '==', schoolYear);
    
    const gradesSnapshot = await gradesQuery.get();
    const grades: any[] = [];
    
    gradesSnapshot.forEach(doc => {
      grades.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${grades.length} grades for student ${studentId}`);
    
    // Get subject names
    const subjectIdsSet = new Set(grades.map(g => g.subjectId));
    const subjectIds = Array.from(subjectIdsSet);
    const subjectsMap = new Map();
    
    for (const subjectId of subjectIds) {
      const subjectDoc = await db.collection('subjects').doc(subjectId).get();
      if (subjectDoc.exists) {
        const subjectData = subjectDoc.data();
        subjectsMap.set(subjectId, subjectData?.subjectName || subjectData?.name || subjectId);
      } else {
        // Try teacherSubjects
        const teacherSubjectDoc = await db.collection('teacherSubjects').doc(subjectId).get();
        if (teacherSubjectDoc.exists) {
          const tsData = teacherSubjectDoc.data();
          subjectsMap.set(subjectId, tsData?.subjectName || tsData?.name || subjectId);
        } else {
          subjectsMap.set(subjectId, subjectId);
        }
      }
    }
    
    // Group grades by subject
    const subjectsById = new Map();
    
    grades.forEach(grade => {
      const subjectId = grade.subjectId;
      const subjectName = subjectsMap.get(subjectId) || subjectId;
      
      if (!subjectsById.has(subjectId)) {
        subjectsById.set(subjectId, {
          subjectCode: subjectId,
          subjectName: subjectName,
          firstGrading: 0,
          secondGrading: 0,
          thirdGrading: 0,
          fourthGrading: 0,
          finalRating: 0,
          remarks: ''
        });
      }
      
      const subject = subjectsById.get(subjectId);
      
      // Map quarter to grading period
      const quarter = grade.quarter;
      if (quarter === 'Q1' || quarter === '1') {
        subject.firstGrading = grade.grade || 0;
      } else if (quarter === 'Q2' || quarter === '2') {
        subject.secondGrading = grade.grade || 0;
      } else if (quarter === 'Q3' || quarter === '3') {
        subject.thirdGrading = grade.grade || 0;
      } else if (quarter === 'Q4' || quarter === '4') {
        subject.fourthGrading = grade.grade || 0;
      }
    });
    
    // Calculate final ratings
    const sf10Subjects = Array.from(subjectsById.values()).map((subject: any) => {
      const grades = [subject.firstGrading, subject.secondGrading, subject.thirdGrading, subject.fourthGrading]
        .filter(g => g > 0);
      
      if (grades.length > 0) {
        subject.finalRating = Math.round(grades.reduce((a, b) => a + b, 0) / grades.length);
        subject.remarks = subject.finalRating >= 75 ? 'Passed' : 'Failed';
      }
      
      return subject;
    });
    
    // Calculate general average
    let generalAverage = 0;
    if (sf10Subjects.length > 0) {
      const finalRatings = sf10Subjects.map((s: any) => s.finalRating).filter(r => r > 0);
      if (finalRatings.length > 0) {
        generalAverage = Math.round(finalRatings.reduce((a, b) => a + b, 0) / finalRatings.length);
      }
    }
    
    // Check if SF10 already exists for this student and school year
    const existingSF10Query = db.collection('sf10')
      .where('studentId', '==', studentId)
      .where('schoolYear', '==', schoolYear);
    const existingSnapshot = await existingSF10Query.get();
    
    const yearRecord = student.academicRecords?.[schoolYear] || {};
    
    const sf10Record: any = {
      studentId,
      lrn: student.lrn || '',
      studentName: `${student.lastName || ''}, ${student.firstName || ''} ${student.middleName || ''}`.trim().replace(/\s+/g, ' ') || student.name || `Student ${studentId}`,
      schoolYear,
      gradeLevel: yearRecord.gradeLevel || student.currentGradeLevel || 'Unknown',
      section: yearRecord.section || student.currentSection || 'Default',
      subjects: sf10Subjects,
      generalAverage,
      status: generalAverage >= 75 ? 'promoted' : 'retained',
      dateCompleted: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: teacherId,
      adviserName: 'Teacher' // Could be fetched from teacher profile
    };
    
    let sf10Id: string;
    let isNewRecord = false;
    
    if (!existingSnapshot.empty) {
      // Update existing SF10
      const existingDoc = existingSnapshot.docs[0];
      sf10Id = existingDoc.id;
      await db.collection('sf10').doc(sf10Id).update({
        ...sf10Record,
        // Preserve original createdAt if it exists
        createdAt: existingDoc.data().createdAt || new Date().toISOString()
      });
      console.log('SF10 updated with ID:', sf10Id);
    } else {
      // Create new SF10
      sf10Record.createdAt = new Date().toISOString();
      sf10Record.createdBy = teacherId;
      const sf10Ref = await db.collection('sf10').add(sf10Record);
      sf10Id = sf10Ref.id;
      isNewRecord = true;
      console.log('SF10 created with ID:', sf10Id);
    }
    
    // Update student's academic record
    await studentRef.update({
      [`academicRecords.${schoolYear}.sf10`]: {
        id: sf10Id,
        ...sf10Record
      },
      updatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: isNewRecord ? 'SF10 generated successfully' : 'SF10 updated successfully',
      sf10: {
        id: sf10Id,
        ...sf10Record
      }
    });
    
  } catch (error) {
    console.error('Error generating SF10:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Failed to generate SF10',
        error: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
