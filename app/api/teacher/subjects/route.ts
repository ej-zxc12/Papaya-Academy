import { NextRequest, NextResponse } from 'next/server';
import { Subject } from '@/types';
import { db } from '@/lib/firebase';
import { addDoc, collection, getDocs, query, where, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { validateAndNormalizeSubject, normalizeSubjectName } from '@/lib/subject-utils';

// Mock subject data for higher grades (4-6) - replace with actual database
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
    const scope = searchParams.get('scope'); // 'school' to get all subjects
    const teacherUid = getTeacherUid(request) || teacherUidFromQuery || teacherIdFromQuery;

    if (!teacherUid) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // Fetch both subjects and teacherSubjects
    const subjectsCollection = collection(db, 'subjects');
    const teacherSubjectsCollection = collection(db, 'teacherSubjects');
    
    // If scope is 'school', fetch ALL subjects (from all teachers)
    if (scope === 'school') {
      const [allSubjectsSnap, allTeacherSubjectsSnap] = await Promise.all([
        getDocs(subjectsCollection),
        getDocs(teacherSubjectsCollection),
      ]);

      const subjects = allSubjectsSnap.docs.map((docSnap) => {
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

      const teacherSubjects = allTeacherSubjectsSnap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
        };
      });

      return NextResponse.json([...subjects, ...teacherSubjects]);
    }

    // Prefer the canonical key teacherUid; fall back to teacherId for older data.
    const [byUidSnap, byIdSnap, teacherSubjectsByIdSnap, teacherSubjectsByUidSnap] = await Promise.all([
      getDocs(query(subjectsCollection, where('teacherUid', '==', teacherUid))),
      getDocs(query(subjectsCollection, where('teacherId', '==', teacherUid))),
      getDocs(query(teacherSubjectsCollection, where('teacherId', '==', teacherUid))),
      getDocs(query(teacherSubjectsCollection, where('teacherUid', '==', teacherUid))),
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

    // Merge teacherSubjects data (which contains sections) - avoid duplicates
    const teacherSubjectsMap = new Map<string, any>();
    [...teacherSubjectsByIdSnap.docs, ...teacherSubjectsByUidSnap.docs].forEach((docSnap) => {
      teacherSubjectsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    });

    const teacherSubjects = Array.from(teacherSubjectsMap.values()).map((data) => {
      return {
        ...data,
      };
    });

    // Return only subjects and teacherSubjects data (no automatic generation)
    return NextResponse.json([...subjects, ...teacherSubjects]);

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
    const action = body?.action;

    // Handle 'addSection' action
    if (action === 'addSection') {
      const section = typeof body?.section === 'string' ? body.section.trim() : '';
      const subjectId = typeof body?.subjectId === 'string' ? body.subjectId.trim() : '';
      const gradeLevel = typeof body?.gradeLevel === 'string' ? body.gradeLevel.trim() : '';

      if (!section) {
        return NextResponse.json(
          { message: 'section is required' },
          { status: 400 }
        );
      }

      // If a subjectId is provided (and not 'global'), verify the subject belongs to the teacher
      if (subjectId && subjectId !== 'global') {
        const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
        if (!subjectDoc.exists()) {
          return NextResponse.json(
            { message: 'Subject not found' },
            { status: 404 }
          );
        }

        const subjectData = subjectDoc.data();
        if (subjectData.teacherId !== teacherUid && subjectData.teacherUid !== teacherUid) {
          return NextResponse.json(
            { message: 'Unauthorized - Subject does not belong to this teacher' },
            { status: 403 }
          );
        }
      }

      // Create or update teacherSubjects document with the section
      const teacherSubjectsCollection = collection(db, 'teacherSubjects');
      const q = query(
        teacherSubjectsCollection,
        where('teacherId', '==', teacherUid),
        where('section', '==', section)
      );
      const existingSnap = await getDocs(q);

      if (existingSnap.empty) {
        // Create new teacherSubject entry with this section
        await addDoc(teacherSubjectsCollection, {
          teacherId: teacherUid,
          teacherUid,
          subjectId: subjectId || 'global',
          section,
          gradeLevel, // Store gradeLevel
          schoolYear: '2024-2025',
          createdAt: new Date().toISOString()
        });
      } else {
        // If section already exists, update its gradeLevel if provided
        const docToUpdate = existingSnap.docs[0];
        await updateDoc(doc(db, 'teacherSubjects', docToUpdate.id), {
          gradeLevel,
          subjectId: subjectId || 'global'
        });
      }

      return NextResponse.json({
        message: 'Section added/updated successfully',
        section: { name: section, subjectId, gradeLevel }
      }, { status: 201 });
    }

    // Regular subject creation
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    
    // Grade levels and schoolYear are now optional in the new flexible approach
    const gradeLevelsFromBody = Array.isArray(body?.gradeLevels)
      ? body.gradeLevels.filter((g: any) => typeof g === 'string').map((g: string) => g.trim()).filter(Boolean)
      : [];
    const gradeLevelFromBody = typeof body?.gradeLevel === 'string' ? body.gradeLevel.trim() : '';
    const gradeLevels = gradeLevelsFromBody.length > 0
      ? Array.from(new Set(gradeLevelsFromBody))
      : (gradeLevelFromBody ? [gradeLevelFromBody] : []);
    const schoolYear = typeof body?.schoolYear === 'string' ? body.schoolYear.trim() : 'Global';

    if (!name || !code) {
      return NextResponse.json(
        { message: 'name and code are required' },
        { status: 400 }
      );
    }

    // Validate and normalize subject name
    const primaryGradeLevel = gradeLevels.length > 0 ? gradeLevels[0] : 'Flexible';
    const validation = validateAndNormalizeSubject(primaryGradeLevel, name);
    
    // Use normalized name
    const normalizedName = validation.normalizedName;
    
    // For grades 1-3, suggest the correct code if teacher uses a non-recommended one
    let finalCode = code;
    if (validation.isRecommended && validation.suggestedCode && code !== validation.suggestedCode) {
      // Auto-correct the code to match the recommended one
      finalCode = validation.suggestedCode;
    }

    const subjectsCollection = collection(db, 'subjects');
    const subjectData: any = {
      name: normalizedName,
      code: finalCode,
      gradeLevels: gradeLevels.length > 0 ? gradeLevels : ['Flexible'],
      gradeLevel: gradeLevels.length > 0 ? gradeLevels[0] : 'Flexible',
      teacherId: teacherUid,
      teacherUid,
      schoolYear
    };

    const docRef = await addDoc(subjectsCollection, subjectData);

    return NextResponse.json(
      {
        message: 'Subject created successfully',
        subject: { id: docRef.id, ...subjectData },
        validation: {
          originalName: name,
          normalizedName,
          originalCode: code,
          finalCode,
          isRecommended: validation.isRecommended,
          autoCorrected: name !== normalizedName || code !== finalCode
        }
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

export async function DELETE(request: NextRequest) {
  try {
    const teacherUid = getTeacherUid(request);
    if (!teacherUid) {
      return NextResponse.json(
        { message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    const sectionName = searchParams.get('sectionName');

    if (!sectionId && !sectionName) {
      return NextResponse.json(
        { message: 'sectionId or sectionName is required' },
        { status: 400 }
      );
    }

    const teacherSubjectsCollection = collection(db, 'teacherSubjects');
    
    // Check if there are students enrolled in this section
    const studentsCollection = collection(db, 'students');
    let studentsInSectionQuery;
    let targetSectionName = sectionName;
    
    if (sectionName) {
      studentsInSectionQuery = query(
        studentsCollection,
        where('section', '==', sectionName)
      );
    } else {
      // If we have sectionId, we need to get the section name first
      const sectionDoc = await getDoc(doc(db, 'teacherSubjects', sectionId!));
      if (!sectionDoc.exists()) {
        return NextResponse.json(
          { message: 'Section not found' },
          { status: 404 }
        );
      }
      const sectionData = sectionDoc.data();
      targetSectionName = sectionData.section;
      studentsInSectionQuery = query(
        studentsCollection,
        where('section', '==', targetSectionName)
      );
    }

    const studentsSnapshot = await getDocs(studentsInSectionQuery);
    
    if (!studentsSnapshot.empty) {
      return NextResponse.json(
        { 
          message: 'Cannot delete section. There are students enrolled in this section.',
          studentCount: studentsSnapshot.size
        },
        { status: 400 }
      );
    }

    // Delete the section from teacherSubjects
    if (sectionId) {
      const sectionDoc = await getDoc(doc(db, 'teacherSubjects', sectionId));
      if (!sectionDoc.exists()) {
        return NextResponse.json(
          { message: 'Section not found' },
          { status: 404 }
        );
      }

      const sectionData = sectionDoc.data();
      
      // Verify the section belongs to the teacher
      if (sectionData.teacherId !== teacherUid && sectionData.teacherUid !== teacherUid) {
        return NextResponse.json(
          { message: 'Unauthorized - Section does not belong to this teacher' },
          { status: 403 }
        );
      }

      await deleteDoc(doc(db, 'teacherSubjects', sectionId));
    } else if (sectionName) {
      // Find and delete by section name with teacher filtering
      const q = query(
        teacherSubjectsCollection,
        where('teacherId', '==', teacherUid),
        where('section', '==', sectionName)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Try with teacherUid as well
        const q2 = query(
          teacherSubjectsCollection,
          where('teacherUid', '==', teacherUid),
          where('section', '==', sectionName)
        );
        const snapshot2 = await getDocs(q2);
        
        if (snapshot2.empty) {
          return NextResponse.json(
            { message: 'Section not found or does not belong to you' },
            { status: 404 }
          );
        }
        
        // Delete all matching sections
        for (const docSnap of snapshot2.docs) {
          await deleteDoc(doc(db, 'teacherSubjects', docSnap.id));
        }
      } else {
        // Delete all matching sections (should typically be just one)
        for (const docSnap of snapshot.docs) {
          await deleteDoc(doc(db, 'teacherSubjects', docSnap.id));
        }
      }
    }

    return NextResponse.json({
      message: 'Section deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
