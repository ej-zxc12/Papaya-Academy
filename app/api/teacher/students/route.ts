import { NextRequest, NextResponse } from 'next/server';
import { Student, StudentDocument } from '@/types';
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
    const section = searchParams.get('section');
    const gradeLevels = searchParams
      .getAll('gradeLevels')
      .filter(Boolean)
      .map((g) => g.trim())
      .filter(Boolean);
    const subjectId = searchParams.get('subjectId');
    const scope = searchParams.get('scope'); // 'school' to get all students, 'teacher' for teacher-specific

    const studentsCollection = collection(db, 'students');

    const { uid, id } = getTeacherIdentifiers(request);
    const teacherIdsToTry = Array.from(new Set([uid, id, teacherId].filter(Boolean))) as string[];

    if (teacherIdsToTry.length === 0) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // If scope is 'school', return all students without teacherId filter
    if (scope === 'school') {
      const baseConstraints: QueryConstraint[] = [];
      if (subjectId) {
        // Query for old structure (single subjectId)
        const oldConstraints: QueryConstraint[] = [where('subjectId', '==', subjectId)];
        const oldQuery = query(studentsCollection, ...oldConstraints);
        const oldSnapshot = await getDocs(oldQuery);
        
        // Query for new structure (subjectIds array)
        const newConstraints: QueryConstraint[] = [where('subjectIds', 'array-contains', subjectId)];
        const newQuery = query(studentsCollection, ...newConstraints);
        const newSnapshot = await getDocs(newQuery);
        
        const oldResults = oldSnapshot.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }));
        const newResults = newSnapshot.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }));
        
        // Combine and remove duplicates
        const combined = [...oldResults, ...newResults];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        
        const students = unique.map(({ id, data }) => ({
          id,
          name: data?.name || '',
          lrn: data?.lrn || '',
          gradeLevel: data?.currentGradeLevel || data?.gradeLevel,
          section: data?.currentSection || data?.section,
          currentGradeLevel: data?.currentGradeLevel,
          currentSection: data?.currentSection,
          teacherId: data?.teacherId,
          subjectId: data?.subjectId,
          subjectIds: data?.subjectIds || [],
          status: data?.status || 'enrolled',
          createdAt: data?.createdAt,
          updatedAt: data?.updatedAt
        }));

        return NextResponse.json(students);
      } else if (gradeLevels.length > 0) {
        if (gradeLevels.length > 10) {
          return NextResponse.json(
            { message: 'gradeLevels must contain at most 10 values' },
            { status: 400 }
          );
        }
        baseConstraints.push(where('gradeLevel', 'in', gradeLevels));
      } else {
        if (gradeLevel) {
          baseConstraints.push(where('gradeLevel', '==', gradeLevel));
        }
        if (section) {
          baseConstraints.push(where('section', '==', section));
        }
      }

      const q = query(studentsCollection, ...baseConstraints);
      const querySnapshot = await getDocs(q);
      const students = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data?.name || '',
          lrn: data?.lrn || '',
          gradeLevel: data?.currentGradeLevel || data?.gradeLevel,
          section: data?.currentSection || data?.section || '',
          currentGradeLevel: data?.currentGradeLevel,
          currentSection: data?.currentSection,
          teacherId: data?.teacherId,
          subjectId: data?.subjectId,
          subjectIds: data?.subjectIds || [],
          status: data?.status || 'enrolled',
          createdAt: data?.createdAt,
          updatedAt: data?.updatedAt
        };
      });

      return NextResponse.json(students);
    }

    // Add filters if provided
    const baseConstraints: QueryConstraint[] = [];
    if (subjectId) {
      // We'll handle subject filtering in the query section below
    } else if (gradeLevels.length > 0) {
      if (gradeLevels.length > 10) {
        return NextResponse.json(
          { message: 'gradeLevels must contain at most 10 values' },
          { status: 400 }
        );
      }
      baseConstraints.push(where('gradeLevel', 'in', gradeLevels));
    } else {
      if (gradeLevel) {
        baseConstraints.push(where('gradeLevel', '==', gradeLevel));
      }
      if (section) {
        baseConstraints.push(where('section', '==', section));
      }
    }

    const results = await Promise.all(
      teacherIdsToTry.map(async (tid) => {
        // For subject filtering, we need to handle both old and new structures
        if (subjectId) {
          // Query for old structure (single subjectId)
          const oldConstraints: QueryConstraint[] = [where('teacherId', '==', tid), where('subjectId', '==', subjectId)];
          const oldQuery = query(studentsCollection, ...oldConstraints);
          const oldSnapshot = await getDocs(oldQuery);
          
          // Query for new structure (subjectIds array)
          const newConstraints: QueryConstraint[] = [where('teacherId', '==', tid), where('subjectIds', 'array-contains', subjectId)];
          const newQuery = query(studentsCollection, ...newConstraints);
          const newSnapshot = await getDocs(newQuery);
          
          const oldResults = oldSnapshot.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }));
          const newResults = newSnapshot.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }));
          
          // Combine and remove duplicates
          const combined = [...oldResults, ...newResults];
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          return unique;
        } else {
          const constraints: QueryConstraint[] = [where('teacherId', '==', tid), ...baseConstraints];
          const q = query(studentsCollection, ...constraints);
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, data: docSnap.data() }));
        }
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
        name: data?.name || '',
        lrn: data?.lrn || '',
        gradeLevel: data?.currentGradeLevel || data?.gradeLevel,
        section: data?.currentSection || data?.section || '',
        currentGradeLevel: data?.currentGradeLevel,
        currentSection: data?.currentSection,
        teacherId: data?.teacherId,
        subjectId: data?.subjectId,
        subjectIds: data?.subjectIds || [],
        status: data?.status || 'enrolled',
        createdAt: data?.createdAt,
        updatedAt: data?.updatedAt
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
    const lrn = typeof body?.lrn === 'string' ? body.lrn.trim() : '';
    const gradeLevel = typeof body?.gradeLevel === 'string' ? body.gradeLevel.trim() : '';
    const section = typeof body?.section === 'string' ? body.section.trim() : '';
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

    // Normalize section for duplicate check (treat null, undefined, and empty string as equivalent)
    const normalizedSection = section || '';

    // Check if student already exists with same LRN (across ALL grade levels)
    // This prevents duplicates when a student moves to a different grade
    const existingStudentQuery = query(
      studentsCollection,
      where('lrn', '==', lrn)
    );
    
    const existingStudentSnapshot = await getDocs(existingStudentQuery);
    
    // Find matching student by name + LRN (same person regardless of grade)
    const matchingStudent = existingStudentSnapshot.docs.find(doc => {
      const data = doc.data();
      const docName = (data.name || '').trim().toLowerCase();
      const inputName = name.trim().toLowerCase();
      return docName === inputName;
    });
    
    if (matchingStudent) {
      // Student exists (same LRN + name found)
      const existingStudentData = matchingStudent.data();
      
      const existingSubjectIds = existingStudentData.subjectIds || [];
      
      // Merge new subject IDs with existing ones (avoid duplicates)
      const mergedSubjectIds = Array.from(new Set([...existingSubjectIds, ...subjectIds]));
      
      // Update the existing student - add the new teacher's ID to a teachers array if not present
      const existingTeachers = existingStudentData.teacherIds || [existingStudentData.teacherId].filter(Boolean);
      const updatedTeachers = existingTeachers.includes(teacherId) 
        ? existingTeachers 
        : [...existingTeachers, teacherId];
      
      // Check if grade level changed
      const existingGradeLevel = existingStudentData.currentGradeLevel || existingStudentData.gradeLevel;
      const gradeLevelChanged = existingGradeLevel !== gradeLevel;
      
      await import('firebase/firestore').then(({ updateDoc, doc }) => {
        const updateData: any = {
          subjectIds: mergedSubjectIds,
          teacherIds: updatedTeachers,
          updatedAt: Timestamp.now()
        };
        
        // If grade level changed, update it
        if (gradeLevelChanged) {
          updateData.gradeLevel = gradeLevel;
          updateData.currentGradeLevel = gradeLevel;
          updateData.section = section;
          updateData.currentSection = section;
          
          // Also update the academic record for the current school year
          const currentSchoolYear = '2024-2025'; // Could be passed as parameter
          updateData[`academicRecords.${currentSchoolYear}.gradeLevel`] = gradeLevel;
          updateData[`academicRecords.${currentSchoolYear}.section`] = section;
          updateData[`academicRecords.${currentSchoolYear}.updatedAt`] = Timestamp.now();
        }
        
        return updateDoc(doc(db, 'students', matchingStudent.id), updateData);
      });
      
      const updatedStudent = {
        id: matchingStudent.id,
        ...existingStudentData,
        subjectIds: mergedSubjectIds,
        teacherIds: updatedTeachers,
        gradeLevel: gradeLevelChanged ? gradeLevel : existingGradeLevel,
        currentGradeLevel: gradeLevelChanged ? gradeLevel : existingStudentData.currentGradeLevel,
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        message: gradeLevelChanged 
          ? `Student grade level updated from ${existingGradeLevel} to ${gradeLevel}`
          : `Student updated with ${subjectIds.length} additional subject(s). Total subjects: ${mergedSubjectIds.length}`,
        student: updatedStudent,
        isUpdate: true,
        gradeLevelChanged
      });
    }

    // Create a new student document if no existing student found
    const studentData = {
      name,
      lrn,
      gradeLevel,
      section,
      currentGradeLevel: gradeLevel,
      currentSection: section,
      teacherId,
      teacherIds: [teacherId], // Array of all teachers who have access to this student
      subjectIds, // Store all subject IDs in an array
      status: 'enrolled',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(studentsCollection, studentData);
    const newStudent = {
      id: docRef.id,
      ...studentData,
      createdAt: studentData.createdAt.toDate().toISOString(),
      updatedAt: studentData.updatedAt.toDate().toISOString()
    };

    return NextResponse.json({
      message: `Student created with ${subjectIds.length} subject(s) in single document`,
      student: newStudent
    });

  } catch (error) {
    console.error('Error adding student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}